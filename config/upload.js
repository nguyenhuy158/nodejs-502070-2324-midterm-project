const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationDir = path.join(__dirname, '..', 'public', process.env.UPLOAD_DIR || 'uploads');
        fs.mkdirSync(destinationDir, { recursive: true });
        cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
const resizeImageSharp = async (file, destinationDir) => {
    const resizedImage = await sharp(file.path)
        .resize(800, 600)
        .toBuffer();
    fs.writeFileSync(file.path, resizedImage);
};
exports.upload = multer({ storage: storage });

exports.uploadToCloudinary = async function (file) {
    try {
        const result = await cloudinary.uploader.upload(file.data, {
            resource_type: 'auto',
            folder: 'call-mate',
        });
        logger.info(`🚀 result`, result);

        return {
            name: file.name,
            type: file.type,
            size: file.size,
            cloudinaryUrl: result.secure_url,
        };
    } catch (error) {
        logger.error('Error uploading file to Cloudinary:', error);
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            cloudinaryUrl: file.data,
        };
    }
};
