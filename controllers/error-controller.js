const logger = require('../config/logger');


exports.error500 = (error, req, res, next) => {
    logger.error(`500 Internal Server Error: ${error}`);

    res.status(500).render('500', { error: error });
};

exports.error404 = function (req, res, next) {
    logger.error(`404 Not Found: ${req.originalUrl}`);

    res.status(404).render('404', {});
};