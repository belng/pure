/*
	Production process debug port.

	Also sets up winston transports such as CloudWatch and SNS.
*/

import winston from 'winston';
import bus from '../../bus';

winston.add(/* ... */);

bus.on("debug-level", (/* opts */) => {});
