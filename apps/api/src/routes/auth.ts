
import express from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName, role, phone, birthDate, gender } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    fullName,
    role: role || 'client',
    isActive: true,
    phone,
    birthDate,
    gender,
  });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
    },
  });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

export default router;
