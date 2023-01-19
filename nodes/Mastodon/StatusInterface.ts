export interface IStatus {
	"media_ids[]"?: string;
	sensitive?: boolean;
	status: string;
	in_reply_to_id?: string;
	spoiler_text?: string;
}
