const db = require('../db');

// @desc    Get all albums
// @route   GET /api/v1/albums
// @access  Private
exports.getAlbums = (req, res) => {
  try {
    const albums = db.prepare('SELECT * FROM albums WHERE photographer_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.status(200).json({ success: true, count: albums.length, data: albums });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create new album
// @route   POST /api/v1/albums
// @access  Private (Photographer)
exports.createAlbum = (req, res) => {
  const { title, description, category, isPrivate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Please provide a title' });
  }

  try {
    const info = db.prepare('INSERT INTO albums (photographer_id, title, description, category, is_private) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, title, description || '', category || 'General', isPrivate ? 1 : 0);
    
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: album });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update album
// @route   PUT /api/v1/albums/:id
// @access  Private (Photographer)
exports.updateAlbum = (req, res) => {
  const { title, description, category, isPrivate, coverImage } = req.body;

  try {
    const result = db.prepare(`
      UPDATE albums 
      SET title = ?, description = ?, category = ?, is_private = ?, cover_image = ?
      WHERE id = ? AND photographer_id = ?
    `).run(title, description, category, isPrivate ? 1 : 0, coverImage, req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Album not found or unauthorized' });
    }

    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
    res.status(200).json({ success: true, data: album });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete album
// @route   DELETE /api/v1/albums/:id
// @access  Private (Photographer)
exports.deleteAlbum = (req, res) => {
  try {
    // Delete all images in this album first (optional, depends on cascade)
    db.prepare('DELETE FROM images WHERE album_id = ?').run(req.params.id);
    
    const result = db.prepare('DELETE FROM albums WHERE id = ? AND photographer_id = ?').run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Album not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
