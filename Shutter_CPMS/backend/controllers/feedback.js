const db = require('../db');

// @desc    Get all feedback for photographer
// @route   GET /api/v1/feedback
// @access  Private
exports.getFeedback = (req, res) => {
  try {
    const feedback = db.prepare(`
      SELECT f.*, i.title as image_title, c.name as client_name 
      FROM feedback f 
      JOIN images i ON f.image_id = i.id 
      JOIN albums a ON i.album_id = a.id 
      JOIN clients c ON f.client_id = c.id 
      WHERE a.photographer_id = ? 
      ORDER BY f.created_at DESC
    `).all(req.user.id);
    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Add feedback for an image
// @route   POST /api/v1/feedback
// @access  Public (Client)
exports.addFeedback = (req, res) => {
  const { imageId, clientId, comment, isFavorite } = req.body;

  if (!imageId || !clientId) {
    return res.status(400).json({ error: 'Please provide imageId and clientId' });
  }

  try {
    const info = db.prepare('INSERT INTO feedback (image_id, client_id, comment, is_favorite) VALUES (?, ?, ?, ?)')
      .run(imageId, clientId, comment || '', isFavorite ? 1 : 0);
    
    const feedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
