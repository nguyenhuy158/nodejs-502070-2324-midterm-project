const winstonLogger = require('../config/logger');



exports.winstonLog = (req, res, next) => {
    winstonLogger.info(`${req.method} ${req.url}`);
    next();
};