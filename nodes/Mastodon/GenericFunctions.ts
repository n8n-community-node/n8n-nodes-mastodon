import { OptionsWithUrl } from 'request';
import { LoggerProxy as Logger } from 'n8n-workflow';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IBinaryKeyData,
	IDataObject,
	INodeExecutionData,
	NodeApiError,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';

export async function mastodonApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
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
		//@ts-ignore
		let responseData = await this.helpers.requestOAuth2.call(this, 'mastodonApi', options);
		Logger.debug(`[Mastodon] response: ${JSON.stringify(responseData)}`);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function mastodonApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
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

export async function uploadAttachments(
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
		let response: IDataObject = await mastodonApiRequest.call(this, 'POST', uploadUrl, {}, {}, {
			formData: attachmentBody,
		});
		Logger.debug(`[Mastodon] uploadResponse: ${JSON.stringify(response)}`);


		let response_url = response.url;
		if (response_url == null) {
			let attempts = 0;
			const mediaStatusUrl = `${url}/api/v1/media/${response.id}`;

			while (response_url == null && attempts < 10) 
			{
				await sleep(5000);
				Logger.debug(`[Mastodon] uploadStatusUrl: ${mediaStatusUrl}`);
				let getStatusResponse = await mastodonApiRequest.call(this, 'GET', mediaStatusUrl, {}, {}, {});
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
