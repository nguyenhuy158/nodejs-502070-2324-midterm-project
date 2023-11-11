exports.addFlash = function (req, type, message) {
    req.flash(type, message);
    console.log("=>(flash.js:5) type, message", type, message);
};
