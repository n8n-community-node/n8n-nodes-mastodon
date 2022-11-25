import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { header } from './Mastodon.Header';
import { properties } from './Mastodon.Properties';
import { methods } from './Mastodon.Methods';

export class Mastodon implements INodeType {
	description: INodeTypeDescription = {
		...header,
		properties: [
			properties.url,
			properties.resources,
			properties.operations,
			...properties.createFields,
			...properties.deleteFields,
			...properties.searchFields,
			...properties.favouriteFields,
			...properties.boostFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const url = this.getNodeParameter('url', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const resourceOperation = `${resource}-${operation}`;
		
		const items = this.getInputData();
		const length = items.length;
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < length; i++) {
			try {
				let responseData: any;
				switch (resourceOperation) {
					case 'statuses-create':
						responseData = methods.create.call(this, url, items, i);
						break;
					case 'statuses-delete':
						responseData = methods.delete.call(this, url, items, i);
						break;
					case 'statuses-search':
						responseData = methods.search.call(this, url, items, i);
						break;
					case 'statuses-favourite':
						responseData = methods.favourite.call(this, url, items, i);
						break;
					case 'statuses-boost':
						responseData = methods.boost.call(this, url, items, i);
						break;
					default:
						throw new Error(`The resource "${resource}" is not known!`);
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