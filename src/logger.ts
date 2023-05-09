import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
