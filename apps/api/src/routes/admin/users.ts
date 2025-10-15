import express from 'express';
import User from '../../models/User';
import { requireAdmin } from '../../middleware/auth';

const router = express.Router();

// GET /admin/users - List all users (admin only)
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /admin/users/:id - Update user (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.password) delete updates.password; // Prevent password change here
    const user = await User.findByIdAndUpdate(id, updates, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
