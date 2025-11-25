import express from 'express'
import pool from '../database/pool.js'

const router = express.Router()

function xmlEscape(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:5173'
    const urls = new Set([
      '/', '/blog', '/orientation', '/compare', '/contact', '/about'
    ])

    try {
      const result = await pool.query('SELECT slug, updated_at FROM articles WHERE published = true LIMIT 5000')
      for (const a of result.rows || []) urls.add(`/blog/${a.slug}`)
    } catch {}
    try {
      const result = await pool.query('SELECT username, updated_at FROM users WHERE username IS NOT NULL LIMIT 5000')
      for (const u of result.rows || []) if (u.username) urls.add(`/u/${u.username}`)
    } catch {}
    try {
      const result = await pool.query('SELECT slug, updated_at FROM universities LIMIT 5000')
      for (const u of result.rows || []) if (u.slug) urls.add(`/universities/${u.slug}`)
    } catch {}

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      Array.from(urls).map(u => `\n  <url><loc>${xmlEscape(base + u)}</loc></url>`).join('') +
      `\n</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(body)
  } catch (e) {
    res.status(500).send('')
  }
})

export default router
