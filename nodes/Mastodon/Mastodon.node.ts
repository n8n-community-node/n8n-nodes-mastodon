import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { properties } from './Mastodon_Properties';
import { methods } from './Mastodon_Methods';

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
				name: 'mastodonOAuth2Api',
				required: false,
			},
		],
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