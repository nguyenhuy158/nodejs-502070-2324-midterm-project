const fs = require("fs");

autoViews = [];
exports.autoViews = (req, res, next) => {
    const queryPath = req.path.toLowerCase().trim();
    const path = "./views/pages/auto" + queryPath + ".pug";
    if (autoViews[queryPath]) return res.render(autoViews[queryPath]);
    
    if (fs.existsSync(path)) {
        autoViews[queryPath] = "pages/auto/" + queryPath.replace(/^\//, "");
        console.log("=>(auto-views.js:14) autoViews", autoViews);
        return res.render(autoViews[queryPath]);
    }
    next();
};