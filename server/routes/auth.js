const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_music_super_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Middleware to authenticate token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existing = storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username,
      email: email || '',
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      favoriteLanguages: ['telugu', 'hindi', 'english'],
      favoriteGenres: ['Melody', 'Beat / Party', 'EDM', 'Romantic'],
      createdAt: new Date().toISOString()
    };

    storage.createUser(newUser);
    const token = generateToken(newUser);

    const { passwordHash: _, ...userSafe } = newUser;
    res.json({ user: userSafe, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Guest Session Initialization
router.post('/guest', (req, res) => {
  const guestId = 'guest_' + Date.now();
  const guestUser = {
    id: guestId,
    username: 'Guest Explorer',
    isGuest: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    favoriteLanguages: ['telugu', 'hindi', 'english'],
    favoriteGenres: ['Party', 'Melody', 'Lo-Fi', 'Devotional']
  };
  const token = generateToken(guestUser);
  res.json({ user: guestUser, token });
});

// Get Current User Profile
router.get('/me', authenticate, (req, res) => {
  if (req.user.id.startsWith('guest_')) {
    return res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        isGuest: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        favoriteLanguages: ['telugu', 'hindi', 'english']
      }
    });
  }

  const user = storage.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update Profile
router.put('/profile', authenticate, (req, res) => {
  if (req.user.id.startsWith('guest_')) {
    return res.json({ success: true, message: 'Guest profile updated locally' });
  }

  const updates = {};
  if (req.body.avatar) updates.avatar = req.body.avatar;
  if (req.body.bio !== undefined) updates.bio = req.body.bio;
  if (req.body.favoriteLanguages) updates.favoriteLanguages = req.body.favoriteLanguages;
  if (req.body.favoriteGenres) updates.favoriteGenres = req.body.favoriteGenres;

  const updated = storage.updateUser(req.user.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...userSafe } = updated;
  res.json({ user: userSafe });
});

module.exports = { router, authenticate };
