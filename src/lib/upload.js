/* @flow */

import AWS from 'aws-sdk';
import promisify from './promisify';
import { PassThrough } from 'stream';
import { config } from '../core-server';
import request from 'request';

type UploadResult = {
    Location: string
};

const configureAmazonS3 = () => {
	AWS.config.update({
		accessKeyId: config.s3.accessKey,
		secretAccessKey: config.s3.secretKey,
		region: config.s3.region
	});

	AWS.config.apiVersions = {
		s3: '2016-06-18'
	};

	return new AWS.S3();
};

const s3 = configureAmazonS3();
const uploadFile = promisify(s3.upload.bind(s3));
export function streamTos3(imageReadStream: any, destinationURL: string):Promise<UploadResult> {
	const passthrough = new PassThrough();
	imageReadStream.pipe(passthrough);

	const data = {
		Bucket: config.s3.bucket,
		Key: destinationURL,
		Body: passthrough
	};
	return uploadFile(data);
}

export function urlTos3(source, dest) {
	const imageReadStream = request.get(source);
	return streamTos3(imageReadStream, dest);
}
