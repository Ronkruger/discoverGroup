import express from 'express';
import User from '../../models/User';
import { requireAdmin } from '../../middleware/auth';
import { IUser } from '../../models/User';

const router = express.Router();

// Helper function to transform MongoDB user to API response format
function transformUser(user: IUser & { toObject: () => Record<string, unknown> }) {
  const userObj = user.toObject();
  return {
    ...userObj,
    id: userObj._id.toString(),
    _id: undefined
  };
}

// GET /admin/users - List all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const filter = includeArchived === 'true' ? {} : { isArchived: { $ne: true } };
    const users = await User.find(filter, '-password'); // Exclude password
    const transformedUsers = users.map(transformUser);
    res.json(transformedUsers);
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
    res.json(transformUser(user));
  } catch (error) {
    console.error('Update user error:', error);
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
    res.json({ message: 'User archived successfully', user: transformUser(user) });
  } catch (error) {
    console.error('Archive user error:', error);
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
    res.json({ message: 'User unarchived successfully', user: transformUser(user) });
  } catch (error) {
    console.error('Unarchive user error:', error);
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
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
