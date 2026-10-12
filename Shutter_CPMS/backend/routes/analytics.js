const express = require('express');
const router = express.Router();
const { getStats, getAdminStats, getActivity } = require('../controllers/analytics');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/activity', protect, getActivity);
router.get('/admin', protect, authorize('admin'), getAdminStats);

module.exports = router;
