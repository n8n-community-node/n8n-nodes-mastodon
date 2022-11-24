import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { statusFields, statusOperations } from './StatusDescription';

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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Status',
						value: 'status',
					},
				],
				default: 'httpVerb',
			},
            ...statusOperations,
            ...statusFields,
		],
	};
}