import winston from 'winston';
import 'winston-daily-rotate-file';

class LoggerBuilder {
  private logger: winston.Logger;

  getLogger(): winston.Logger {
    this.initLogger();
    this.addFileLogger();
    this.addConsoleLogger();
    return this.logger;
  }

  private initLogger(): void {
    this.logger = winston.createLogger();
  }

  private addFileLogger(): void {
    this.logger.add(
      new winston.transports.DailyRotateFile({
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple()
        ),
        filename: 'var/log/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
      })
    );

    this.logger.add(
      new winston.transports.DailyRotateFile({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple()
        ),
        filename: 'var/log/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
      })
    );
  }

  private addConsoleLogger(): void {
    this.logger.add(
      new winston.transports.Console({
        level:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging'
            ? 'info'
            : 'debug',
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.ms(),
          winston.format.align(),
          winston.format.printf(
            (info) =>
              `[${info.timestamp}] ${info.level}: ${info.message} (${info.ms})\n${info.stack}`
          )
        ),
      })
    );
  }
}

const logger = new LoggerBuilder().getLogger();

export default logger;
