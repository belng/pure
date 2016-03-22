/* @flow */

type LocationRequestOptions = {
	priority?: 'high_accuracy' | 'balanced_power' | 'low_power' | 'no_power';
	interval?: number;
	timeout?: number;
	frequency?: number;
	displacement?: number;
}

type Position = {
	latitude: number;
	longitude: number;
	altitude: number;
	accuracy: number;
	speed: number;
}

export default class LocationListener {
	static requestEnableLocation: (options: ?LocationRequestOptions) => Promise<Position>;
	static getLastLocation: () => Promise<Position>;
	static startWatching: (options: ?LocationRequestOptions) => void;
	static stopWatching: () => void;
}
