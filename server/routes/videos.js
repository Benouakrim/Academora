import express from 'express';
import { listPublicSiteVideos } from '../data/siteVideos.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const videos = await listPublicSiteVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching site videos:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

export default router;


