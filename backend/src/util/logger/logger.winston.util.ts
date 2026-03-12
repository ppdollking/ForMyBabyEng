import { createLogger, format, transports } from 'winston';

const _logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`),
  ),
  transports: [new transports.Console()],
});

// CLAUDE.md 컨벤션: wLogger.log / warn / error 인터페이스 유지
export const wLogger = {
  log: (message: string) => _logger.info(message),
  warn: (message: string) => _logger.warn(message),
  error: (message: string) => _logger.error(message),
};
