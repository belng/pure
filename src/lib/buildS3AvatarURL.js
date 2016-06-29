/* @flow */

export default function buildS3AvatarURL(userName: string, size: number = 24): string {
	const avatarSizes = [ 16, 24, 32, 48, 64, 96, 120, 240, 480, 960 ];
	if (avatarSizes.indexOf(size) > -1) {
		return `https://s.bel.ng/a/${userName}/${size}.jpeg`;
	} else {
		/*
			- In case of a size which is not available in the avatarSizes array,
			  find the next greatest size to the given size from the array.
			- In case the size exceeds 960, return 960.
		*/
		let low = 0;
		let high = avatarSizes.length - 1;
		while (low < high) {
			const mid = parseInt((low + high) / 2, 10);
			const diffFromMidLeft = Math.abs(avatarSizes[mid] - size);
			const diffFromMidRight = Math.abs(avatarSizes[mid + 1] - size);
			if (diffFromMidRight <= diffFromMidLeft) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		if (avatarSizes[high] < size && high < avatarSizes.length - 1) {
			++high;
		}
		return `https://s.bel.ng/a/${userName}/${avatarSizes[high]}.jpeg`;
	}
}
