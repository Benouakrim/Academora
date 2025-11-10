import * as Sentry from '@sentry/node';

export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Capture in Sentry if configured
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.captureException(err);
  }
  const status = err.status || 500;
  const message = status >= 500 ? 'Internal server error' : (err.message || 'Request failed');
  res.status(status).json({ error: message });
}
