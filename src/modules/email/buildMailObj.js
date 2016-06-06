import { formatShort } from '../../lib/Time';
import { config } from '../../core-server';
let currentU = false,
	currentR = false;

function userFromUserRel(user) {
	return {
		id: user.userid,
		identities: user.identities,
	};
}

function relFromUserRel(rel) {
	// console.log("rel: ", rel)
	return {
		user: rel.user || rel.userid, // id or identity
		topics: rel.topics,
		threadTitle: rel.name || rel.threadtitle,
		threadId: rel.threadid, // room display name or thread title
		text: rel.teext || rel.body,
		parents: rel.textparents || rel.parents,
		item: rel.titem || rel.item,
		roles: rel.trole || rel.roles,
		score: rel.score,
		// interest: rel.interest,
		// reputation: rel.reputation,
		room: rel.roomname,
		roomId: rel.roomid,
		count: rel.textCount || rel.children,
		displayTime: formatShort(rel.threadTime || rel.createtime),
	};
}

function buildMailObj(userRel) {
	// console.log("sajdh hjadf: ", userRel)
	const rel = relFromUserRel(userRel),
		user = userFromUserRel(userRel);
// console.log('rel: ', rel);
// console.log('user: ', user)
	let cUserRel = false;
	const thread = {
		id: rel.threadId,
		title: rel.threadTitle,
		score: rel.score,
		counts: rel.count,
		displayTime: rel.displayTime
	};

	if (user.id !== currentU.id) {
		if (currentU) {
			cUserRel = {
				currentUser: currentU,
				currentRels: currentR,
			};
		}
		currentU = user;
		currentR = [
			{
				id: rel.roomId,
				room: rel.room,
				threads: [ thread ],
				domain: config.server.protocol + '//' + config.server.host,
			},
		];
	} else {
		let sameRoom = false;

		for (const item of currentR) {
			// console.log("item: ", item)
			if (rel.room === item.room) {
				item.threads.push(thread);
				sameRoom = true;
				break;
			}
		}

		if (!sameRoom) {
			currentR.push({
				id: rel.roomId,
				room: rel.room ? rel.room : rel.parent,
				threads: [ thread ],
				domain: config.server.protocol + '//' + config.server.host,
			});
		}

	}
	if (cUserRel) {		// sortAndTrim()

		cUserRel.currentRels.sort((a, b) => { // sort according to the no of threads in a room
			return b.threads.length - a.threads.length;
		});

		for (const i in cUserRel.currentRels) {
			cUserRel.currentRels[i].threads.sort((a, b) => { // sort threads according to interest
				// return b.score - a.score;
				return b.count - a.count;
			});
			if (cUserRel.currentRels[i].threads.length > 4) {
				cUserRel.currentRels[i].threads = cUserRel.currentRels[i].threads.slice(0, 4);
			}
		}
		// console.log('cUserRel: ', cUserRel.currentRels);
	}
	return cUserRel;
}

export default function (userRel) {
	// console.log(userRel.user)

	if (Object.keys(userRel).length === 0) {
		const cu = currentU, cr = currentR;

		currentU = false;
		currentR = false;
		return {
			currentUser: cu,
			currentRels: cr,
		};
	}
	const emailObj = buildMailObj(userRel);

	return emailObj;
}
