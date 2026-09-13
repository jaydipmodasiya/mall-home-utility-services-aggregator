const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { protect, authorize } = require('../middleware/auth');
const {
  getProviders, getProvider, getMyProfile, updateMyProfile,
  updateAvailability, uploadDocument,
} = require('../controllers/providerController');

// Multer config for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/documents')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + crypto.randomBytes(8).toString('hex') + path.extname(file.originalname).toLowerCase());
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.pdf']);
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);
    const ext = allowedExtensions.has(path.extname(file.originalname).toLowerCase());
    const mime = allowedMimeTypes.has(file.mimetype.toLowerCase());
    if (ext && mime) cb(null, true);
    else cb(new Error('Only JPEG, PNG and PDF files are allowed'));
  },
});

router.get('/', getProviders);
router.get('/me', protect, authorize('provider'), getMyProfile);
router.patch('/me', protect, authorize('provider'), updateMyProfile);
router.patch('/me/availability', protect, authorize('provider'), updateAvailability);
router.post('/me/documents', protect, authorize('provider'), upload.single('document'), uploadDocument);
router.get('/:id', getProvider);

module.exports = router;
