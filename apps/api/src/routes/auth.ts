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

// GET /auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as jwt.JwtPayload;
    const user = await User.findById(decoded.id as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const obj = 'toObject' in user
      ? (user as { toObject: () => Record<string, unknown> }).toObject()
      : (user as Record<string, unknown>);
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN ATTEMPT:', { email, password });
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  console.log('User found in DB:', user);
  if (!user) {
    console.log('No user found for email:', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
  if (!isMatch) {
    console.log('Password mismatch for user:', email);
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
