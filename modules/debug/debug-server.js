/*
	Production process debug port.

	Listens on a TCP port on localhost, allows connected hosts to send commands to change log levels and server config values.

	Also sets up winston transports such as CloudWatch and SNS.
*/

let winston = require("winston");
winston.add(/* ... */);
