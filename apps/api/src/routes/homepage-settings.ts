import express from 'express';
import HomepageSettings from '../models/HomepageSettings';

const router = express.Router();

// Get homepage settings
router.get('/', async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    // If no settings exist, create default
    if (!settings) {
      settings = new HomepageSettings({});
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    res.status(500).json({ error: 'Failed to fetch homepage settings' });
  }
});

// Update homepage settings
router.put('/', async (req, res) => {
  try {
    const { statistics, hero, features, testimonials, logo } = req.body;
    
    let settings = await HomepageSettings.findOne();
    
    if (!settings) {
      settings = new HomepageSettings({});
    }
    
    // Update fields
    if (statistics) settings.statistics = { ...settings.statistics, ...statistics };
    if (hero) settings.hero = { ...settings.hero, ...hero };
    if (features) settings.features = features;
    if (testimonials) settings.testimonials = testimonials;
    if (logo) settings.logo = { ...settings.logo, ...logo };
    
    settings.updatedAt = new Date();
    await settings.save();
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating homepage settings:', error);
    res.status(500).json({ error: 'Failed to update homepage settings' });
  }
});

export default router;
