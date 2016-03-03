import Item from './item';

export default class Topic extends Item {
	constructor(data) {
		data.type = 'topic';
		super(data);
	}
}
