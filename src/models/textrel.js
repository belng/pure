import Relation from './rel';
import { TYPE_REL, TYPE_TEXTREL } from '../lib/Constants';

export default class TextRel extends Relation {
	constructor(data) {
		if (!data.type || data.type === TYPE_TEXTREL || data.type === TYPE_REL) {
			data.type = TYPE_TEXTREL;
		} else {
			throw new Error('INVALID_TYPE');
		}
		super(data);
	}
}
