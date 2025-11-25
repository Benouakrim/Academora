import express from 'express';
import pool from '../database/pool.js';

const router = express.Router();

// Get public profile by username (or id fallback)
router.get('/:username', async (req, res) => {
  try {
    const key = req.params.username;
    
    const userResult = await pool.query(
      `SELECT id, email, role, created_at, first_name, last_name, username, bio, avatar_url, 
              is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity
       FROM users WHERE username = $1 LIMIT 1`,
      [key]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = userResult.rows[0];
    const full_name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || null;

    if (!data.is_profile_public) {
      return res.json({
        id: data.id,
        username: data.username,
        full_name: full_name,
        avatar_url: data.avatar_url,
        is_profile_public: false,
      });
    }

    // Build response object
    const response = {
      id: data.id,
      username: data.username,
      full_name: full_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      role: data.role,
      created_at: data.created_at,
      is_profile_public: data.is_profile_public,
    };

    // Apply privacy flags
    if (data.show_email) {
      response.email = data.email;
    }

    // Attach badges if table exists
    let badges = [];
    try {
      const badgesResult = await pool.query(
        'SELECT awarded_at FROM user_badges WHERE user_id = $1',
        [data.id]
      );
      badges = badgesResult.rows || [];
    } catch {}

    // Attach recent reviews if visible
    let reviews = [];
    if (data.show_reviews) {
      try {
        const reviewsResult = await pool.query(
          'SELECT id, university_id, rating, content as comment, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
          [data.id]
        );
        reviews = reviewsResult.rows || [];
      } catch {}
    }

    // Attach profile sections if activity visible
    let experiences = [], education = [], projects = [], certifications = [];
    if (data.show_activity) {
      try {
        const [ex, ed, pr, ce] = await Promise.all([
          pool.query('SELECT id, title, company, location, start_date, end_date, current, description, created_at FROM experiences WHERE user_id = $1 ORDER BY start_date DESC LIMIT 10', [data.id]),
          pool.query('SELECT id, school, degree, field, start_year, end_year, description, created_at FROM education_entries WHERE user_id = $1 ORDER BY start_year DESC LIMIT 10', [data.id]),
          pool.query('SELECT id, name, role, url, description, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [data.id]),
          pool.query('SELECT id, name, issuer, issue_date, credential_id, credential_url, created_at FROM certifications WHERE user_id = $1 ORDER BY issue_date DESC LIMIT 10', [data.id]),
        ]);
        experiences = ex.rows || [];
        education = ed.rows || [];
        projects = pr.rows || [];
        certifications = ce.rows || [];
      } catch {}
    }

    res.json({ ...response, badges: badges || [], recent_reviews: reviews, experiences, education, projects, certifications });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to load profile' });
  }
});

export default router;
