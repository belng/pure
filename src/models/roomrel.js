import Relation from './rel';
import { TYPE_REL, TYPE_ROOMREL } from '../lib/Constants';

export default class RoomRel extends Relation {
	constructor(data) {
		if (!data.type || data.type === TYPE_ROOMREL || data.type === TYPE_REL) {
			data.type = TYPE_ROOMREL;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
