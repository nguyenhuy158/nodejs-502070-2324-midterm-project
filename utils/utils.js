const { transporter } = require("../config/email");
const { v2: cloudinary } = require("cloudinary");

exports.generateToken = function () {
    const length = 64;
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
};

exports.sendEmail = async function (req, user, token, options = undefined) {
    try {
        const mailOptions =
            options ?
                options :
                {
                    from: process.env.FROM_EMAIL,
                    to: user.email,
                    subject: "Activate Sales Account",
                    text: `Dear ${user.fullName},
                        An account has been created for you in the Sales System. To log in, please click the following link within 1 minute:
                        ${req.protocol + "://" + req.get("host")}/email-confirm?token=${token}
                        Best regards,
                        Administrator`,
                };

        await transporter.sendMail(mailOptions, (err, info) => {
            console.log(`[SEND MAIL] ${err ? 'Fail' : 'Success'}`);
            console.log("[SEND MAIL][INFO]", info.accepted);
            console.log("[SEND MAIL][ERR]", err);
        });
    } catch (error) {
        console.log("[SEND MAIL][ERR]", error);
    }
};

exports.uploadImage = async (imagePath) => {
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        const result = await cloudinary.uploader.upload(imagePath, options);
        console.log("=>(utils.js:54) result", result);
        return result.url;
    } catch (error) {
        console.log("[][ERR]", error);
    }
};

exports.removeImageByUrl = async function (imageUrl) {
    try {
        const publicId = imageUrl.match(/\/v\d+\/(.+)\./)[1];

        const result = await cloudinary.uploader.destroy(publicId);

        console.log(`Image removed from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        console.error(`Error removing image from Cloudinary: ${error.message}`);
    }
};

exports.generateId = function () {
    return 'xxx-xxx-xxx'.replace(/[x]/g, function (c) {
        return String.fromCharCode(Math.random() * 26 + 'a'.charCodeAt(0));
    });
};