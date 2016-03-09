import Item from './item';
import { TYPE_ITEM, TYPE_TEXT } from '../lib/Constants';

export default class Text extends Item {
	constructor(data) {
		if (!data.type || data.type === TYPE_ITEM) {
			data.type = TYPE_TEXT;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
