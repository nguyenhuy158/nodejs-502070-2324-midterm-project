exports.formatTimestamp = function (timestamp) {
    try {
        const hours = timestamp.getHours().toString().padStart(2, "0");
        const minutes = timestamp.getMinutes().toString().padStart(2, "0");
        const seconds = timestamp.getSeconds().toString().padStart(2, "0");
        const day = timestamp.getDate().toString().padStart(2, "0");
        const month = (timestamp.getMonth() + 1).toString().padStart(2, "0");
        const year = timestamp.getFullYear();
        
        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch (e) {
        console.log("=>(format.js:12) e", e);
        return `00:00:00 00/00/0000`;
    }
};

exports.currentTime = function () {
    return require("dateformat")(new Date(), process.env.DATETIME_FORMAT_FULL);
};