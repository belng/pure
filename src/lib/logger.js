import winston from 'winston';
import fs from 'fs';
import util from 'util';
import stack from 'parse-stack';
import path from 'path';
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);
let transports;
const dir = path.dirname(require.main.filename).split('/');

const logsDir = process.env.HOME + '/pure/logs/';

const newLogDir = logsDir + dir[dir.length - 1];

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}
if (!fs.existsSync(newLogDir)) {
	fs.mkdirSync(newLogDir);
}

if (process.env.NODE_ENV === 'production') {
	transports = [
		new winston.transports.Console({ colorize: true, level: 'debug' }),
		new (winston.transports.File)({
			level: 'error',
			filename: newLogDir + '/' + new Date().getTime() + '-error.log',
			name: 'error-file',
			maxsize: 5242880
		}),
		new (winston.transports.File)({
			level: 'info',
			filename: newLogDir + '/' + new Date().getTime() + '-info.log',
			name: 'info-file',
			maxsize: 5242880
		}),
		new (winston.transports.File)({
			level: 'warn',
			filename: newLogDir + '/' + new Date().getTime() + '-warn.log',
			name: 'warn-file',
			maxsize: 5242880
		}),
	];
} else {
	transports = [ new winston.transports.Console({ colorize: true, level: 'debug' }),
	new (winston.transports.File)({
		level: 'debug',
		filename: newLogDir + '/' + new Date().getTime() + '.log',
		maxsize: 5242880
	}) ];
}

const logger = new (winston.Logger)({ transports });

let filename, lineNumber, columnNumber;
function line(args) {

	const parseStack = stack(new Error())[2];
	filename = parseStack.filepath;
	lineNumber = parseStack.lineNumber;
	columnNumber = parseStack.columnNumber;
		// return h.filepath
	const parts = [
			(new Date()).toISOString().replace(/T/, ':').replace(/^20/, '').replace(/.Z/, ''),
			filename + ':' + lineNumber + ':' + columnNumber
		],
		logLine = util.format(...args).replace(/\s+/g, ' ');
	parts.push(logLine);
	return parts.join(' ');
}

const log = {
	error (...args: any) {
		logger.error(line(args));
	},
	debug (...args: any) {
		logger.debug(line(args));
	},
	info (...args: any) {
		logger.info(line(args));
	},
	warn (...args: any) {
		logger.warn(line(args));
	}
};

export default log;
