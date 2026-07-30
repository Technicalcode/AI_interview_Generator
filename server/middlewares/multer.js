const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage  = multer.diskStorage({
    destination: function(req, file, cb){
      cb(null, uploadDir)
    },
    filename: function(req, file, cb){
        const safeName = path.basename(file.originalname).replace(/\s+/g, "-");
        const filename = `${Date.now()}_${safeName}`;
        cb(null, filename)
    }
})

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 *1024},  // 5MB limit 
    fileFilter: function(req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }

        cb(null, true);
    }
});

module.exports = { upload };
