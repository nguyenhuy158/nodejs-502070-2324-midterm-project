const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationDir = path.join(__dirname, '..', 'public', 'uploads');
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
const upload = multer({ storage: storage });

module.exports = {
    upload
};