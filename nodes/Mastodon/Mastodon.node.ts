import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { IDataObject, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';
import { statusFields, statusOperations } from './StatusDescription';
import { IStatus } from './StatusInterface';
import { mastodonApiRequest, mastodonApiRequestAllItems, uploadAttachments } from './GenericFunctions';

export class Mastodon implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mastodon',
		name: 'mastodon',
		icon: 'file:Mastodon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Mastodon API',
		defaults: {
			name: 'Mastodon',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mastodonApi',
				required: false,
			},
		],
		requestDefaults: {
			baseURL: 'https://mastodon.example',
			url: '/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Mastodon URL',
				name: 'url',
				type: 'string',
				default: 'https://mastodon.example',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Statuses',
						value: 'statuses',
					},
				],
				default: 'statuses',
			},
			...statusOperations,
			...statusFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const url = this.getNodeParameter('url', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'statuses') {
					if (operation === 'create') {
						const text = this.getNodeParameter('text', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;
						const body: IStatus = {
							status: text,
						};

						if (additionalFields.inReplyToStatusId) {
							body.in_reply_to_id = additionalFields.inReplyToStatusId as string;
							//body.auto_populate_reply_metadata = true;
						}

						if (additionalFields.attachments) {
							const attachments = additionalFields.attachments as string;

							const attachmentProperties: string[] = attachments.split(',').map((propertyName) => {
								return propertyName.trim();
							});

							const medias = await uploadAttachments.call(this, url, attachmentProperties, items, i);

							body["media_ids[]"] = (medias as IDataObject[])
								.map((media: IDataObject) => media.id as string)
								.join(',');
						}

						if (additionalFields.possiblySensitive) {
							body.sensitive = additionalFields.possiblySensitive as boolean;
						}

						responseData = await mastodonApiRequest.call(
							this,
							'POST',
							`${url}/api/v1/${resource}`,
							{},
							body as unknown as IDataObject,
						);
					}
					// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-destroy-id
					if (operation === 'delete') {
						const statusId = this.getNodeParameter('statusId', i) as string;

						responseData = await mastodonApiRequest.call(
							this,
							'DELETE',
							`${url}/api/v1/${resource}/${statusId}`,
							{},
							{},
						);
					}
					// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
					if (operation === 'search') {
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
							responseData = await mastodonApiRequestAllItems.call(
								this,
								'statuses',
								'GET',
								'/search/tweets.json',
								{},
								qs,
							);
						} else {
							qs.count = this.getNodeParameter('limit', 0);
							responseData = await mastodonApiRequest.call(
								this,
								'GET',
								'/search/tweets.json',
								{},
								qs,
							);
							responseData = responseData.statuses;
						}
					}
					//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-favorites-create
					if (operation === 'like') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;

						const qs: IDataObject = {
							id: statusId,
						};

						if (additionalFields.includeEntities) {
							qs.include_entities = additionalFields.includeEntities as boolean;
						}

						responseData = await mastodonApiRequest.call(
							this,
							'POST',
							'/favorites/create.json',
							{},
							qs,
						);
					}
					//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-retweet-id
					if (operation === 'retweet') {
						const statusId = this.getNodeParameter('tweetId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						const qs: IDataObject = {
							id: statusId,
						};

						// if (additionalFields.trimUser) {
						// 	qs.trim_user = additionalFields.trimUser as boolean;
						// }

						responseData = await mastodonApiRequest.call(
							this,
							'POST',
							`/statuses/retweet/${statusId}.json`,
							{},
							qs,
						);
					}
				}
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = {
						json: {
							error: (error as JsonObject).message,
						},
					};
					returnData.push(executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}