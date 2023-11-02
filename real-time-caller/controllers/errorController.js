const { currentTime } = require("../middlewares/format");
exports.errorNotFound = function (req, res, next) {
    const { method, originalUrl } = req;
    console.error(`[ERROR][404] ${method}\t${originalUrl}`);
    console.error(`[ERROR][404] ${method}\t${originalUrl}`);
    res.status(404).render("pages/404");
};

exports.logErrors = function (err, req, res, next) {
    console.error(`[ERROR][LOG] ${err.message}`);
    console.error(`[ERROR][LOG] ${err.stack}`);
    next(err);
};

exports.clientErrorHandler = function (err, req, res, next) {
    if (req.xhr) {
        res.status(404).send({ error: "Something failed!", message: err.message });
    } else {
        next(err);
    }
};

exports.serverErrorHandler = function (err, req, res, next) {
    console.error(`[ERROR][500] ${err.message}`);
    console.error(`[ERROR][500] ${err.stack}`);
    res.status(500).render("pages/500", { error: "Something failed!", message: err.message });
};

