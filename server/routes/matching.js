import { Router } from 'express';
import supabase from '../database/supabase.js';
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
        const { data, error } = await supabase
          .from('user_preferences')
          .select('weight_tuition, weight_location, weight_ranking, weight_program, weight_language')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          criteria._weights = data;
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
