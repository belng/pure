/* @flow */

export const TYPE_ITEM = 0;
export const TYPE_ROOM = 1;
export const TYPE_TEXT = 2;
export const TYPE_THREAD = 3;
export const TYPE_TOPIC = 4;
export const TYPE_PRIV = 5;
export const TYPE_USER = 10;
export const TYPE_REL = 20;
export const TYPE_ROOMREL = 21;
export const TYPE_TEXTREL = 22;
export const TYPE_THREADREL = 23;
export const TYPE_TOPICREL = 24;
export const TYPE_PRIVREL = 25;
export const TYPE_USERREL = 30;
export const TYPE_NOTE = 40;

export const ROLE_BANNED = -1;
export const ROLE_NONE = 0;
export const ROLE_VISITOR = 1;
export const ROLE_MENTIONED = 2;
export const ROLE_FOLLOWER = 3;
export const ROLE_MODERATOR = 4;
export const ROLE_OWNER = 5;

export const STATUS_NONE = 0;
export const STATUS_BG = 1;
export const STATUS_FG = 2;
export const STATUS_READING = 3;
export const STATUS_WRITING = 4;

export const TRANSIT_REQUEST = 1;
export const TRANSIT_INVITE = 2;
export const TRANSIT_RESTORE = 3;

export const TAG_POST_HIDDEN = -1;
export const TAG_POST_STICKY = 1;
export const TAG_USER_GUEST = 10;
export const TAG_USER_EMAIL = 11;
export const TAG_USER_FACEBOOK = 12;
export const TAG_USER_GOOGLE = 13;
export const TAG_USER_TWITTER = 14;
export const TAG_USER_GCM = 15;
export const TAG_USER_APN = 16;
export const TAG_USER_WNS = 17;
export const TAG_ROOM_CITY = 21;
export const TAG_ROOM_AREA = 22;
export const TAG_ROOM_SPOT = 23;
export const TAG_REL_LIKE = 31;
export const TAG_REL_FLAG = 32;
export const TAG_REL_MUTE = 33;

export const PRESENCE_FOREGROUND = 1;
export const PRESENCE_BACKGROUND = 2;
export const PRESENCE_NONE = 0;

export const NOTE_MENTION = 1;
export const NOTE_REQUEST = 2;
export const NOTE_INVITE = 3;

export const JOB_EMAIL_WELCOME = 1;
export const JOB_EMAIL_MENTION = 2;
export const JOB_EMAIL_DIGEST = 3;

export const APP_PRIORITIES = {
	AUTHENTICATION_FACEBOOK: 900,
	AUTHENTICATION_GOOGLE: 900
};
