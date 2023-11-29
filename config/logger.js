const winston = require('winston');
const { combine, timestamp, printf, align } = winston.format;

const logger = winston.createLogger({
    level: 'http',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        align(),
        printf((info) => `[${info.timestamp}][${info.level}] ${info.message}`)
    ),
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'error.log', level: 'error', }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            timestamp({ format: 'hh:mm', }),
            printf((info) => `[${info.level}] ${info.message}`)
        )
    }));
}
module.exports = logger;
