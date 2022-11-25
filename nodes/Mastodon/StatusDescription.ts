import { INodeProperties } from 'n8n-workflow';

export const statusOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['statuses'],
			},
		},
		options: [
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
				name: 'Boost',
				value: 'boost',
				description: 'Boost a status',
				action: 'Boost a status',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Perform a search',
				action: 'Perform a search',
			},
		],
		default: 'create',
	},
];

export const statusFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                status:create                                */
	/* -------------------------------------------------------------------------- */
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
				resource: ['statuses'],
			},
		},
		description:
			'The text of the status update. URL encode as necessary. t.co link wrapping will affect character counts.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['statuses'],
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
			// {
			// 	displayName: 'Display Coordinates',
			// 	name: 'displayCoordinates',
			// 	type: 'boolean',
			// 	default: false,
			// 	description:
			// 		'Whether or not to put a pin on the exact coordinates a Tweet has been sent from',
			// },
			{
				displayName: 'In Reply to Status',
				name: 'inReplyToStatusId',
				type: 'string',
				default: '',
				description: 'The ID of an existing status that the update is in reply to',
			},
			// {
			// 	displayName: 'Location',
			// 	name: 'locationFieldsUi',
			// 	type: 'fixedCollection',
			// 	placeholder: 'Add Location',
			// 	default: {},
			// 	description: 'Subscriber location information.n',
			// 	options: [
			// 		{
			// 			name: 'locationFieldsValues',
			// 			displayName: 'Location',
			// 			values: [
			// 				{
			// 					displayName: 'Latitude',
			// 					name: 'latitude',
			// 					type: 'string',
			// 					required: true,
			// 					description: 'The location latitude',
			// 					default: '',
			// 				},
			// 				{
			// 					displayName: 'Longitude',
			// 					name: 'longitude',
			// 					type: 'string',
			// 					required: true,
			// 					description: 'The location longitude',
			// 					default: '',
			// 				},
			// 			],
			// 		},
			// 	],
			// },
			{
				displayName: 'Possibly Sensitive',
				name: 'possiblySensitive',
				type: 'boolean',
				default: false,
				description:
					'Whether you are uploading Tweet media that might be considered sensitive content such as nudity, or medical procedures',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                status:delete                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['statuses'],
			},
		},
		description: 'The ID of the status to delete',
	},

	/* -------------------------------------------------------------------------- */
	/*                                status:search                                */
	/* -------------------------------------------------------------------------- */
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
				resource: ['statuses'],
			},
		},
		description:
			'A UTF-8, URL-encoded search query of 500 characters maximum, including operators. Queries may additionally be limited by complexity. Check the searching examples <a href="https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators">here</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['statuses'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['statuses'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 20,
		description: 'Max number of results to return',
	},
	// {
	// 	displayName: 'Additional Fields',
	// 	name: 'additionalFields',
	// 	type: 'collection',
	// 	placeholder: 'Add Field',
	// 	default: {},
	// 	displayOptions: {
	// 		show: {
	// 			operation: ['search'],
	// 			resource: ['statuses'],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			displayName: 'Include Entities',
	// 			name: 'includeEntities',
	// 			type: 'boolean',
	// 			default: false,
	// 			description: 'Whether the entities node will be included',
	// 		},
	// 		{
	// 			displayName: 'Language Name or ID',
	// 			name: 'lang',
	// 			type: 'options',
	// 			typeOptions: {
	// 				loadOptionsMethod: 'getLanguages',
	// 			},
	// 			default: '',
	// 			description:
	// 				'Restricts tweets to the given language, given by an ISO 639-1 code. Language detection is best-effort. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	// 		},
	// 		{
	// 			displayName: 'Location',
	// 			name: 'locationFieldsUi',
	// 			type: 'fixedCollection',
	// 			placeholder: 'Add Location',
	// 			default: {},
	// 			description: 'Subscriber location information.n',
	// 			options: [
	// 				{
	// 					name: 'locationFieldsValues',
	// 					displayName: 'Location',
	// 					values: [
	// 						{
	// 							displayName: 'Latitude',
	// 							name: 'latitude',
	// 							type: 'string',
	// 							required: true,
	// 							description: 'The location latitude',
	// 							default: '',
	// 						},
	// 						{
	// 							displayName: 'Longitude',
	// 							name: 'longitude',
	// 							type: 'string',
	// 							required: true,
	// 							description: 'The location longitude',
	// 							default: '',
	// 						},
	// 						{
	// 							displayName: 'Radius',
	// 							name: 'radius',
	// 							type: 'options',
	// 							options: [
	// 								{
	// 									name: 'Milles',
	// 									value: 'mi',
	// 								},
	// 								{
	// 									name: 'Kilometers',
	// 									value: 'km',
	// 								},
	// 							],
	// 							required: true,
	// 							description:
	// 								'Returns tweets by users located within a given radius of the given latitude/longitude',
	// 							default: '',
	// 						},
	// 						{
	// 							displayName: 'Distance',
	// 							name: 'distance',
	// 							type: 'number',
	// 							typeOptions: {
	// 								minValue: 0,
	// 							},
	// 							required: true,
	// 							default: '',
	// 						},
	// 					],
	// 				},
	// 			],
	// 		},
	// 		{
	// 			displayName: 'Result Type',
	// 			name: 'resultType',
	// 			type: 'options',
	// 			options: [
	// 				{
	// 					name: 'Mixed',
	// 					value: 'mixed',
	// 					description: 'Include both popular and real time results in the response',
	// 				},
	// 				{
	// 					name: 'Recent',
	// 					value: 'recent',
	// 					description: 'Return only the most recent results in the response',
	// 				},
	// 				{
	// 					name: 'Popular',
	// 					value: 'popular',
	// 					description: 'Return only the most popular results in the response',
	// 				},
	// 			],
	// 			default: 'mixed',
	// 			description: 'Specifies what type of search results you would prefer to receive',
	// 		},
	// 		{
	// 			displayName: 'Tweet Mode',
	// 			name: 'tweetMode',
	// 			type: 'options',
	// 			options: [
	// 				{
	// 					name: 'Compatibility',
	// 					value: 'compat',
	// 				},
	// 				{
	// 					name: 'Extended',
	// 					value: 'extended',
	// 				},
	// 			],
	// 			default: 'compat',
	// 			description:
	// 				'When the extended mode is selected, the response contains the entire untruncated text of the Tweet',
	// 		},
	// 		{
	// 			displayName: 'Until',
	// 			name: 'until',
	// 			type: 'dateTime',
	// 			default: '',
	// 			description: 'Returns tweets created before the given date',
	// 		},
	// 	],
	// },

	/* -------------------------------------------------------------------------- */
	/*                                status:favourite                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['like'],
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
	// 			operation: ['like'],
	// 			resource: ['tweet'],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			displayName: 'Include Entities',
	// 			name: 'includeEntities',
	// 			type: 'boolean',
	// 			default: false,
	// 			description: 'Whether the entities will be omitted',
	// 		},
	// 	],
	// },

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
