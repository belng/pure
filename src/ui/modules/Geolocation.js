/* @flow */

type Position = {
	latitude: number;
	longitude: number;
	altitude: number;
	accuracy: number;
	speed: number;
}

export default class Geolocation {
	static isGPSEnabled: () => Promise<boolean>;
	static showGPSSettings: () => Promise<boolean>;
	static getCurrentPosition: () => Promise<Position>;
	static watchPosition: (success: (position: Position) => void) => number;
	static clearWatch: (id: number) => void;
}
