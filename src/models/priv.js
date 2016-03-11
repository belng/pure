import Item from './item';
import { TYPE_ITEM, TYPE_PRIV } from '../lib/Constants';

export default class Priv extends Item {
	constructor(data) {
		if (!data.type || data.type === TYPE_PRIV || data.type === TYPE_ITEM) {
			data.type = TYPE_PRIV;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
