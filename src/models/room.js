import Item from './item';

export default class Room extends Item {
	constructor(data) {
		data.type = 'room';
		super(data);
	}
}
