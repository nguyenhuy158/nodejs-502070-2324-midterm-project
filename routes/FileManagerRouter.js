var express = require("express");
var router = express.Router();

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const defaultPath = path.join(__dirname, "..", "..", "upload");
const upload = multer({ dest: defaultPath });

function formatOutputFileManger(filteredFiles, publicFolderPath) {
    console.log(`=>(FileManagerRouter.js:59) filteredFiles`, filteredFiles);
    console.log(`=>(FileManagerRouter.js:59) publicFolderPath`, publicFolderPath);
    const result = filteredFiles.map((file) => {
        console.log(`=>(FileManagerRouter.js:46) file`, file);
        const filePath = path.join(publicFolderPath, file.name);
        console.log(`=>(FileManagerRouter.js:18) filePath`, filePath);
        const stats = fs.statSync(filePath);

        const isFolder = file.isDirectory();

        let fileType = "File";
        if (!isFolder) {
            const fileExt = path.extname(file.name)
                .toLowerCase();
            if ([".zip", ".rar", ".7zip", ".7z"].includes(fileExt)) {
                fileType = "Compressed File";
            } else if ([".txt", ".md", ".gitignore"].includes(fileExt)) {
                fileType = "Text Document";
            } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)) {
                fileType = "Image";
            } else if ([".mp4", ".flv", ".mkv"].includes(fileExt)) {
                fileType = "Video";
            } else if ([".mp3", ".avi", ".acc"].includes(fileExt)) {
                fileType = "Audio";
            } else if ([".exe", ".bat"].includes(fileExt)) {
                fileType = "Application";
            }
        }

        return {
            name: file.name,
            type: isFolder ? "Folder" : fileType,
            size: isFolder ? "-" : formatFileSize(stats.size),
            lastModified: formatDate(stats.mtime),
        };
    });
    console.log(`=>(FileManagerRouter.js:47) result`, result);
    return result;
}

function formatFileSize(size) {
    if (size < 1024) {
        return size + " B";
    } else if (size < 1048576) {
        return (size / 1024).toFixed(2) + " KB";
    } else {
        return (size / 1048576).toFixed(2) + " MB";
    }
}

function formatDate(date) {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };
    return date.toLocaleDateString("en-US", options);
}

router.use((req, res, next) => {
    console.log("----------->", req.url, req.originalUrl, req.baseUrl, req.method);
    next();
});

router.post("/search", (req, res) => {
    const { searchKeyword } = req.body;
    let searchResults = searchFilesAndFolders(searchKeyword, defaultPath);
    console.log(`=>(FileManagerRouter.js:79) searchResults`, searchResults);
    searchResults = searchResults.map((filePath) => {
        const stats = fs.statSync(filePath);

        const isFolder = stats.isDirectory();

        let fileType = "File";
        if (!isFolder) {
            const fileExt = path.extname(filePath)
                .toLowerCase();
            if ([".zip", ".rar", ".7zip", ".7z"].includes(fileExt)) {
                fileType = "Compressed File";
            } else if ([".txt", ".md", ".gitignore"].includes(fileExt)) {
                fileType = "Text Document";
            } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)) {
                fileType = "Image";
            } else if ([".mp4", ".flv", ".mkv"].includes(fileExt)) {
                fileType = "Video";
            } else if ([".mp3", ".avi", ".acc"].includes(fileExt)) {
                fileType = "Audio";
            } else if ([".exe", ".bat"].includes(fileExt)) {
                fileType = "Application";
            }
        }

        return {
            name: path.basename(filePath),
            src: path.dirname(filePath)
                .replace(defaultPath, ""),
            type: isFolder ? "Folder" : fileType,
            size: isFolder ? "-" : formatFileSize(stats.size),
            lastModified: formatDate(stats.mtime),
        };
    });
    res.json({ results: searchResults });
});

