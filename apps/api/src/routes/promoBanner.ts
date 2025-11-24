import express from 'express';
import PromoBanner from '../models/PromoBanner';

const router = express.Router();

// Get active promo banner (public route)
router.get('/active', async (req, res) => {
  try {
    const banner = await PromoBanner.findOne({ isEnabled: true });
    
    // Check if banner is within date range
    if (banner) {
      const now = new Date();
      if (banner.startDate && now < banner.startDate) {
        return res.json({ banner: null });
      }
      if (banner.endDate && now > banner.endDate) {
        return res.json({ banner: null });
      }
    }
    
    res.json({ banner });
  } catch (error) {
    console.error('Error fetching active banner:', error);
    res.status(500).json({ error: 'Failed to fetch promo banner' });
  }
});

// Get all promo banners (admin only)
router.get('/', async (req, res) => {
  try {
    const banners = await PromoBanner.find().sort({ createdAt: -1 });
    res.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Get single banner by ID
router.get('/:id', async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ banner });
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
});

// Create new promo banner
router.post('/', async (req, res) => {
  try {
    const banner = new PromoBanner(req.body);
    await banner.save();
    res.status(201).json({ banner, message: 'Promo banner created successfully' });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// Update promo banner
router.put('/:id', async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    res.json({ banner, message: 'Promo banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// Toggle banner status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    banner.isEnabled = !banner.isEnabled;
    await banner.save();
    
    res.json({ 
      banner, 
      message: `Banner ${banner.isEnabled ? 'enabled' : 'disabled'} successfully` 
    });
  } catch (error) {
    console.error('Error toggling banner:', error);
    res.status(500).json({ error: 'Failed to toggle banner' });
  }
});

// Delete promo banner
router.delete('/:id', async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

export default router;
