const PORT = process.env.PORT;
const winstonLogger = require("../config/logger");

exports.listen = () => {
    console.log(`[LISTEN] Server is running on http://localhost:${PORT}`);
};

exports.morganLog = (req, res) => {
    
    let log;
    try {
        log = require("fs").readFileSync("access.log", "utf8");
    } catch (error) {
        log = null;
    } finally {
        res.render("pages/log", { log });
    }
};