const handleUpload = (req, res) => {
    if (!req.file) {
        return res.status(400)
            .json({ message: "No file uploaded." });
    }

    const { root } = req.params;
    console.log(`=>(FileManagerRouter.js:123) root`, root);

    const originalname = req.file.originalname;
    const tempFilePath = req.file.path;
    const targetDir = root ? path.join(defaultPath, root) : defaultPath;

    const uniqueFilename = Date.now() + "-" + originalname;

    const targetPath = path.join(targetDir, uniqueFilename);

    fs.rename(tempFilePath, targetPath, (err) => {
        if (err) {
            return res.status(500)
                .json({ message: "File upload failed." });
        }

        res.status(200)
            .json({
                message: "File uploaded successfully.",
                filename: uniqueFilename
            });
    });
};
router.post("/upload", upload.single("file"), handleUpload);
router.post("/upload/:root", upload.single("file"), handleUpload);

router.post("/create-folder", (req, res) => {
    const {
        root,
        folderName
    } = req.body;

    const fs = require("fs");
    const folderPath = path.join(defaultPath, root, folderName);

    fs.mkdir(folderPath, (err) => {
        if (err) {
            console.error("Error creating folder:", err);
            res.status(500)
                .json({
                    success: false,
                    message: "Failed to create the folder."
                });
        } else {
            res.status(200)
                .json({
                    success: true,
                    message: "Folder created successfully."
                });
        }
    });
});

router.post("/create-text-file", (req, res) => {
    const {
        content,
        fileName,
        root
    } = req.body;

    const fs = require("fs");
    const filePath = path.join(defaultPath, root, `${fileName}.txt`);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error("Error creating text file:", err);
            res.status(500)
                .json({
                    success: false,
                    message: "Failed to create the text file."
                });
        } else {
            res.status(200)
                .json({
                    success: true,
                    message: "Text file created successfully."
                });
        }
    });
});

// TODO: delete
router.delete("/delete", function (req, res, next) {
    const {
        root,
        fileName
    } = req.body;
    console.log("=>(index.js:349) fileName", fileName);

    const filePath = path.join(defaultPath, root, fileName);
    console.log(`=>(FileManagerRouter.js:278) filePath`, filePath);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            res.status(500)
                .json({
                    error: true,
                    message: "Failed to delete the file."
                });
        } else {
            console.log("File deleted:", fileName);
            res.status(200)
                .json({
                    error: false,
                    message: "File deleted successfully."
                });
        }
    });
});
// TODO: rename file
router.put("/update-file-name", function (req, res, next) {
    const {
        oldFileName,
        newFileName
    } = req.body;

    const oldFilePath = `${defaultPath}/${oldFileName}`;
    const newFilePath = `${defaultPath}/${newFileName}`;

    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            console.error("Error renaming file:", err);
            res.status(500)
                .json({
                    error: true,
                    message: "Failed to rename the file."
                });
        } else {
            console.log("File renamed successfully.");
            res.status(200)
                .json({
                    error: false,
                    message: "File renamed successfully."
                });
        }
    });
});

const archiver = require("archiver");
// const rateLimit = require("express-rate-limit");
// const limiter   = rateLimit({
//                                 windowMs: 1000, // 1 giây
//                                 max     : 1 * 1024, // Giới hạn 1 MB/giây
//                                 skip    : (req, res) => {
//                                     return false;
//                                 }
//                             });
//
// router.use("/download/:resourceName", limiter);
router.get(/^\/download\/(.*)$/, function (req, res, next) {
    const resourceName = req.params[0];
    const resourcePath = path.join(defaultPath, resourceName);

    // Check if the resource exists
    if (!fs.existsSync(resourcePath)) {
        return res.status(404)
            .send("Resource not found.");
    }

    const stats = fs.statSync(resourcePath);

    if (stats.isDirectory()) {
        // If it's a directory, create a ZIP archive and send it to the client
        const output = fs.createWriteStream(path.join(defaultPath, `${resourceName}.zip`));
        const archive = archiver("zip", {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on("close", function () {
            console.log(archive.pointer() + " total bytes");
            console.log("archiver has been finalized and the output file descriptor has closed.");

            // Send the ZIP file to the client
            const zipFilePath = path.join(defaultPath, `${resourceName}.zip`);
            res.attachment(zipFilePath)
                .download(zipFilePath, `${resourceName}.zip`, (err) => {
                    if (err) {
                        console.error("Error sending ZIP file:", err);
                    } else {
                        console.log("ZIP file sent to client successfully.");
                        // Optionally, you can remove the ZIP file after it has been sent.
                        fs.unlinkSync(zipFilePath);
                    }
                });
        });

        archive.pipe(output);

        // Add files from the directory to the ZIP archive
        archive.directory(resourcePath, false);
        archive.finalize();
    } else {
        // If it's a file, directly send the file to the client
        res.attachment(resourcePath)
            .download(resourcePath, resourceName, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    next(err);
                } else {
                    console.log("File sent to client successfully.");
                }
            });
    }
});

