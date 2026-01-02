const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const uploadPath = path.join(__dirname, "..", "public/www/uploads");
const assignmentUploadPath = path.join(
  __dirname,
  "..",
  "public/www/uploads/assignments"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
if (!fs.existsSync(assignmentUploadPath)) {
  fs.mkdirSync(assignmentUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = uuidv4() + ext;
    cb(null, filename);
  },
});

// File filter - accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Set file size limit (3MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

const assignmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assignmentUploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { upload, assignmentUpload };
