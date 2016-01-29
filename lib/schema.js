const constants = require("./constants");
const TABLES = {}, COLUMNS = {}, TYPES = {}, ROLES = {};

exports.TABLES = TABLES;
exports.COLUMNS = COLUMNS;
exports.TYPES = TYPES;
exports.ROLES = ROLES;

ROLES[constants.ROLE_BANNED] = "banned";
ROLES[constants.ROLE_FOLLOWER] = "follower";
ROLES[constants.ROLE_MENTIONED] = "mentioned";
ROLES[constants.ROLE_NONE] = "none";
ROLES[constants.ROLE_VISITOR] = "visitor";
ROLES[constants.ROLE_MODERATOR] = "moderator";
ROLES[constants.ROLE_OWNER] = "owner";

TABLES[constants.TYPE_ITEM] = "items";
TABLES[constants.TYPE_ROOM] = "rooms";
TABLES[constants.TYPE_TEXT] = "texts";
TABLES[constants.TYPE_THREAD] = "threads";
TABLES[constants.TYPE_TOPIC] = "topics";
TABLES[constants.TYPE_PRIV] = "privs";
TABLES[constants.TYPE_USER] = "users";
TABLES[constants.TYPE_REL] = "rels";
TABLES[constants.TYPE_ROOMREL] = "roomrels";
TABLES[constants.TYPE_TEXTREL] = "textrels";
TABLES[constants.TYPE_THREADREL] = "threadrels";
TABLES[constants.TYPE_TOPICREL] = "topicrels";
TABLES[constants.TYPE_PRIVREL] = "privrels";
TABLES[constants.TYPE_USERREL] = "userrels";
TABLES[constants.TYPE_NOTE] = "notes";

TYPES.item = constants.TYPE_ITEM;
TYPES.room = constants.TYPE_ROOM;
TYPES.text = constants.TYPE_TEXT;
TYPES.thread = constants.TYPE_THREAD;
TYPES.topic = constants.TYPE_TOPIC;
TYPES.priv = constants.TYPE_PRIV;
TYPES.user = constants.TYPE_USER;
TYPES.rel = constants.TYPE_REL;
TYPES.roomrel = constants.TYPE_ROOMREL;
TYPES.textrel = constants.TYPE_TEXTREL;
TYPES.threadrel = constants.TYPE_THREADREL;
TYPES.topicrel = constants.TYPE_TOPICREL;
TYPES.privrel = constants.TYPE_PRIVREL;
TYPES.userrel = constants.TYPE_USERREL;
TYPES.note = constants.TYPE_NOTE;


COLUMNS[constants.TYPE_USER] = [
	"id",
	"name",
	"identities",
	"tags",
	"timezone",
	"locale",
	"params",
	"resources",
	"presence",
	"presenceTime",
	"counts",
	"createTime",
	"updateTime",
	"deleteTime"
];

COLUMNS[constants.TYPE_ROOM] =
COLUMNS[constants.TYPE_TEXT] =
COLUMNS[constants.TYPE_THREAD] =
COLUMNS[constants.TYPE_TOPIC] =
COLUMNS[constants.TYPE_PRIV] = [
	"id",
	"name",
	"body",
	"type",
	"tags",
	"meta",
	"params",
	"parents",
	"creator",
	"updater",
	"counts",
	"score",
	"createTime",
	"updateTime",
	"deleteTime"
];

COLUMNS[constants.TYPE_REL] =
COLUMNS[constants.TYPE_ROOMREL] =
COLUMNS[constants.TYPE_TEXTREL] =
COLUMNS[constants.TYPE_THREADREL] =
COLUMNS[constants.TYPE_TOPICREL] =
COLUMNS[constants.TYPE_PRIVREL] = [
	"user",
	"item",
	"type",
	"tags",
	"role",
	"roleTime",
	"interest",
	"resources",
	"presence",
	"presenceTime",
	"message",
	"admin",
	"transitRole",
	"transitType",
	"expireTime"
];

COLUMNS[constants.TYPE_NOTE] = [
	"user",
	"event",
	"group",
	"eventTime",
	"readTime",
	"dismissTime",
	"count",
	"score",
	"data"
];
