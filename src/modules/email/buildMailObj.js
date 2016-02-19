'use strict';

let currentU = false, currentR = false;

function userFromUserRel(user) {
	return {
		id: user.user,
		identities: user.identities,
		createTime: user.createTime,
		params: user.params,
		tags: user.tags,
		timezone: user.timezone
	};
}

function relFromUserRel(rel) {
	return {
		user: rel.user, // id or identity
		topics: rel.topics,
		threadId: rel.threadid, // room display name or thread title
		text: rel.teext,
		parents: rel.textparents || [],
		item: rel.titem,
		role: rel.trole,
		status: rel.status,
		interest: rel.interest,
		reputation: rel.reputation,
		room: rel.roomName
	};
}

function buildMailObj(userRel) {
	const rel = relFromUserRel(userRel),
		user = userFromUserRel(userRel);

	let cUserRel = false;

	if (user.id !== currentU.id) {
		if (currentU) {
			cUserRel = {
				currentUser: currentU,
				currentRels: currentR
			};
		}
		currentU = user;
		currentR = [
			{
				room: rel.room ? rel.room : rel.parent,
				threads: [ rel ]
			}
		];
	} else {
		let sameRoom = false;

		for (const item of currentR) {
			// console.log("item: ", item)
			if (rel.room === item.room) {
				item.threads.push(rel);
				sameRoom = true;
				break;
			}
		}

		if (!sameRoom) {
			currentR.push({ room: rel.room ? rel.room : rel.parent, threads: [ rel ] });
		}

		// console.log("currentR after: ", currentR)
	}
	if (cUserRel) {

		cUserRel.currentRels.sort((a, b) => { // sort according to the no of threads in a room
			if (a.threads.length > b.threads.length) return -1;
			if (a.threads.length < b.threads.length) return 1;
			return 0;
		});

		for (const i in cUserRel.currentRels) {
			cUserRel.currentRels[i].threads.sort((a, b) => { // sort threads according to interest
				return b.interest - a.interest;
			});
		}
	}
	return cUserRel;
}

export default function (userRel) {
//	console.log(userRel)

	if (Object.keys(userRel).length === 0) {
		const cu = currentU, cr = currentR;

		currentU = false;
		currentR = false;
		return {
			currentUser: cu,
			currentRels: cr
		};
	}
	const emailObj = buildMailObj(userRel);

	return emailObj;
}
