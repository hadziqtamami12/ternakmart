// uploadRoutes.js - File Upload Router with Strict Validation
const express = require('express');
const router = express.Router();
const { upload, validateUploadSize } = require('../middleware/upload');
const storageService = require('../services/storage');
const { authenticate } = require('../middleware/auth');

// Single file upload endpoint (images, docs, or video)
router.post('/', authenticate, upload.single('file'), validateUploadSize, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang dipilih untuk diunggah.' });
    }

    const result = await storageService.uploadFile(req.file);
    return res.json({
      success: true,
      message: 'File berhasil diunggah!',
      data: result
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Gagal mengunggah file.' });
  }
});

// Multiple images upload endpoint (e.g. for animal photos)
router.post('/multiple', authenticate, upload.array('files', 5), validateUploadSize, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang dipilih.' });
    }

    const results = [];
    for (const f of req.files) {
      const resFile = await storageService.uploadFile(f);
      results.push(resFile);
    }

    return res.json({
      success: true,
      message: `${results.length} file berhasil diunggah!`,
      data: results
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Gagal mengunggah berkas-berkas.' });
  }
});

module.exports = router;
