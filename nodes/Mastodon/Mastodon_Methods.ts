import { IBinaryKeyData, IDataObject, IExecuteFunctions, INodeExecutionData, JsonObject, NodeApiError, NodeExecutionWithMetadata, NodeOperationError, sleep } from "n8n-workflow";
import { OptionsWithUrl } from "request-promise-native";
import { IStatus } from "./StatusInterface";
import { LoggerProxy as Logger } from "n8n-workflow";

export const methods = {

	// ------------------------------------------------------------------
	execute: async function execute(this: IExecuteFunctions, items: INodeExecutionData[], i: number): Promise<NodeExecutionWithMetadata[]> {

		const url = this.getNodeParameter('url', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const resourceOperation = `${resource}-${operation}`;
		try {
			let responseData;
			switch (resourceOperation) {
				case 'status-create':
					responseData = await methods.create.call(this, url, items, i);
					return getExecutionData.call(this, responseData, i);
				case 'status-delete':
					responseData = await methods.delete.call(this, url, items, i);
					return getExecutionData.call(this, responseData, i);
				case 'status-search':
					responseData = await methods.search.call(this, url, items, i);
					return getExecutionData.call(this, responseData, i);
				case 'status-favourite':
					responseData = await methods.favourite.call(this, url, items, i);
					return getExecutionData.call(this, responseData, i);
				case 'status-boost':
					responseData = await methods.boost.call(this, url, items, i);
					return getExecutionData.call(this, responseData, i);
				default:
					throw new Error(`The resource "${resource}" is not known!`);
			}
		} catch (error) {
			if (this.continueOnFail()) {
				const executionErrorData = {
					json: {
						error: (error as JsonObject).message,
					},
				} as unknown as NodeExecutionWithMetadata[];
				return executionErrorData;
			}
			throw error;
		}
	},

	// ------------------------------------------------------------------
	create: async function create(this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
		const text = this.getNodeParameter('text', i) as string;
		// tslint:disable-next-line:no-any
		const additionalFields = this.getNodeParameter('additionalFields', i) as any;
		const body: IStatus = {
			status: text,
		};

		if (additionalFields.inReplyToStatusId) {
			body.in_reply_to_id = additionalFields.inReplyToStatusId as string;
		}

		if (additionalFields.spoilerText) {
			body.spoiler_text = additionalFields.spoilerText as string;
		}

		if (additionalFields.attachments) {
			const attachments = additionalFields.attachments as string;

			const attachmentProperties: string[] = attachments.split(',').map((propertyName) => {
				return propertyName.trim();
			});

			const medias = await uploadAttachments.call(this, baseUrl, attachmentProperties, items, i);

			body["media_ids[]"] = (medias as IDataObject[])
				.map((media: IDataObject) => media.id as string)
				.join(',');
		}

		if (additionalFields.possiblySensitive) {
			body.sensitive = additionalFields.possiblySensitive as boolean;
		}

		return await mastodonApiRequest.call(
			this,
			'POST',
			`${baseUrl}/api/v1/statuses`,
			{},
			body as unknown as IDataObject,
		);
	},

	// ------------------------------------------------------------------
	delete: async function deleteFunc(this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
		const statusId = this.getNodeParameter('statusId', i) as string;
		return await mastodonApiRequest.call(
			this,
			'DELETE',
			`${baseUrl}/api/v1/statuses/${statusId}`,
		);
	},

	// ------------------------------------------------------------------
	search: async function search(this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
		const q = this.getNodeParameter('searchText', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i);
		const qs: IDataObject = {
			q,
		};

		if (returnAll) {
			return await mastodonApiRequestAllItems.call(
				this,
				'statuses',
				'GET',
				`${baseUrl}/api/v2/search`,
				{},
				qs,
			);
		} else {
			qs.limit = this.getNodeParameter('limit', 0);
			return await mastodonApiRequest.call(
				this,
				'GET',
				`${baseUrl}/api/v2/search`,
				{},
				qs,
			);
		}
	},

	// ------------------------------------------------------------------
	favourite: async function favourite(this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
		const statusId = this.getNodeParameter('statusId', i) as string;

		return await mastodonApiRequest.call(
			this,
			'POST',
			`${baseUrl}/api/v1/statuses/${statusId}/favourite`,
		);
	},

	// ------------------------------------------------------------------
	boost: async function boost(this: IExecuteFunctions, baseUrl: string, items: INodeExecutionData[], i: number) {
		const statusId = this.getNodeParameter('statusId', i) as string;

		return await mastodonApiRequest.call(
			this,
			'POST',
			`${baseUrl}/api/v1/statuses/${statusId}/reblog`,
		);
	},
};

// ------------------------------------------------------------------
async function mastodonApiRequest(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	// tslint:disable-next-line:no-any
	body: any = {},
	qs: IDataObject = {},
	option: IDataObject = {},
// tslint:disable-next-line:no-any
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
		const responseData = await this.helpers.requestOAuth2.call(this, 'mastodonOAuth2Api', options);
		Logger.debug(`[Mastodon] response: ${JSON.stringify(responseData)}`);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

// ------------------------------------------------------------------
async function mastodonApiRequestAllItems(
	this: IExecuteFunctions,
	propertyName: string,
	method: string,
	endpoint: string,
	// tslint:disable-next-line:no-any
	body: any = {},
	query: IDataObject = {},
// tslint:disable-next-line:no-any
): Promise<any> {

	const returnData: IDataObject[] = [];
	let responseData;
	query.count = 100;
	do {
		responseData = await mastodonApiRequest.call(this, method, endpoint, body, query);
		query.since_id = responseData.search_metadata.max_id;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (responseData.search_metadata && responseData.search_metadata.next_results);

	return returnData;
}

// ------------------------------------------------------------------
async function uploadAttachments(
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
		const file = {
			value: buffer,
			options: {
				filename: binaryData.fileName,
				contentType: binaryData.mimeType,
				mimeType: binaryData.mimeType,
			},
		};
		const attachmentBody = { file };
		const response: IDataObject = await mastodonApiRequest.call(this, 'POST', uploadUrl, {}, {}, {
			formData: attachmentBody,
		});
		Logger.debug(`[Mastodon] uploadResponse: ${JSON.stringify(response)}`);


		let responseUrl = response.url;
		if (responseUrl == null) {
			let attempts = 0;
			const mediaStatusUrl = `${url}/api/v1/media/${response.id}`;

			while (responseUrl == null && attempts < 10) {
				await sleep(5000);
				Logger.debug(`[Mastodon] uploadStatusUrl: ${mediaStatusUrl}`);
				const getStatusResponse = await mastodonApiRequest.call(this, 'GET', mediaStatusUrl, {}, {}, {});
				Logger.debug(`[Mastodon] uploadStatusResponse: ${JSON.stringify(getStatusResponse)}`);
				responseUrl = getStatusResponse.url;
				attempts++;
			}
			if (responseUrl == null) {
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

// tslint:disable-next-line:no-any
function getExecutionData(this: IExecuteFunctions, responseData: any, i: number): NodeExecutionWithMetadata[] {
	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);
}
