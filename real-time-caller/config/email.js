const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
    host: config.email.host,
    service: config.email.service,
    port: config.email.port,
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
});

module.exports = {
    transporter
};
