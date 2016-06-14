import winston from 'winston';
import fs from 'fs';
import util from 'util';
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

const logDir = __dirname + '/../../logs';
let file = '';
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const logger = new (winston.Logger)({
	transports: [
		new winston.transports.Console({ colorize: true, level: 'debug' }),
		new (winston.transports.File)({
			level: 'debug',
			filename: logDir + '/debug.log',
			name: 'debug-file'
		}),
		new (winston.transports.File)({
			level: 'error',
			filename: logDir + '/error.log',
			name: 'error-file'
		}),
		new (winston.transports.File)({
			level: 'info',
			filename: logDir + '/info.log',
			name: 'info-file'
		}),
	]
});

function line(args) {
	const parts = [
			(new Date()).toISOString().replace(/T.*/g, ':'),
			(new Error()).stack.replace(/.*(Error).*\n/g, '').replace(/\n[\s\S]*$/, ''),
			file.replace(/\n[\s\S]*$/, '').replace(/^[\s\S]*?\/pure.*\//, '')
			.replace(/^.*\s+at\s*/, '').replace(/[\)\(]/g, '')
		],
		logLine = util.format(...args).replace(/\s+/g, ' ');
	parts.push(logLine);
	return parts.join(' ');
}

const log = {
	log (filename: any) {
		file = filename;
	},
	error (...args: any) {
		logger.error(line(args));
	},
	debug (...args: any) {
		logger.debug(line(args));
	},
	info (...args: any) {
		logger.info(line(args));
	}
};

export default log;
