const db = require('../db');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = (req, res) => {
  try {
    const bookings = db.prepare('SELECT * FROM bookings WHERE photographer_id = ? ORDER BY shoot_date ASC').all(req.user.id);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = (req, res) => {
  const { clientName, clientEmail, shootDate, shootType, status, price } = req.body;

  if (!clientName || !clientEmail || !shootDate || !shootType) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const info = db.prepare('INSERT INTO bookings (photographer_id, client_name, client_email, shoot_date, shoot_type, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, clientName, clientEmail, shootDate, shootType, status || 'pending', price || 0);
    
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = (req, res) => {
  const { status, price, shootDate, shootType } = req.body;
  
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND photographer_id = ?').get(req.params.id, req.user.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    db.prepare('UPDATE bookings SET status = ?, price = ?, shoot_date = ?, shoot_type = ? WHERE id = ?')
      .run(
        status || booking.status, 
        price !== undefined ? price : booking.price, 
        shootDate || booking.shoot_date, 
        shootType || booking.shoot_type, 
        req.params.id
      );

    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.status(200).json({ success: true, data: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND photographer_id = ?').get(req.params.id, req.user.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
