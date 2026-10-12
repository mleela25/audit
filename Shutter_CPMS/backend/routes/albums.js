const express = require('express');
const router = express.Router();
const { getAlbums, createAlbum, updateAlbum, deleteAlbum } = require('../controllers/albums');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAlbums);
router.post('/', protect, authorize('admin', 'photographer'), createAlbum);
router.put('/:id', protect, authorize('admin', 'photographer'), updateAlbum);
router.delete('/:id', protect, authorize('admin', 'photographer'), deleteAlbum);

module.exports = router;
