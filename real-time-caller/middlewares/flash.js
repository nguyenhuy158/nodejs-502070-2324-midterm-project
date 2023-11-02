exports.addFlash = function (req, type, message) {
    req.flash(type, message);
    console.log("=>(flash.js:5) type, message", type, message);
};

exports.flashMiddleWare = (req, res, next) => {
    // res.locals.user = req.session.user;
    // res.locals.flash = req.session.flash;
    // delete req.session.flash;
    // next();
    
    req.session.flashMessages = req.session.flashMessages || [];
    req.flash = (type, message) => {
        req.session.flashMessages.push({ type, message });
    };
    res.locals.getFlashMessages = () => {
        console.log("[FLASH] flash clean");
        const messages = req.session.flashMessages;
        console.log("=>(flash.js:19) req.session.flashMessages", req.session.flashMessages);
        req.session.flashMessages = [];
        return messages;
    };
    next();
};
