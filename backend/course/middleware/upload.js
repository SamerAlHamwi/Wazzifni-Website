const multer = require('multer');
const AppError = require('../utils/AppError');

// Storage strategy: In-memory
// We use memory storage to resize the image before saving it to disk
const multerStorage = multer.memoryStorage();

// File filter: only images
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Upload single image
exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

// Upload multiple images
exports.uploadMultipleImages = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Upload mixed images
exports.uploadMixedImages = (fields) => upload.fields(fields);