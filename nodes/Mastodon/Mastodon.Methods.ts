import { IBinaryKeyData, IDataObject, IExecuteFunctions, INodeExecutionData, NodeApiError, NodeOperationError, sleep } from "n8n-workflow";
import { OptionsWithUrl } from "request-promise-native";
import { IStatus } from "./StatusInterface";
import { LoggerProxy as Logger } from "n8n-workflow";

export const methods = {

    // ------------------------------------------------------------------
    create: async function (this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
        const text = this.getNodeParameter('text', i) as string;
        const additionalFields = this.getNodeParameter('additionalFields', i) as any;
        const body: IStatus = {
            status: text,
        };

        if (additionalFields.inReplyToStatusId) {
            body.in_reply_to_id = additionalFields.inReplyToStatusId as string;
        }

        if (additionalFields.attachments) {
            const attachments = additionalFields.attachments as string;

            const attachmentProperties: string[] = attachments.split(',').map((propertyName) => {
                return propertyName.trim();
            });

            const medias = await _private.uploadAttachments.call(this, baseUrl, attachmentProperties, items, i);

            body["media_ids[]"] = (medias as IDataObject[])
                .map((media: IDataObject) => media.id as string)
                .join(',');
        }

        if (additionalFields.possiblySensitive) {
            body.sensitive = additionalFields.possiblySensitive as boolean;
        }

        return await _private.mastodonApiRequest.call(
            this,
            'POST',
            `${baseUrl}/api/v1/statuses`,
            {},
            body as unknown as IDataObject,
        );
    },

    // ------------------------------------------------------------------
    delete: async function (this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
        const statusId = this.getNodeParameter('statusId', i) as string;
        return await _private.mastodonApiRequest.call(
            this,
            'DELETE',
            `${baseUrl}/api/v1/statuses/${statusId}`,
            {},
            {},
        );
    },

    // ------------------------------------------------------------------
    search: async function (this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
        const q = this.getNodeParameter('searchText', i) as string;
        const returnAll = this.getNodeParameter('returnAll', i);
        const additionalFields = this.getNodeParameter('additionalFields', i) as any;
        const qs: IDataObject = {
            q,
        };

        if (additionalFields.includeEntities) {
            qs.include_entities = additionalFields.includeEntities as boolean;
        }

        if (additionalFields.resultType) {
            qs.response_type = additionalFields.resultType as string;
        }

        if (additionalFields.until) {
            qs.until = additionalFields.until as string;
        }

        if (additionalFields.lang) {
            qs.lang = additionalFields.lang as string;
        }

        if (additionalFields.locationFieldsUi) {
            const locationUi = additionalFields.locationFieldsUi as IDataObject;
            if (locationUi.locationFieldsValues) {
                const values = locationUi.locationFieldsValues as IDataObject;
                qs.geocode = `${values.latitude as string},${values.longitude as string},${values.distance
                    }${values.radius}`;
            }
        }

        qs.tweet_mode = additionalFields.tweetMode || 'compat';

        if (returnAll) {
            return await _private.mastodonApiRequestAllItems.call(
                this,
                'statuses',
                'GET',
                '/search/tweets.json',
                {},
                qs,
            );
        } else {
            qs.count = this.getNodeParameter('limit', 0);
            return await _private.mastodonApiRequest.call(
                this,
                'GET',
                '/search/tweets.json',
                {},
                qs,
            );
        }
    },

    // ------------------------------------------------------------------
    favourite: async function (this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
        const statusId = this.getNodeParameter('statusId', i) as string;
        const additionalFields = this.getNodeParameter('additionalFields', i) as any;

        const qs: IDataObject = {
            id: statusId,
        };

        if (additionalFields.includeEntities) {
            qs.include_entities = additionalFields.includeEntities as boolean;
        }

        return await _private.mastodonApiRequest.call(
            this,
            'POST',
            '/favorites/create.json',
            {},
            qs,
        );
    },

    // ------------------------------------------------------------------
    boost: async function (this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
        const statusId = this.getNodeParameter('tweetId', i) as string;
        const additionalFields = this.getNodeParameter('additionalFields', i);

        const qs: IDataObject = {
            id: statusId,
        };

        return await _private.mastodonApiRequest.call(
            this,
            'POST',
            `/statuses/retweet/${statusId}.json`,
            {},
            qs,
        );
    },
};

