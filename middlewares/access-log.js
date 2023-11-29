/* eslint-disable no-undef */
const logger = require("../config/logger");

exports.logRequestDetails = (req, res, next) => {
    const { method, originalUrl, xhr, } = req;
    const fullUrl = process.env.NODE_ENV === "production" ?
        `${req.protocol}://${req.get("host")}${req.originalUrl}` :
        originalUrl;

    logger.http(`[URL] ${fullUrl}`);
    logger.http(`[METHOD] ${method}`);
    logger.http(`[XHR] ${xhr}`);
    logger.http(`[USERNAME] ${res.app.locals.user?.username}`);
    logger.http(`[_USERS] ${JSON.stringify(_users)}`);
    logger.info(`[SESSION ID]] ${req.sessionID}`);
    next();
};