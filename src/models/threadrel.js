import Relation from './rel';
import { TYPE_REL, TYPE_THREADREL } from '../lib/Constants';

export default class ThreadRel extends Relation {
	constructor(data) {
		if (!data.type || data.type === TYPE_REL) {
			data.type = TYPE_THREADREL;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