const _private = {

    // ------------------------------------------------------------------
    mastodonApiRequest: async function mastodonApiRequest(this: IExecuteFunctions,
        method: string,
        endpoint: string,
        body: any = {},
        qs: IDataObject = {},
        option: IDataObject = {}
    ): Promise<any> {

        let options: OptionsWithUrl = {
            method,
            body,
            qs,
            url: endpoint,
            json: true,
        };

        try {
            if (Object.keys(option).length !== 0) {
                options = Object.assign({}, options, option);
            }
            if (Object.keys(body).length === 0) {
                delete options.body;
            }
            if (Object.keys(qs).length === 0) {
                delete options.qs;
            }

            Logger.debug(`[Mastodon] request: ${JSON.stringify(options)}`);
            //@ts-ignore
            let responseData = await this.helpers.requestOAuth2.call(this, 'mastodonApi', options);
            Logger.debug(`[Mastodon] response: ${JSON.stringify(responseData)}`);
            return responseData;
        } catch (error) {
            throw new NodeApiError(this.getNode(), error);
        }
    },

    // ------------------------------------------------------------------
    mastodonApiRequestAllItems: async function mastodonApiRequestAllItems(
        this: IExecuteFunctions,
        propertyName: string,
        method: string,
        endpoint: string,
        body: any = {},
        query: IDataObject = {},
    ): Promise<any> {

        const returnData: IDataObject[] = [];
        let responseData;
        query.count = 100;
        do {
            responseData = await _private.mastodonApiRequest.call(this, method, endpoint, body, query);
            query.since_id = responseData.search_metadata.max_id;
            returnData.push.apply(returnData, responseData[propertyName]);
        } while (responseData.search_metadata && responseData.search_metadata.next_results);

        return returnData;
    },

    // ------------------------------------------------------------------
    uploadAttachments: async function uploadAttachments(
        this: IExecuteFunctions,
        url: string,
        binaryProperties: string[],
        items: INodeExecutionData[],
        i: number,
    ) {

        const uploadUrl = `${url}/api/v2/media`;
        const media: IDataObject[] = [];

        for (const binaryPropertyName of binaryProperties) {
            const binaryKeyData = items[i].binary as IBinaryKeyData;

            if (binaryKeyData === undefined) {
                throw new NodeOperationError(
                    this.getNode(),
                    'No binary data set. So file can not be written!',
                    { itemIndex: i },
                );
            }

            if (!binaryKeyData[binaryPropertyName]) {
                continue;
            }

            const binaryData = binaryKeyData[binaryPropertyName];
            const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
            var file = {
                value: buffer,
                options: {
                    filename: binaryData.fileName,
                    contentType: binaryData.mimeType,
                    mimeType: binaryData.mimeType,
                },
            }
            let attachmentBody = { file: file };
            let response: IDataObject = await _private.mastodonApiRequest.call(this, 'POST', uploadUrl, {}, {}, {
                formData: attachmentBody,
            });
            Logger.debug(`[Mastodon] uploadResponse: ${JSON.stringify(response)}`);


            let response_url = response.url;
            if (response_url == null) {
                let attempts = 0;
                const mediaStatusUrl = `${url}/api/v1/media/${response.id}`;

                while (response_url == null && attempts < 10) {
                    await sleep(5000);
                    Logger.debug(`[Mastodon] uploadStatusUrl: ${mediaStatusUrl}`);
                    let getStatusResponse = await _private.mastodonApiRequest.call(this, 'GET', mediaStatusUrl, {}, {}, {});
                    Logger.debug(`[Mastodon] uploadStatusResponse: ${JSON.stringify(getStatusResponse)}`);
                    response_url = getStatusResponse.url;
                    attempts++;
                }
                if (response_url == null) {
                    throw new NodeOperationError(
                        this.getNode(),
                        'Unable to upload media to Mastodon',
                        { itemIndex: i },
                    );
                }
            }
            media.push(response);
            return media;
        }
    }
}