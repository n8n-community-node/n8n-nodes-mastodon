import { INodeProperties } from 'n8n-workflow';

export const statusFields: INodeProperties[] = [

	/* -------------------------------------------------------------------------- */
	/*                                status:boost                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['boost'],
				resource: ['statuses'],
			},
		},
		description: 'The ID of the status',
	},
	// {
	// 	displayName: 'Additional Fields',
	// 	name: 'additionalFields',
	// 	type: 'collection',
	// 	placeholder: 'Add Field',
	// 	default: {},
	// 	displayOptions: {
	// 		show: {
	// 			operation: ['retweet'],
	// 			resource: ['tweet'],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			displayName: 'Trim User',
	// 			name: 'trimUser',
	// 			type: 'boolean',
	// 			default: false,
	// 			description:
	// 				'Whether each tweet returned in a timeline will include a user object including only the status authors numerical ID',
	// 		},
	// 	],
	// },
];
