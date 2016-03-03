import Item from './item';

export default class Thread extends Item {
	constructor(data) {
		data.type = 'thread';
		super(data);
	}
}
