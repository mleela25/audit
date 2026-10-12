const db = require('../db');

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
exports.getClients = (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients WHERE photographer_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Add new client
// @route   POST /api/v1/clients
// @access  Private (Photographer)
exports.addClient = (req, res) => {
  const { name, email, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Please provide name and email' });
  }

  try {
    const info = db.prepare('INSERT INTO clients (photographer_id, name, email, status, last_activity) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, name, email, status || 'active', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update client
// @route   PUT /api/v1/clients/:id
// @access  Private (Photographer)
exports.updateClient = (req, res) => {
  const { name, email, status } = req.body;

  try {
    const result = db.prepare(`
      UPDATE clients 
      SET name = ?, email = ?, status = ?
      WHERE id = ? AND photographer_id = ?
    `).run(name, email, status, req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found or unauthorized' });
    }

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete client
// @route   DELETE /api/v1/clients/:id
// @access  Private (Photographer)
exports.deleteClient = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM clients WHERE id = ? AND photographer_id = ?').run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
