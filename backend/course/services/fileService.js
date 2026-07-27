const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
const ensureUploadDir = async () => {
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
};

// Upload file
exports.uploadFile = async (file, subfolder = '') => {
    await ensureUploadDir();

    const folderPath = path.join(uploadDir, subfolder);
    try {
        await fs.access(folderPath);
    } catch {
        await fs.mkdir(folderPath, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;
    const filepath = path.join(folderPath, filename);

    // Note: requires 'sharp' package
    await sharp(file.buffer)
        .resize(800, 800, {
            fit: 'cover',
            withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toFile(filepath);

    return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
};

// Delete file
exports.deleteFile = async (filepath) => {
    if (!filepath) return;

    const fullPath = path.join(__dirname, '../..', filepath);
    try {
        await fs.unlink(fullPath);
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

// Get file info
exports.getFileInfo = async (filepath) => {
    const fullPath = path.join(__dirname, '../..', filepath);
    try {
        const stats = await fs.stat(fullPath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        };
    } catch {
        return null;
    }
};