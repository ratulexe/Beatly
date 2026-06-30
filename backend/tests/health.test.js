import test, { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.BEATLY_TEST = 'true';
const { default: app } = await import('../src/app.js');

describe('Health Routes', () => {
  after(async () => {
    await mongoose.disconnect();
  });

  it('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.text, 'OK');
  });

  it('GET /api/health/status should return detailed status', async () => {
    const res = await request(app).get('/api/health/status');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.status !== undefined);
    assert.ok(res.body.timestamp !== undefined);
    assert.ok(res.body.dependencies !== undefined);
  });

  it('GET /api/health/metrics should return metrics', async () => {
    const res = await request(app).get('/api/health/metrics');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.uptime !== undefined);
    assert.ok(res.body.memory !== undefined);
    assert.ok(res.body.system !== undefined);
  });
});
