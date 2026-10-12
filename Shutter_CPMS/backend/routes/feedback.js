const express = require('express');
const router = express.Router();
const { getFeedback, addFeedback } = require('../controllers/feedback');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFeedback);
router.post('/', addFeedback);

module.exports = router;
