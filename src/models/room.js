import Item from './item';

export default class Room extends Item {
	constructor(data) {
		super(data);
		this.type = 'room';
	}
}
