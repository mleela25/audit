const db = require('../db');

// @desc    Get portfolio settings
// @route   GET /api/v1/portfolio
// @access  Private
exports.getPortfolio = (req, res) => {
  try {
    let settings = db.prepare('SELECT * FROM portfolio_settings WHERE photographer_id = ?').get(req.user.id);
    
    if (!settings) {
      // Create default settings if not exists
      db.prepare('INSERT INTO portfolio_settings (photographer_id, site_title, bio) VALUES (?, ?, ?)')
        .run(req.user.id, 'My Photography Portfolio', 'Welcome to my professional photography portfolio.');
      settings = db.prepare('SELECT * FROM portfolio_settings WHERE photographer_id = ?').get(req.user.id);
    }

    // Parse selected_albums if it's a string
    if (settings.selected_albums && typeof settings.selected_albums === 'string') {
      try {
        settings.selected_albums = JSON.parse(settings.selected_albums);
      } catch (e) {
        settings.selected_albums = [];
      }
    } else if (!settings.selected_albums) {
      settings.selected_albums = [];
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Portfolio Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio settings' });
  }
};

// @desc    Update portfolio settings
// @route   PUT /api/v1/portfolio
// @access  Private
exports.updatePortfolio = (req, res) => {
  try {
    const { site_title, bio, theme_color, selected_albums, show_contact } = req.body;
    
    const albumsJson = JSON.stringify(selected_albums || []);

    const result = db.prepare(`
      UPDATE portfolio_settings 
      SET site_title = ?, bio = ?, theme_color = ?, selected_albums = ?, show_contact = ?
      WHERE photographer_id = ?
    `).run(site_title, bio, theme_color, albumsJson, show_contact ? 1 : 0, req.user.id);

    if (result.changes === 0) {
      // If no row was updated, insert it
      db.prepare(`
        INSERT INTO portfolio_settings (photographer_id, site_title, bio, theme_color, selected_albums, show_contact)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, site_title, bio, theme_color, albumsJson, show_contact ? 1 : 0);
    }

    res.json({
      success: true,
      message: 'Portfolio updated successfully'
    });
  } catch (error) {
    console.error('Portfolio Update Error:', error);
    res.status(500).json({ error: 'Failed to update portfolio settings' });
  }
};
