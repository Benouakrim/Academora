import express from 'express';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  listAllSiteVideos,
  createSiteVideo,
  updateSiteVideo,
  deleteSiteVideo,
} from '../data/siteVideos.js';

const router = express.Router();

router.use(parseUserToken, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const videos = await listAllSiteVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error listing site videos:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const video = await createSiteVideo(req.body || {});
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating site video:', error);
    res.status(500).json({ error: error.message || 'Failed to create video' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const video = await updateSiteVideo(req.params.id, req.body || {});

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error updating site video:', error);
    res.status(500).json({ error: error.message || 'Failed to update video' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteSiteVideo(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting site video:', error);
    res.status(500).json({ error: error.message || 'Failed to delete video' });
  }
});

export default router;


