import Item from './item';
import { TYPE_ITEM, TYPE_ROOM } from '../lib/Constants';

export default class Room extends Item {
	constructor(data) {
		if (!data.type || data.type === TYPE_ITEM) {
			data.type = TYPE_ROOM;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
