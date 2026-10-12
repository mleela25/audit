const express = require('express');
const router = express.Router();
const { uploadImage, getImages, deleteImage } = require('../controllers/images');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Simple multer setup for MV usage in controller
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', protect, getImages);
router.post('/upload', protect, authorize('admin', 'photographer'), uploadImage);
router.delete('/:id', protect, authorize('admin', 'photographer'), deleteImage);

module.exports = router;
