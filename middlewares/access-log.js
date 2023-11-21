/* eslint-disable no-undef */
const moment = require("moment");

exports.logRequestDetails = (req, res, next) => {
    const {
        method,
        originalUrl,
        xhr,
    } = req;
    const accessTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    console.log(`[ACCESS-LOG]\t${fullUrl}`);
    console.log(`[ACCESS-LOG]\t${method}\t[${accessTime}]\t${originalUrl}`);
    console.log(`[ACCESS-LOG]\t${method}\t[${accessTime}]\txhr: ${xhr}`);
    console.log(`[USERNAME] ${res.app.locals.user?.username}`);
    console.log(`[_USERS] ${JSON.stringify(_users)}`);  
    console.log(`[SESSION ID]] ${req.sessionID}`);
    next();
};