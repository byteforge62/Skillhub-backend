const multer = require("multer");
const AppError = require("../utils/AppError");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new AppError("Avatar must be a JPEG, PNG, or WebP image", 400));
      return;
    }
    callback(null, true);
  },
}).single("avatar");

module.exports = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      next(new AppError("Avatar upload is invalid or too large", statusCode));
      return;
    }
    if (error) {
      next(error);
      return;
    }
    next();
  });
};
