import { Router, Request, Response } from 'express';
import Country from '../models/Country';

const router = Router();

// Get all countries
router.get('/', async (req: Request, res: Response) => {
  try {
    const countries = await Country.find({ isActive: true }).sort({ name: 1 });
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get single country by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const country = await Country.findOne({ slug: req.params.slug, isActive: true });
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ error: 'Failed to fetch country' });
  }
});

// Create new country (admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const country = new Country(req.body);
    await country.save();
    res.status(201).json(country);
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({ error: 'Failed to create country' });
  }
});

// Update country (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ error: 'Failed to update country' });
  }
});

// Delete country (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ error: 'Failed to delete country' });
  }
});

// Add attraction to country
router.post('/:id/attractions', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    country.attractions.push(req.body);
    await country.save();
    res.status(201).json(country);
  } catch (error) {
    console.error('Error adding attraction:', error);
    res.status(500).json({ error: 'Failed to add attraction' });
  }
});

// Update attraction
router.put('/:id/attractions/:attractionId', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const attraction = country.attractions.id(req.params.attractionId);
    if (!attraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }
    
    Object.assign(attraction, req.body);
    await country.save();
    res.json(country);
  } catch (error) {
    console.error('Error updating attraction:', error);
    res.status(500).json({ error: 'Failed to update attraction' });
  }
});

// Delete attraction
router.delete('/:id/attractions/:attractionId', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    country.attractions.pull(req.params.attractionId);
    await country.save();
    res.json(country);
  } catch (error) {
    console.error('Error deleting attraction:', error);
    res.status(500).json({ error: 'Failed to delete attraction' });
  }
});

// Add testimonial to country
router.post('/:id/testimonials', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    country.testimonials.push(req.body);
    await country.save();
    res.status(201).json(country);
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// Update testimonial
router.put('/:id/testimonials/:testimonialId', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const testimonial = country.testimonials.id(req.params.testimonialId);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    Object.assign(testimonial, req.body);
    await country.save();
    res.json(country);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial
router.delete('/:id/testimonials/:testimonialId', async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    country.testimonials.pull(req.params.testimonialId);
    await country.save();
    res.json(country);
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
