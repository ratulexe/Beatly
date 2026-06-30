import test, { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.BEATLY_TEST = 'true';
const { default: app } = await import('../src/app.js');

describe('Leaderboard Routes', () => {
  after(async () => {
    await mongoose.disconnect();
  });

  it('GET /api/leaderboards/global should return 401 without auth', async () => {
    const res = await request(app).get('/api/leaderboards/global');
    assert.ok([401, 403].includes(res.statusCode));
  });

  it('GET /api/leaderboards/season/summer-2027 should return 401 without auth', async () => {
    const res = await request(app).get('/api/leaderboards/season/summer-2027');
    assert.ok([401, 403].includes(res.statusCode));
  });
});
