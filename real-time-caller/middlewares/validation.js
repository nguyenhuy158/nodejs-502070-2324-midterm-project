const { body, validationResult } = require('express-validator');

module.exports.validateCreateProduct = [
    body('name').notEmpty().isString(),
    body('price').isNumeric(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports.validateUpdateProduct = [
    body('name').optional().isString(),
    body('price').optional().isNumeric(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
