const db = require('../db');

// @desc    Get dashboard stats
// @route   GET /api/v1/analytics/stats
// @access  Private
exports.getStats = (req, res) => {
  try {
    const clientsCount = db.prepare('SELECT count(*) as count FROM clients WHERE photographer_id = ?').get(req.user.id);
    const imagesCount = db.prepare('SELECT count(*) as count FROM images i JOIN albums a ON i.album_id = a.id WHERE a.photographer_id = ?').get(req.user.id);
    const bookingsCount = db.prepare('SELECT count(*) as count FROM bookings WHERE photographer_id = ?').get(req.user.id);
    const storageUsed = db.prepare('SELECT sum(size) as total FROM images i JOIN albums a ON i.album_id = a.id WHERE a.photographer_id = ?').get(req.user.id);

    res.json({
      success: true,
      data: {
        clients: clientsCount.count,
        images: imagesCount.count,
        bookings: bookingsCount.count,
        storageUsed: `${(storageUsed.total / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        aiTagged: Math.floor(imagesCount.count * 0.8), // Mock AI tag count
        downloads: 1542 // Mock download count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// @desc    Get system-wide stats for Admin
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin)
exports.getAdminStats = (req, res) => {
  try {
    const photographersCount = db.prepare("SELECT count(*) as count FROM users WHERE role = 'photographer'").get();
    const clientsCount = db.prepare('SELECT count(*) as count FROM clients').get();
    const totalImages = db.prepare('SELECT count(*) as count FROM images').get();
    const totalBookings = db.prepare('SELECT count(*) as count FROM bookings').get();

    res.json({
      success: true,
      data: {
        totalPhotographers: photographersCount.count,
        totalClients: clientsCount.count,
        totalImages: totalImages.count,
        totalBookings: totalBookings.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// @desc    Get recent activity
// @route   GET /api/v1/analytics/activity
// @access  Private
exports.getActivity = (req, res) => {
  try {
    const activity = db.prepare(`
      SELECT a.*, u.name as user_name 
      FROM activity a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = ? 
      ORDER BY a.created_at DESC 
      LIMIT 5
    `).all(req.user.id);

    const bookings = db.prepare(`
      SELECT * FROM bookings 
      WHERE photographer_id = ? AND status != 'cancelled'
      ORDER BY shoot_date ASC 
      LIMIT 5
    `).all(req.user.id);

    res.json({
      success: true,
      data: {
        activity: activity.map(a => ({
          id: a.id,
          client_name: a.client_name || 'System',
          activity: a.activity_type,
          album: a.album_name || 'General',
          date: a.date
        })),
        bookings: bookings.map(b => ({
          id: b.id,
          client_name: b.client_name,
          type: b.shoot_type,
          shoot_date: b.shoot_date,
          status: b.status
        }))
      }
    });
  } catch (error) {
    console.error('Activity Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};
