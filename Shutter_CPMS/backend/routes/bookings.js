const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookings);
router.post('/', protect, createBooking);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
