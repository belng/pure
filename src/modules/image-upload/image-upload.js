import { bus, config, Constants } from '../../core-server';
import crypto from 'crypto';
import winston from 'winston';
import EnhancedError from './../../lib/EnhancedError';
function getDate(long) {
	const date = new Date();

	if (long) {
		return date.toISOString().replace(/[\-\:]/g, '').replace(/\.\d+/g, '');
	} else {
		return date.getUTCFullYear().toString() +
		('0' + date.getUTCMonth().toString()).substr(-2) +
		('0' + date.getUTCDate().toString()).substr(-2);
	}
}

function getExpiration() {
	const validity = config.s3.validity;
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

	return '';
}

function getCredential() {
	return `${config.s3.accessKey}/${getDate()}\
		/${config.s3.region}/${config.s3.service}\
		/${config.s3.signatureVersion}`;
}

function getPolicy(keyPrefix) {
	return new Buffer(JSON.stringify({
		expiration: getExpiration(),
		conditions: [
			{ bucket: config.s3.bucket },
			{ acl: config.s3.acl },
			[ 'starts-with', '$key', keyPrefix ],
			{ success_action_status: '201' },
			{ 'x-amz-credential': getCredential() },
			{ 'x-amz-algorithm': config.s3.algorithm },
			{ 'x-amz-date': getDate(true) }
		]
	})).toString('base64');
}

function getSignature(policy) {
	const kDate = sign('AWS4' + config.s3.secretKey, getDate());
	const kRegion = sign(kDate, config.s3.region);
	const kService = sign(kRegion, config.s3.service);
	const signingKey = sign(kService, config.s3.signatureVersion);
	const signature = sign(signingKey, policy).toString('hex');
	return signature;
}


export default function() {
	if (!config.s3) {
		winston.info('Image upload is disabled');
		bus.on('s3/getPolicy', (policyReq, next) => {
			policyReq.response = {};
			policyReq.response.error = new EnhancedError('Image upload is temporarily disabled', 'NO_CONFIG_FOUND_FO_S3');
			next();
		}, Constants.APP_PRIORITIES.IMAGE_UPLOAD);
		return;
	}

	bus.on('s3/getPolicy', (policyReq, next) => {
		const keyPrefix = getKeyPrefix(policyReq.state.user, policyReq.uploadType, policyReq.textId),
			policy = getPolicy(keyPrefix),
			signature = getSignature(policy);

		policyReq.response = {
			acl: config.s3.acl,
			policy,
			keyPrefix,
			bucket: config.s3.bucket,
			'x-amz-algorithm': config.s3.algorithm,
			'x-amz-credential': getCredential(),
			'x-amz-date': getDate(true),
			'x-amz-signature': signature
		};

		next();
	}, Constants.APP_PRIORITIES.IMAGE_UPLOAD);
	winston.info('Image upload is ready');

}