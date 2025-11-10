import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

export function securityMiddleware() {
  const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const corsOptions = origins.length
    ? { origin: origins, credentials: true }
    : { origin: true, credentials: true };

  return [
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // keep simple for MVP, can harden later
    }),
    cors(corsOptions),
    pinoHttp({
      autoLogging: process.env.NODE_ENV !== 'test',
      redact: {
        paths: ['req.headers.authorization'],
        censor: '[REDACTED]'
      },
      customLogLevel: function (res, err) {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  ];
}
