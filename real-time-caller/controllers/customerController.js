exports.get = async (req, res, next) => {
    try {
        return res.render("pages/customers/home");
    } catch (error) {
        next(error);
    }
};
