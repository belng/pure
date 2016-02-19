'use strict';

import { bus, cache, config } from '../../core-server';
import crypto from 'crypto';

function getDate(long) {
	let date = new Date();

	if (long) {
		return date.toISOString().replace(/[\-\:]/g, '').replace(/\.\d+/g, '');
	} else {
		return date.getUTCFullYear().toString() +
		('0' + date.getUTCMonth().toString()).substr(-2) +
		('0' + date.getUTCDate().toString()).substr(-2);
	}
}

function getExpiration() {
	let validity = 30 * 60 * 1000; // five minutes
	return (new Date(Date.now() + validity)).toISOString();
}

function sign(key, data) {
	return crypto.createHmac('sha256', key).update(data).digest();
}

function getKeyPrefix(userId, uploadType, textId) {
	switch (uploadType) {
	case 'avatar':
	case 'banner':
		return 'uploaded/' + uploadType + '/' + userId + '/';
	case 'content':
		return 'uploaded/' + uploadType + '/' + userId + '/' + textId + '/';
	}
}

function getCredential(config) {
	console.log(config);
	return config.accessKey + '/' + getDate() + '/' + config.region + '/' + config.service + '/' + config.signatureVersion;
}

function getPolicy(keyPrefix, config) {
	return new Buffer(JSON.stringify({
		expiration: getExpiration(),
		conditions: [
			{ 'bucket': config.bucket },
			{ 'acl': config.acl },
			[ 'starts-with', '$key', keyPrefix ],
			{ 'success_action_status': '201' },
			{ 'x-amz-credential': getCredential(config) },
			{ 'x-amz-algorithm': config.algorithm },
			{ 'x-amz-date': getDate(true) }
		]
	})).toString('base64');
}

function getSignature(policy, config) {
	let kDate = sign('AWS4' + config.secretKey, getDate());
	let kRegion = sign(kDate, config.region);
	let kService = sign(kRegion, config.service);
	let signingKey = sign(kService, config.signatureVersion);
	let signature = sign(signingKey, policy).toString('hex');
	return signature;
}

bus.on('upload/getPolicy', function(policyReq, next) {
	let keyPrefix = getKeyPrefix(policyReq.user.id, policyReq.uploadType, policyReq.textId),
		policy = getPolicy(keyPrefix, config),
		signature = getSignature(policy, config);

	policyReq.response = {
		acl: config.acl,
		policy: policy,
		keyPrefix: keyPrefix,
		bucket: config.bucket,
		'x-amz-algorithm': config.algorithm,
		'x-amz-credential': getCredential(config),
		'x-amz-date': getDate(true),
		'x-amz-signature': signature
	};

	next();
}, 'modifier');
