import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

export function securityMiddleware() {
  const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  
  // CORS configuration - critical for Clerk refresh cookies
  // Must allow credentials and proper origin matching for cookies to work
  const corsOptions = origins.length
    ? { 
        origin: origins, 
        credentials: true, // Essential for cookies (including Clerk refresh cookies)
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['x-clerk-auth-message', 'x-clerk-auth-reason', 'x-clerk-auth-status'],
        maxAge: 86400, // 24 hours
      }
    : { 
        origin: true, // Allow all origins in development
        credentials: true, // Essential for cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['x-clerk-auth-message', 'x-clerk-auth-reason', 'x-clerk-auth-status'],
        maxAge: 86400,
      };

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
