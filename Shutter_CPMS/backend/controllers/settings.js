const db = require('../db');

// @desc    Get system settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update system settings
// @route   PUT /api/v1/settings
// @access  Private (Admin)
exports.updateSettings = (req, res) => {
  const { 
    watermark_text, 
    watermark_opacity,
    watermark_size,
    watermark_position,
    watermark_color,
    watermark_font,
    compression_quality, 
    allow_client_downloads, 
    ai_tagging_enabled 
  } = req.body;

  try {
    db.prepare(`
      UPDATE system_settings 
      SET 
        watermark_text = ?,
        watermark_opacity = ?,
        watermark_size = ?,
        watermark_position = ?,
        watermark_color = ?,
        watermark_font = ?,
        compression_quality = ?, 
        allow_client_downloads = ?, 
        ai_tagging_enabled = ?
      WHERE id = 1
    `).run(
      watermark_text !== undefined ? watermark_text : 'Shutter CMS',
      watermark_opacity !== undefined ? watermark_opacity : 0.5,
      watermark_size !== undefined ? watermark_size : 20,
      watermark_position !== undefined ? watermark_position : 'bottom-right',
      watermark_color !== undefined ? watermark_color : '#ffffff',
      watermark_font !== undefined ? watermark_font : 'sans-serif',
      compression_quality !== undefined ? compression_quality : 80,
      allow_client_downloads ? 1 : 0,
      ai_tagging_enabled ? 1 : 0
    );
    
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
