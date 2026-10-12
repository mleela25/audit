const db = require('../db');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin)
exports.getUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['admin', 'photographer', 'client'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
exports.deleteUser = (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = (req, res) => {
  const { name, email, bio, language, timezone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    db.prepare('UPDATE users SET name = ?, email = ?, bio = ?, language = ?, timezone = ? WHERE id = ?')
      .run(name, email, bio || '', language || 'English', timezone || 'UTC+0', req.user.id);
    const user = db.prepare('SELECT id, name, email, role, bio, language, timezone FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// @desc    Update user password
// @route   PUT /api/v1/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const bcrypt = require('bcryptjs');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};
