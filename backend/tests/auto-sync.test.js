import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import signature from 'cookie-signature';

process.env.BEATLY_TEST = 'true';
process.env.NODE_ENV = 'test';
process.env.AUTO_SYNC_SECRET = 'phase20-test-secret';
process.env.AUTO_SYNC_ENABLED = 'false';
process.env.AUTO_SYNC_BATCH_SIZE = '20';
process.env.MONGODB_URI = 'mongodb://localhost:27017/beatly_phase20_tests';

const { default: app } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');
const { sessionStore } = await import('../src/config/session.js');
const { User, Track, ListeningHistory } = await import('../src/database/index.js');
const { runAutoSync } = await import('../src/services/sync/autoSync.service.js');
const { trackRepository } = await import('../src/services/database/trackRepository.js');

const testEmailPattern = /@phase20\.beatly\.test$/;
const sessionMaxAge = 24 * 60 * 60 * 1000;

const storeSet = (sid, data) => new Promise((resolve, reject) => {
  sessionStore.set(sid, data, (error) => (error ? reject(error) : resolve()));
});

const createCookie = (sid) => {
  const signed = `s:${signature.sign(sid, env.SESSION_SECRET)}`;
  return `connect.sid=${encodeURIComponent(signed)}`;
};

const createSession = async (user, sid = `phase20-session-${Date.now()}`) => {
  await storeSet(sid, {
    cookie: {
      originalMaxAge: sessionMaxAge,
      expires: new Date(Date.now() + sessionMaxAge),
      secure: false,
      httpOnly: true,
      path: '/'
    },
    userId: user._id.toString()
  });
  return createCookie(sid);
};

const createUser = (suffix, overrides = {}) => User.create({
  spotifyId: `phase20-${suffix}`,
  displayName: `Phase20 ${suffix}`,
  email: `phase20-${suffix}@phase20.beatly.test`,
  product: 'premium',
  lastLogin: new Date(),
  ...overrides
});

const expectSummaryShape = (summary) => {
  for (const key of [
    'usersChecked',
    'usersSynced',
    'usersSkipped',
    'usersFailed',
    'totalTracksAdded',
    'totalTracksSkipped'
  ]) {
    assert.strictEqual(typeof summary[key], 'number');
  }
};

