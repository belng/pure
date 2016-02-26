/* @flow */

export default class URLResolver {
	static resolveURL: (url: string) => Promise<string>;
	static invalidateCache: (url: string) => void;
}