function searchFilesAndFolders(searchKeyword, dir) {
    const results = [];
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            results.push(...searchFilesAndFolders(searchKeyword, path.join(dir, item)));
            if (item.toLowerCase()
                .includes(searchKeyword.toLowerCase())) {
                results.push(path.join(dir, item));
            }
        } else {
            if (item.toLowerCase()
                .includes(searchKeyword.toLowerCase())) {
                results.push(path.join(dir, item));
            }
        }

    });

    return results;
}


router.post(/\/(.*)/, function (req, res, next) {
    if (req.session.loggedin) {
        const dynamicPath = req.params[0];
        const publicFolderPath = path.join(defaultPath, dynamicPath);
        console.log("=>(index.js:85) dynamicPath", dynamicPath);
        console.log("=>(index.js:85) publicFolderPath", publicFolderPath);
        fs.readdir(publicFolderPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.log("=>(index.js:86) err", err);
                return next();
            }

            const filteredFiles = files.filter((file) => !file.name.startsWith("."));

            const filesAndFolders = formatOutputFileManger(filteredFiles, publicFolderPath);

            const sortedData = filesAndFolders.sort((a, b) => {
                if (a.type === "Folder" && b.type !== "Folder") {
                    return -1;
                }
                if (a.type !== "Folder" && b.type === "Folder") {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            });

            // res.render("index", {
            //     title          : "Express",
            //     filesAndFolders: sortedData,
            //     breadcrumb     : res.locals.breadcrumb,
            //     name           : req.session.name
            // });
            // Respond with JSON data
            return res.json({
                success: true,
                data: sortedData,
                root: dynamicPath,
                name: req.session.name,
                breadcrumb: res.locals.breadcrumb || [],
            });
        });
    } else {
        return res.redirect("/login");
    }
});

router.get(/\/(.*)/, function (req, res, next) {
    if (req.session.loggedin) {
        const dynamicPath = req.params[0];
        const publicFolderPath = path.join(defaultPath, dynamicPath);
        console.log("=>(index.js:85) dynamicPath", dynamicPath);
        console.log("=>(index.js:85) publicFolderPath", publicFolderPath);
        fs.readdir(publicFolderPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.log("=>(index.js:86) err", err);
                return next();
            }

            const filteredFiles = files.filter((file) => !file.name.startsWith("."));

            const filesAndFolders = formatOutputFileManger(filteredFiles, publicFolderPath);

            const sortedData = filesAndFolders.sort((a, b) => {
                if (a.type === "Folder" && b.type !== "Folder") {
                    return -1;
                }
                if (a.type !== "Folder" && b.type === "Folder") {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            });

            res.render("index", {
                title: "Express",
                filesAndFolders: sortedData,
                breadcrumb: res.locals.breadcrumb,
                root: dynamicPath,
                name: req.session.name
            });
            // Respond with JSON data
            // return res.json({
            //                     success   : true,
            //                     data      : sortedData,
            //                     name      : req.session.name,
            //                     breadcrumb: res.locals.breadcrumb || [],
            //                 });
        });
    } else {
        return res.redirect("/login");
    }
});

module.exports = router;