describe('Phase 20.1 auto sync cron coverage', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    env.AUTO_SYNC_ENABLED = 'false';
    env.AUTO_SYNC_SECRET = 'phase20-test-secret';
    env.AUTO_SYNC_BATCH_SIZE = '20';

    await Promise.all([
      User.deleteMany({ email: testEmailPattern }),
      ListeningHistory.deleteMany({}),
      Track.deleteMany({ spotifyTrackId: /^phase20-/ })
    ]);
  });

  after(async () => {
    await Promise.all([
      User.deleteMany({ email: testEmailPattern }),
      ListeningHistory.deleteMany({}),
      Track.deleteMany({ spotifyTrackId: /^phase20-/ })
    ]);
    await mongoose.disconnect();
  });

  it('rejects cron requests without an Authorization header', async () => {
    const res = await request(app).post('/api/internal/sync/auto').send({});

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('rejects cron requests with the wrong AUTO_SYNC_SECRET', async () => {
    const res = await request(app)
      .post('/api/internal/sync/auto')
      .set('Authorization', 'Bearer wrong-secret')
      .send({});

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('accepts valid cron authorization and returns the summary shape', async () => {
    const res = await request(app)
      .post('/api/internal/sync/auto')
      .set('Authorization', 'Bearer phase20-test-secret')
      .send({});

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    expectSummaryShape(res.body.summary);
  });

  it('sync status rejects unauthenticated users', async () => {
    const res = await request(app).get('/api/sync/status');

    assert.strictEqual(res.statusCode, 401);
    assert.match(JSON.stringify(res.body), /Unauthorized|NO_SESSION/);
  });

  it('sync status returns safe sync metadata for authenticated users', async () => {
    const user = await createUser('status', {
      spotify: {
        accessToken: 'access-status',
        refreshToken: 'refresh-status',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      },
      sync: {
        lastSyncAt: new Date('2026-01-01T10:00:00.000Z'),
        lastSuccessfulSyncAt: new Date(),
        lastSyncError: 'hidden internal detail',
        tracksAdded: 3,
        tracksSkipped: 1
      }
    });
    const cookie = await createSession(user);

    const res = await request(app)
      .get('/api/sync/status')
      .set('Cookie', cookie);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.dataFreshness, 'fresh');
    assert.strictEqual(res.body.isSyncing, false);
    assert.ok(res.body.lastSuccessfulSyncAt);
    assert.doesNotMatch(JSON.stringify(res.body), /access-status|refresh-status/);
  });

  it('sync status handles never-synced users', async () => {
    const user = await createUser('never-synced', {
      spotify: {
        accessToken: 'access-never',
        refreshToken: 'refresh-never',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });
    const cookie = await createSession(user);

    const res = await request(app)
      .get('/api/sync/status')
      .set('Cookie', cookie);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.dataFreshness, 'unknown');
    assert.strictEqual(res.body.lastSuccessfulSyncAt, null);
  });

  it('auto sync skips users without Spotify refresh tokens', async () => {
    env.AUTO_SYNC_ENABLED = 'true';
    await createUser('no-token', { spotify: {} });

    const summary = await runAutoSync({
      syncRecentlyPlayed: async () => {
        throw new Error('Should not sync users without refresh tokens');
      },
      userFilter: { email: testEmailPattern }
    });

    assert.strictEqual(summary.usersChecked, 1);
    assert.strictEqual(summary.usersSkipped, 1);
    assert.strictEqual(summary.usersSynced, 0);
    assert.strictEqual(summary.usersFailed, 0);
  });

  it('auto sync continues syncing other users when one user fails', async () => {
    env.AUTO_SYNC_ENABLED = 'true';
    await createUser('fail', {
      spotify: {
        accessToken: 'access-fail',
        refreshToken: 'refresh-fail',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });
    await createUser('ok', {
      spotify: {
        accessToken: 'access-ok',
        refreshToken: 'refresh-ok',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    const summary = await runAutoSync({
      syncRecentlyPlayed: async (user) => {
        if (user.email.includes('fail')) {
          throw new Error('Synthetic sync failure');
        }
        return { newTracks: 2, duplicates: 1 };
      },
      userFilter: { email: testEmailPattern }
    });

    assert.strictEqual(summary.usersChecked, 2);
    assert.strictEqual(summary.usersSynced, 1);
    assert.strictEqual(summary.usersFailed, 1);
    assert.strictEqual(summary.totalTracksAdded, 2);
    assert.strictEqual(summary.totalTracksSkipped, 1);
  });

  it('preserves duplicate prevention for listening history inserts', async () => {
    const user = await createUser('duplicates');
    const track = await Track.create({
      spotifyTrackId: 'phase20-track-duplicate',
      name: 'Duplicate Guard',
      durationMs: 180000
    });
    const playedAt = new Date('2026-01-01T10:00:00.000Z').toISOString();
    const item = {
      track: { id: 'phase20-track-duplicate' },
      played_at: playedAt,
      context: null
    };

    const first = await trackRepository.insertListeningHistory(user._id, [item], {
      'phase20-track-duplicate': track._id
    });
    const second = await trackRepository.insertListeningHistory(user._id, [item], {
      'phase20-track-duplicate': track._id
    });

    assert.deepStrictEqual(first, { newTracks: 1, duplicates: 0 });
    assert.deepStrictEqual(second, { newTracks: 0, duplicates: 1 });
    assert.strictEqual(await ListeningHistory.countDocuments({ userId: user._id }), 1);
  });
});
