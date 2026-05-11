import winston from 'winston';
import env from '../../config/env';

let transports: winston.transport[] = [
	new winston.transports.File({
		filename: 'test-execution.log',
		format: winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} ${level}: ${message}`;
		}),
	}),
];

if (env.ENABLE_CONSOLE_LOG) {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `${timestamp} ${level}: ${message}`;
				}),
			),
			stderrLevels: ['error', 'warn'],
		}),
	);
}
const logger = winston.createLogger({
	level: env.LOG_LEVEL,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} ${level}: ${message}`;
		}),
	),
	transports: transports,
});

export { logger };
