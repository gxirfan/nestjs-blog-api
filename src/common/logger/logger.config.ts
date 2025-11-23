import * as winston from 'winston';
import { utilities as nestWinstonUtilities } from 'nest-winston';
import * as path from 'path';

const { combine, timestamp, printf, colorize } = winston.format;

const logsDir = path.join(process.cwd(), 'logs/');

const logFormat = printf(({ level, message, timestamp, context }) => {
  return `${timestamp} [${context}] ${level}: ${message}`;
});

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize({ all: true }),
    nestWinstonUtilities.format.nestLike('NestJSApp', { prettyPrint: true }),
  ),
});

const combinedFileTransport = new winston.transports.File({
  filename: logsDir + 'combined.log',
  handleExceptions: true,
  level: 'info',
  format: combine(timestamp(), logFormat),
  maxsize: 5242880,
  maxFiles: 5,
});

const errorFileTransport = new winston.transports.File({
  filename: logsDir + 'error.log',
  handleExceptions: true,
  level: 'error',
  format: combine(timestamp(), logFormat),
  maxsize: 10485760,
  maxFiles: 3,
});

export const winstonConfig = {
  level: 'info',
  transports: [
    consoleTransport,
    combinedFileTransport,
    errorFileTransport,
  ],
};