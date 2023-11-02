const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
    format: combine(
        // colorize({ all: true }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'app-error.log', level: 'error', }),

    ],
});

module.exports = logger;
