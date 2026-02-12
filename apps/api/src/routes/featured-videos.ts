import express from 'express';
import FeaturedVideo from '../models/FeaturedVideo';

const router = express.Router();

// GET /api/featured-videos
// Returns active videos by default. Use ?all=true for all videos.
router.get('/', async (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const filter = includeAll ? {} : { is_active: true };

    const videos = await FeaturedVideo.find(filter)
      .sort({ display_order: 1, createdAt: 1 })
      .lean();

    const normalized = videos.map((video) => ({
      id: String(video._id),
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      display_order: video.display_order,
      is_active: video.is_active,
    }));

    res.json(normalized);
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    res.status(500).json({ error: 'Failed to fetch featured videos' });
  }
});

export default router;
