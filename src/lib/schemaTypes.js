/* @flow */

export type Entity = {
	counts?: { [key: string]: number };
	createTime: number;
	id: string;
	meta?: Object;
	name?: string;
	params?: Object;
	tags?: Array<number>;
	type: number;
	updateTime: number;
}

export type User = Entity & {
	deleteTime?: number;
	identities: Array<string>;
	locale?: number;
	params?: {
		email?: {
			notifications?: boolean;
			frequency?: 'daily' | 'never';
		}
	};
	presence?: number;
	presenceTime?: number;
	resources?: { [key: string]: number };
	timezone?: number;
}

export type Item = Entity & {
	body: string;
	creator: string;
	deleteTime?: number;
	parents: Array<string>;
	score?: number;
	updater: string;
}

export type Room = Item & {
	identities: Array<string>;
}

export type Text = Item

export type Thread = Item & {
	name: string;
	score: number;
}

export type Topic = Item

export type Priv = Item

export type Relation = {
	admin?: boolean;
	expireTime?: number;
	interest?: number;
	item: string;
	message?: string;
	presence?: number;
	presenceTime?: number;
	resources?: { [key: string]: number };
	roles?: Array<number>;
	createTime: number;
	updateTime: number;
	tags?: Array<string>;
	transitRole?: number;
	transitType?: number;
	type: number;
	user: string;
}

export type RoomRel = Relation

export type TextRel = Relation

export type ThreadRel = Relation

export type TopicRel = Relation

export type PrivRel = Relation

export type Note = {
	count: number;
	data: {
		body: string;
		creator: string;
		id: string;
		link: string;
		picture?: string;
		room?: string;
		thread?: string;
		title: string;
		type: 'reply' | 'mention' | 'thread';
	};
	createTime: number;
	dismissTime: number;
	event: number;
	group: string;
	id: string;
	readTime: number;
	score: number;
	type: number;
	updateTime: number;
	user: string;
}
