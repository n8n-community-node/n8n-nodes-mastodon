import { INodeProperties, isINodeProperties } from "n8n-workflow";

export const properties = {

	// ------------------------------------------------------------------
	url: {
		displayName: 'Mastodon URL',
		name: 'url',
		type: 'string',
		default: '',
		placeholder: 'https://mastodon.example',
		required: true,
	} as INodeProperties,

	// ------------------------------------------------------------------
	resources: {
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
		default: 'status',
	} as INodeProperties,

	// ------------------------------------------------------------------
	operations: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['status'],
			},
		},
		options: [
			{
				name: 'Boost',
				value: 'boost',
				description: 'Boost a status',
				action: 'Boost a status',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Publish new status',
				action: 'Publish new status',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a status',
				action: 'Delete a status',
			},
			{
				name: 'Favourite',
				value: 'favourite',
				description: 'Favourite a status',
				action: 'Favourite a status',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Perform a search',
				action: 'Perform a search',
			},
		],
		default: 'create',
	} as INodeProperties,

	// ------------------------------------------------------------------
	createFields: [
		{
			displayName: 'Text',
			name: 'text',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			displayOptions: {
				show: {
					operation: ['create'],
					resource: ['status'],
				},
			},
			description:
				'The text of the status update. URL encode as necessary. t.co link wrapping will affect character counts.',
		} as INodeProperties,
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			displayOptions: {
				show: {
					operation: ['create'],
					resource: ['status'],
				},
			},
			options: [
				{
					displayName: 'Attachments',
					name: 'attachments',
					type: 'string',
					default: 'data',
					description:
						'Name of the binary properties which contain data which should be added to tweet as attachment. Multiple ones can be comma-separated.',
				},
				{
					displayName: 'In Reply to Status',
					name: 'inReplyToStatusId',
					type: 'string',
					default: '',
					description: 'The ID of an existing status that the update is in reply to',
				},
				{
					displayName: 'Possibly Sensitive',
					name: 'possiblySensitive',
					type: 'boolean',
					default: false,
					description:
						'Whether you are uploading Tweet media that might be considered sensitive content such as nudity, or medical procedures',
				},
				{
					displayName: 'Content Warning',
					name: 'spoilerText',
					type: 'string',
					default: '',
					description:
						'Text to be shown as a warning or subject before the actual content',
				},
			],
		} as INodeProperties,
	],

	// ------------------------------------------------------------------
	deleteFields: [
		{
			displayName: 'Status ID',
			name: 'statusId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					operation: ['delete'],
					resource: ['status'],
				},
			},
			description: 'The ID of the status to delete',
		} as INodeProperties,
	],

	// ------------------------------------------------------------------
	searchFields: [
		{
			displayName: 'Search Text',
			name: 'searchText',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			displayOptions: {
				show: {
					operation: ['search'],
					resource: ['status'],
				},
			},
			description:
				'A UTF-8, URL-encoded search query of 500 characters maximum, including operators. Queries may additionally be limited by complexity. Check the searching examples <a href="https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators">here</a>.',
		} as INodeProperties,
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: {
				show: {
					operation: ['search'],
					resource: ['status'],
				},
			},
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		} as INodeProperties,
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					operation: ['search'],
					resource: ['status'],
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			description: 'Max number of results to return',
		} as INodeProperties,
	],

	// ------------------------------------------------------------------
	favouriteFields: [
		{
			displayName: 'Status ID',
			name: 'statusId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					operation: ['favourite'],
					resource: ['status'],
				},
			},
			description: 'The ID of the status',
		} as INodeProperties,
	],

	// ------------------------------------------------------------------
	boostFields: [
		{
			displayName: 'Status ID',
			name: 'statusId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					operation: ['boost'],
					resource: ['status'],
				},
			},
			description: 'The ID of the status',
		} as INodeProperties,
	],
};
