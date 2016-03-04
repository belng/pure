import Item from './item';
import { TYPE_THREAD } from '../lib/Constants';

export default class Thread extends Item {
	constructor(data) {
		if (!data.type || data.type === TYPE_THREAD) {
			data.type = TYPE_THREAD;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
