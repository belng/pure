import Relation from './rel';
import { TYPE_REL, TYPE_TOPICREL } from '../lib/Constants';

export default class TopicRel extends Relation {
	constructor(data) {
		if (!data.type || data.type === TYPE_TOPICREL || data.type === TYPE_REL) {
			data.type = TYPE_TOPICREL;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
