/* @flow */

import { Constants, bus, cache } from '../../core-server';
import ThreadRel from '../../models/threadrel';
import { textrel } from '../../models/models';
import log from 'winston';

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		let text, role, user;

		if (entity.type === Constants.TYPE_TEXT) {
			if (!entity.parents) return;
			const relationId = entity.creator + '_' + entity.parents[0];
			let promises;

			if (entity.body.match(/@\w+/g)) {
				const mentions = entity.body.match(/@\w+/g);

				log.info('mention: ', mentions);

				promises = mentions.map((u) => {
					return new Promise((resolve, reject) => {
						cache.getEntity(u.slice(1), (err, usr) => {
							if (err) {
								reject(err);
								return;
							}
							if (!usr) {
								resolve();
								return;
							}
							log.info('got user: ', usr);
							const textRel = {
								item: entity.id,
								user: usr.id,
								type: Constants.TYPE_TEXTREL,
								roles: [ Constants.ROLE_MENTIONED ]
							};
							const relation = new textrel(textRel);

							log.info('create relation on mention: ', relation, relation.id);
							resolve(relation);
						});
					});
				});

				mentions.forEach((usr) => {
					promises.push(new Promise((resolve, reject) => {
						cache.getEntity(relationId, (e, r) => {
							if (e) {
								reject(e);
								return;
							}
							if (r && r.roles.indexOf(Constants.ROLE_MENTIONED) > -1) {
								resolve();
								return;
							}
							const threadRel = {
								item: entity.parents[0],
								user: usr.slice(1),
								type: Constants.TYPE_THREADREL,
								roles: [ Constants.ROLE_MENTIONED ]
							};
							const threadRelation = new ThreadRel(threadRel);

							log.info('Thread Relation created:', threadRelation);
							resolve(threadRelation);
						});
					}));
				});

			} else {
				promises = [];
			}
			promises.push(new Promise((resolve, reject) => {
				cache.getEntity(relationId, (err, r) => {
					log.info('Got previous relation: ', err, r, relationId);
					if (err) {
						reject(err);
						return;
					}
					if (r && r.roles.indexOf(Constants.ROLE_FOLLOWER) > -1) {
						resolve();
						return;
					}
					text = entity;
					role = [ Constants.ROLE_FOLLOWER ];
					user = entity.creator;
					const threadRel = {
						item: text.parents[0],
						user,
						type: Constants.TYPE_THREADREL,
						roles: role
					};
					const relation = new ThreadRel(threadRel);

					log.info('create relation on text: ', relation, relation.id);
					resolve(relation);
				});
			}));

			Promise.all(promises).then(relations => {
				log.info('all promises resolved');
				relations.forEach(relation => {
					if (!relation) return;
					console.log("relation.id", relation.id);
					changes.entities[relation.id] = relation;
				});
				next();
			}).catch((err) => {
				log.info('cought error: ', err);
				next(err);
			});
		}
	}
}, Constants.APP_PRIORITIES.RELATIONS);
log.info('Relation module ready');
