// upload.js - Strict Multer File Upload Middleware & Validation
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

// Allowed MIME types
const ALLOWED_IMAGE_AND_DOC_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/svg+xml',
  'application/pdf'
];

const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

// Unified file filter
const fileFilter = (req, file, cb) => {
  const isMediaImageOrDoc = ALLOWED_IMAGE_AND_DOC_MIMES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_MIMES.includes(file.mimetype);

  if (isMediaImageOrDoc || isVideo) {
    file.isVideo = isVideo;
    cb(null, true);
  } else {
    cb(new Error(`Format file '${file.mimetype}' tidak diizinkan. Hanya format JPEG, PNG, WEBP, ICO, PDF (maks 5MB) atau MP4, WEBM, QuickTime (maks 10MB) yang didukung.`), false);
  }
};

// 10 MB max overall buffer for multer limit, custom size checker middleware handles 5MB vs 10MB
const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB absolute ceiling
  }
});

// Post-upload strict size validator middleware
const validateUploadSize = (req, res, next) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      Object.values(req.files).forEach(fArray => files.push(...fArray));
    }
  }

  for (const f of files) {
    const isVideo = ALLOWED_VIDEO_MIMES.includes(f.mimetype);
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for video, 5MB for images/docs

    if (f.size > maxSize) {
      // Remove temporary uploaded file
      try {
        if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      } catch (err) {
        console.warn('⚠️ Could not remove oversize file:', err.message);
      }

      const limitLabel = isVideo ? '10 MB' : '5 MB';
      return res.status(400).json({
        success: false,
        message: `File '${f.originalname}' melampaui batas maksimal ukuran ${limitLabel}. Ukuran terdeteksi: ${(f.size / (1024 * 1024)).toFixed(2)} MB.`
      });
    }
  }

  next();
};

module.exports = {
  upload,
  validateUploadSize
};
