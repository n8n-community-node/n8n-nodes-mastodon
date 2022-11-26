import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
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
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			const executionData = await methods.execute.call(this, items, i);
			returnData.push(...executionData);
		}
		return this.prepareOutputData(returnData);
	}
}