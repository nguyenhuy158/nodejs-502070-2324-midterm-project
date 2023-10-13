exports.requireRole = function (role) {
    return (req, res, next) => {
        console.log("=>(authMiddleware.js:3) req.user", req.user);
        console.log("=>(authMiddleware.js:4) role", role);
        console.log("=>(authMiddleware.js:5) req.user.role", req.user.role);
        console.log("=>(authMiddleware.js:6) req.user.role === role", req.user.role === role);
        if (req.user && req.user.role === role) {
            // User has the required role, proceed to the next middleware or route handler
            next();
        } else {
            // User does not have the required role, return an error or redirect to an unauthorized page
            res.status(403).render("permissionDenied");
        }
    };
}
