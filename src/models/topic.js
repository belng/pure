import Item from './item';
import { TYPE_ITEM, TYPE_TOPIC } from '../lib/Constants';

export default class Topic extends Item {
	constructor(data) {
		if (!data.type || data.type === TYPE_TOPIC || data.type === TYPE_ITEM) {
			data.type = TYPE_TOPIC;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
