import { Router, Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to authenticate user from JWT token
function authenticateUser(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as { id: string };
    (req as Request & { userId: string }).userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/favorites - Get user's favorite tours
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      favorites: user.favorites || [],
      count: user.favorites?.length || 0
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// POST /api/favorites - Add a tour to favorites
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { tourSlug } = req.body;
    
    if (!tourSlug) {
      return res.status(400).json({ error: 'Tour slug is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already in favorites
    if (!user.favorites) {
      user.favorites = [];
    }
    
    if (user.favorites.includes(tourSlug)) {
      return res.status(400).json({ error: 'Tour already in favorites' });
    }
    
    // Add to favorites
    user.favorites.push(tourSlug);
    await user.save();
    
    console.log(`✅ Added tour ${tourSlug} to favorites for user ${user.email}`);
    res.json({ 
      message: 'Tour added to favorites',
      favorites: user.favorites,
      count: user.favorites.length
    });
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/favorites/:tourSlug - Remove a tour from favorites
router.delete('/:tourSlug', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { tourSlug } = req.params;
    
    if (!tourSlug) {
      return res.status(400).json({ error: 'Tour slug is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove from favorites
    if (!user.favorites) {
      user.favorites = [];
    }
    
    const index = user.favorites.indexOf(tourSlug);
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not in favorites' });
    }
    
    user.favorites.splice(index, 1);
    await user.save();
    
    console.log(`✅ Removed tour ${tourSlug} from favorites for user ${user.email}`);
    res.json({ 
      message: 'Tour removed from favorites',
      favorites: user.favorites,
      count: user.favorites.length
    });
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// POST /api/favorites/toggle - Toggle a tour in favorites (add if not present, remove if present)
router.post('/toggle', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { tourSlug } = req.body;
    
    if (!tourSlug) {
      return res.status(400).json({ error: 'Tour slug is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    const index = user.favorites.indexOf(tourSlug);
    let action: 'added' | 'removed';
    
    if (index === -1) {
      // Add to favorites
      user.favorites.push(tourSlug);
      action = 'added';
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      action = 'removed';
    }
    
    await user.save();
    
    console.log(`✅ ${action === 'added' ? 'Added' : 'Removed'} tour ${tourSlug} ${action === 'added' ? 'to' : 'from'} favorites for user ${user.email}`);
    res.json({ 
      action,
      message: `Tour ${action === 'added' ? 'added to' : 'removed from'} favorites`,
      favorites: user.favorites,
      count: user.favorites.length,
      isFavorite: action === 'added'
    });
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

export default router;
