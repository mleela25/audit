const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'shutter_cms_secret_key_2024';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const info = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run(name, email, hashedPassword, role || 'photographer');

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = generateToken(user.id);

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({ success: true, token, user: userWithoutPassword });
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
