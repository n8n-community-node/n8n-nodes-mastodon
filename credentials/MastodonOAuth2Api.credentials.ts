import { ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = [
	'read',
	'write',
];

export class MastodonOAuth2Api implements ICredentialType {
	name = 'mastodonOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Mastodon OAuth2 API';
	documentationUrl = 'https://docs.joinmastodon.org/api/guidelines/';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
			default: '',
			placeholder: 'https://mastodon.social/oauth/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mastodon.social/oauth/token',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			placeholder: 'AqFq3P2l_ptqshFjdFb_zcBc0Lti8o-eh6cmrTYF28g',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'CSryO36btT-jRtMZFBXulbQL2ezIM0aE7samRHoZsn0',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: scopes.join(' '),
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
			default: '',
			description:
				'For some services additional query parameters have to be set which can be defined here',
			placeholder: 'access_type=offline',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			options: [
				{
					name: 'Body',
					value: 'body',
					description: 'Send credentials in body',
				},
				{
					name: 'Header',
					value: 'header',
					description: 'Send credentials as Basic Auth header',
				},
			],
			default: 'header',
		},
	];
}
