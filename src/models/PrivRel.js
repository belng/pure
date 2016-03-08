import Relation from './Rel';
import { TYPE_REL, TYPE_PRIVREL } from '../lib/Constants';

export default class PrivRel extends Relation {
	constructor(data) {
		if (!data.type || data.type === TYPE_REL) {
			data.type = TYPE_PRIVREL;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
