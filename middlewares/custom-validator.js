const { validationResult, body } = require("express-validator");
const User = require("../models/user");

module.exports = {
	postChangePassword: [
		body('password')
			.trim()
			.notEmpty()
			.withMessage('Password cannot be empty!')
			.isLength({ min: 6 })
			.withMessage('Password must have at least 6 characters!'),
		body('passwordConfirmation')
			.trim()
			.notEmpty()
			.withMessage('Confirm Password cannot be empty!')
			.custom((value, { req }) => {
				return value === req.body.password;
			})
			.withMessage('Confirm Password not match!'),
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ error: true, message: errors.array()[0].msg });
			}
			next();
		}
	],
	postForgetPassword: [
		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email cannot be empty!')
			.isEmail()
			.withMessage('Not a valid e-mail address')
	],
	postLogin: [
		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email cannot be empty!')
			.isEmail()
			.withMessage('Not a valid e-mail address'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('Password cannot be empty!')
			.isLength({ min: 6 })
			.withMessage('Password must have at least 6 characters!'),
	],
	postRegister: [
		body('name')
			.trim()
			.notEmpty()
			.withMessage('Fullname cannot be empty!')
			.isLength({ min: 6 })
			.withMessage('Fullname need to longer!'),
		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email cannot be empty!')
			.isEmail()
			.withMessage('Not a valid e-mail address')
			.custom(async (value) => {
				const user = await User.findOne({ email: value });
				console.log(`=>(AccountRouter.js:93) user`, user);
				if (user) {
					throw new Error('E-mail already in use');
				}
				return true;
			}),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Password must have at least 6 characters!'),
		body('passwordConfirmation')
			.trim()
			.notEmpty()
			.withMessage('Confirm Password cannot be empty!')
			.custom((value, { req }) => {
				return value === req.body.password;
			})
			.withMessage('Confirm Password not match!'),
	],
};