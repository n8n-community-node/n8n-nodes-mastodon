export const header = {
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
}