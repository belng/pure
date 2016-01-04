"use strict";

let currentU = false, currentR = false;


function userFromUserRel(user) {
	return {
		id: user.user,
		identities: user.identities,
		createTime: user.createTime,
		params: user.params, 
		tags: user.tags,
		timezone: user.timezone
	}
}

function relFromUserRel(rel) {
	return {
		user: rel.user, // id or identity
		topics: rel.topics,
		threadTitle: rel.name, //room display name or thread title
		body: rel.body,
		parent: rel.parents ? rel.parents[0] : "" ,
		item: rel.item,
		tags: rel.tags,
		role: rel.role,
		status: rel.status,
		statusTime: rel.statusTime,
		interest: rel.interest,
		reputation: rel.reputation,
		room: rel.room
	}
}

function sendEmailToUser(userRel) {
//	if (userRel.uid === null) {
//		console.log(userRel)
//	}
	let rel = relFromUserRel(userRel),
		user = userFromUserRel(userRel),
		cUserRel = false;
//	console.log(user.id, currentU.id)
	if(user.id !== currentU.id) {
//		console.log((currentU))
		if (currentU) {
			cUserRel = {
				currentUser: currentU, 
				currentRels: currentR
			}
		}
		currentU = user;
		currentR = [
			{
				room: rel.room ? rel.room : rel.parent,
				threads: [rel]
			}
		];
	} else {
//		console.log(currentR)
		if(/*rel.room === currentR[currentR.length-1].room ||*/
		   rel.parent === currentR[currentR.length-1].room) {
			currentR[currentR.length-1].threads.push(rel)
		}
		
//		for (let i=0; i<currentR.length; i++) {
//			if(rel.parent === currentR[0].room) {
//				
//			}
//		}
		else {
			currentR.push({room: rel.room ? rel.room : rel.parent, threads: [rel]});
		}
	}
//	console.log(currentR)
	
	if (cUserRel) {

		cUserRel.currentRels.sort ((a, b) => { // sort according to the no of threads in a room	
			if(a.threads.length > b.threads.length) return -1;
			if(a.threads.length < b.threads.length) return 1;
			return 0;
		});

		for (let i in cUserRel.currentRels) {
			cUserRel.currentRels[i].threads.sort ((a, b) => { //sort threads according to interest
				return b.interest - a.interest;
			});
		}
	}
	return cUserRel;
}

module.exports = function (userRel) {
	
	if (Object.keys(userRel).length === 0) {
		let cu = currentU, cr = currentR;
		currentU = false, currentR = false;
		return {
			currentUser: cu, 
			currentRels: cr
		};
	}
	let emailObj = sendEmailToUser(userRel);
	return emailObj;
}

