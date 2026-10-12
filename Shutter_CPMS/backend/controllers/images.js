const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// @desc    Upload image
// @route   POST /api/v1/images/upload
// @access  Private (Photographer)
exports.uploadImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: 'Please upload an image' });
  }

  const file = req.files.image;
  const albumId = req.body.albumId;
  const clientId = req.body.clientId;
  const title = req.body.title || file.name;
  const category = req.body.category || 'General';
  const tags = req.body.tags || '';

  if (!file.mimetype.startsWith('image')) {
    return res.status(400).json({ error: 'Please upload an image file' });
  }

  const fileName = `${uuidv4()}${path.parse(file.name).ext}`;
  const rawPath = path.join(__dirname, '../uploads/raw', fileName);
  const compressedPath = path.join(__dirname, '../uploads/compressed', fileName);
  const watermarkedPath = path.join(__dirname, '../uploads/watermarked', fileName);

  try {
    // Save raw image
    await file.mv(rawPath);

    // Get system settings for compression and watermark
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();

    // Compress image
    await sharp(rawPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: settings.compression_quality })
      .toFile(compressedPath);

    // Watermark image
    await sharp(compressedPath)
      .composite([{
        input: Buffer.from(`<svg><text x="10" y="30" font-size="24" fill="white" fill-opacity="0.5">${settings.watermark_text}</text></svg>`),
        gravity: 'southeast'
      }])
      .toFile(watermarkedPath);

    // Mock AI Tagging
    let aiTags = tags;
    if (settings.ai_tagging_enabled && !tags) {
      const mockTags = ['Portrait', 'Outdoor', 'Professional', 'Cinematic', 'Soft Lighting'];
      aiTags = mockTags.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');
    }

    // Save to database
    const info = db.prepare(`
      INSERT INTO images (album_id, client_id, title, original_url, compressed_url, watermarked_url, category, tags, size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      albumId || null,
      clientId || null,
      title,
      `/uploads/raw/${fileName}`,
      `/uploads/compressed/${fileName}`,
      `/uploads/watermarked/${fileName}`,
      category,
      aiTags,
      file.size
    );

    // Add activity
    db.prepare('INSERT INTO activity (user_id, client_name, activity_type, album_name, date) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'Photographer', `Uploaded ${title}`, 'System', new Date().toLocaleDateString());

    res.status(201).json({
      success: true,
      data: {
        id: info.lastInsertRowid,
        title,
        urls: {
          original: `/uploads/raw/${fileName}`,
          compressed: `/uploads/compressed/${fileName}`,
          watermarked: `/uploads/watermarked/${fileName}`
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during image processing' });
  }
};

// @desc    Get all images
// @route   GET /api/v1/images
// @access  Private
exports.getImages = (req, res) => {
  try {
    const images = db.prepare('SELECT * FROM images ORDER BY created_at DESC').all();
    res.status(200).json({ success: true, count: images.length, data: images });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete image
// @route   DELETE /api/v1/images/:id
// @access  Private (Photographer)
exports.deleteImage = (req, res) => {
  try {
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Optional: Delete physical files
    // const paths = [image.original_url, image.compressed_url, image.watermarked_url];
    // paths.forEach(p => { if(p) fs.unlinkSync(path.join(__dirname, '..', p)); });

    db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
