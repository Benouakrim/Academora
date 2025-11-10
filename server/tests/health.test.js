import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health endpoint', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    if (res.status !== 200) {
      console.log('Response body:', res.body);
      console.log('Response status:', res.status);
    }
    expect(res.status).toBe(200);
    expect(res.body?.status).toBe('ok');
  });
});
