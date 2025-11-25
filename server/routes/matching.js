import { Router } from 'express';
import pool from '../database/pool.js';
import { getMatchingUniversities } from '../services/matchingService.js';
import { parseUserToken } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';
import { validate } from '../middleware/validate.js';
import { matchingCriteriaSchema } from '../validation/matchingSchemas.js';

const router = Router();

// This endpoint is now public, with access controlled via middleware.
router.post(
  '/',
  parseUserToken,
  checkFeatureAccess('matching-engine'),
  logUsage('matching-engine'),
  validate(matchingCriteriaSchema),
  async (req, res) => {
    try {
      const criteria = req.validated || {};

      // Fetch user preference weights if available to inform scoring
      const userId = req.user?.id;
      if (userId) {
        try {
          const result = await pool.query(
            'SELECT weight_tuition, weight_location, weight_ranking, weight_program, weight_language FROM user_preferences WHERE user_id = $1',
            [userId]
          );
          if (result.rows[0]) {
            criteria._weights = result.rows[0];
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }

      const result = await getMatchingUniversities(criteria, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error in matching route:', error);
      res.status(500).json({ error: 'Failed to get matching universities.' });
    }
  }
);

export default router;
