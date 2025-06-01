import winston from "winston";

const { combine, timestamp, label, printf, align, colorize, errors } = winston.format;

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    colorize({
      all: true,
    }),
    align(),
    label({ label: "server", message: false }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A", // 2022-01-25 03:23:10.350 PM
    }),
    printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
