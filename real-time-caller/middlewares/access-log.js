const { currentTime } = require("./format");


exports.logRequestDetails = (req, res, next) => {
    const {
              method,
              originalUrl,
              xhr,
          } = req;
    const accessTime = currentTime();
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    
    console.log(`[ACCESS-LOG]\t${fullUrl}`);
    console.log(`[ACCESS-LOG]\t${method}\t[${accessTime}]\t${originalUrl}`);
    console.log(`[ACCESS-LOG]\t${method}\t[${accessTime}]\txhr: ${xhr}`);
    console.log(`[USERNAME] ${res.app.locals.user?.username}`);
    next();
};