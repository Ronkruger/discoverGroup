import express from 'express';
import User from '../../models/User';
import { requireAdmin } from '../../middleware/auth';

const router = express.Router();

// GET /admin/users - List all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const filter = includeArchived === 'true' ? {} : { isArchived: { $ne: true } };
    const users = await User.find(filter, '-password'); // Exclude password
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

// PATCH /admin/users/:id/archive - Archive user (soft delete)
router.patch('/:id/archive', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id, 
      { isArchived: true, isActive: false }, 
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User archived successfully', user });
  } catch {
    res.status(500).json({ error: 'Failed to archive user' });
  }
});

// PATCH /admin/users/:id/unarchive - Unarchive user (restore)
router.patch('/:id/unarchive', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id, 
      { isArchived: false, isActive: true }, 
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User unarchived successfully', user });
  } catch {
    res.status(500).json({ error: 'Failed to unarchive user' });
  }
});

// DELETE /admin/users/:id - Permanently delete user
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User permanently deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
