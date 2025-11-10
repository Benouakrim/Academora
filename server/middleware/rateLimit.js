import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_AUTH || '30'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
