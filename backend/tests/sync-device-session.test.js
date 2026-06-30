import test, { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import signature from 'cookie-signature';

process.env.BEATLY_TEST = 'true';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beatly_phase18_tests';

const { default: app } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');
const { sessionStore } = await import('../src/config/session.js');
const { User } = await import('../src/database/index.js');
const { default: Device } = await import('../src/models/Device.model.js');
const { default: SyncQueue } = await import('../src/models/SyncQueue.model.js');
const syncQueueService = await import('../src/services/sync/syncQueue.service.js');

const sessionMaxAge = 24 * 60 * 60 * 1000;

const storeSet = (sid, data) => new Promise((resolve, reject) => {
  sessionStore.set(sid, data, (error) => (error ? reject(error) : resolve()));
});

const storeGet = (sid) => new Promise((resolve, reject) => {
  sessionStore.get(sid, (error, session) => (error ? reject(error) : resolve(session)));
});

const createCookie = (sid) => {
  const signed = `s:${signature.sign(sid, env.SESSION_SECRET)}`;
  return `connect.sid=${encodeURIComponent(signed)}`;
};

const createUser = (suffix) => User.create({
  spotifyId: `spotify-${suffix}`,
  displayName: `Test User ${suffix}`,
  email: `phase18-${suffix}@beatly.test`,
  product: 'premium',
  spotify: {
    accessToken: `access-${suffix}`,
    refreshToken: `refresh-${suffix}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  }
});

const createSession = async (user, sid) => {
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

const authed = (method, path, cookie) => request(app)[method](path).set('Cookie', cookie);

describe('Phase 18.4 sync, device, and session integration coverage', () => {
  let user;
  let otherUser;
  let cookie;
  let currentSid;

  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({ email: /@beatly\.test$/ }),
      Device.deleteMany({ deviceName: /^Phase18/ }),
      SyncQueue.deleteMany({ mutationId: /^phase18-/ })
    ]);

    user = await createUser(`${Date.now()}-a`);
    otherUser = await createUser(`${Date.now()}-b`);
    currentSid = `phase18-current-${Date.now()}`;
    cookie = await createSession(user, currentSid);
  });

  after(async () => {
    await Promise.all([
      User.deleteMany({ email: /@beatly\.test$/ }),
      Device.deleteMany({ deviceName: /^Phase18/ }),
      SyncQueue.deleteMany({ mutationId: /^phase18-/ })
    ]);
    await mongoose.disconnect();
  });

  it('rejects unauthenticated sync mutation batches', async () => {
    const res = await request(app)
      .post('/api/sync/mutations')
      .send({ deviceId: new mongoose.Types.ObjectId().toString(), mutations: [] });

    assert.strictEqual(res.statusCode, 401);
    assert.match(JSON.stringify(res.body), /Unauthorized|NO_SESSION/);
  });

  it('accepts authenticated mutation batches, processes supported replay work, and suppresses duplicate mutation IDs', async () => {
    const device = await Device.create({
      user: user._id,
      deviceName: 'Phase18 Web',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-device-session'
    });

    const mutation = {
      mutationId: 'phase18-device-rename',
      type: 'api_request',
      action: `/api/devices/${device._id}`,
      clientTimestamp: new Date().toISOString(),
      payload: {
        method: 'PATCH',
        url: `/api/devices/${device._id}`,
        data: { deviceName: 'Phase18 Web Renamed' }
      }
    };

    const first = await authed('post', '/api/sync/mutations', cookie)
      .send({ deviceId: device._id.toString(), mutations: [mutation] });

    assert.strictEqual(first.statusCode, 200);
    assert.strictEqual(first.body.success, true);
    assert.strictEqual(first.body.queued, 1);

    await syncQueueService.processQueue();

    const renamed = await Device.findById(device._id);
    assert.strictEqual(renamed.deviceName, 'Phase18 Web Renamed');

    const second = await authed('post', '/api/sync/mutations', cookie)
      .send({ deviceId: device._id.toString(), mutations: [mutation] });

    assert.strictEqual(second.statusCode, 200);
    assert.strictEqual(second.body.queued, 0);
    assert.strictEqual(await SyncQueue.countDocuments({ mutationId: mutation.mutationId, user: user._id }), 1);
  });

  it('rejects sync mutation batches for unregistered or foreign devices', async () => {
    const foreignDevice = await Device.create({
      user: otherUser._id,
      deviceName: 'Phase18 Foreign Device',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-foreign-session'
    });

    const res = await authed('post', '/api/sync/mutations', cookie).send({
      deviceId: foreignDevice._id.toString(),
      mutations: [{
        mutationId: 'phase18-foreign-replay',
        type: 'api_request',
        action: '/api/devices/foreign',
        clientTimestamp: new Date().toISOString()
      }]
    });

    assert.strictEqual(res.statusCode, 403);
    assert.match(res.body.message, /Device does not belong/);
  });

  it('returns validation errors without leaking stack traces for malformed sync batches', async () => {
    const device = await Device.create({
      user: user._id,
      deviceName: 'Phase18 Validation Device',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-validation-session'
    });

    const res = await authed('post', '/api/sync/mutations', cookie).send({
      deviceId: device._id.toString(),
      mutations: [{ mutationId: 'phase18-invalid' }]
    });

    assert.strictEqual(res.statusCode, 400);
    assert.ok(Array.isArray(res.body.errors));
    assert.doesNotMatch(JSON.stringify(res.body), /stack|at process|node:internal/i);
  });

  it('records unsupported queued mutations as failed and respects retry backoff', async () => {
    const device = await Device.create({
      user: user._id,
      deviceName: 'Phase18 Backoff Device',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-backoff-session'
    });

    const task = await SyncQueue.create({
      mutationId: 'phase18-unsupported-backoff',
      user: user._id,
      device: device._id,
      type: 'api_request',
      action: '/api/not-supported',
      payload: {
        method: 'POST',
        url: '/api/not-supported',
        data: {}
      },
      clientTimestamp: new Date()
    });

    await syncQueueService.processQueue();

    const failed = await SyncQueue.findById(task._id);
    assert.strictEqual(failed.status, 'failed');
    assert.strictEqual(failed.retryCount, 1);
    assert.match(failed.error, /Unsupported API replay mutation/);

    await syncQueueService.processQueue();

    const backedOff = await SyncQueue.findById(task._id);
    assert.strictEqual(backedOff.retryCount, 1);
    assert.strictEqual(backedOff.status, 'failed');
  });

  it('lists only the authenticated user devices', async () => {
    await Device.create([
      {
        user: user._id,
        deviceName: 'Phase18 Own Device',
        deviceType: 'web',
        platform: 'Web',
        sessionId: 'phase18-own-list'
      },
      {
        user: otherUser._id,
        deviceName: 'Phase18 Other Device',
        deviceType: 'web',
        platform: 'Web',
        sessionId: 'phase18-other-list'
      }
    ]);

    const res = await authed('get', '/api/devices', cookie);

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body.map((device) => device.deviceName), ['Phase18 Own Device']);
  });

  it('prevents updating or deleting another user device', async () => {
    const foreignDevice = await Device.create({
      user: otherUser._id,
      deviceName: 'Phase18 Protected Device',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-protected-session'
    });

    const patch = await authed('patch', `/api/devices/${foreignDevice._id}`, cookie)
      .send({ deviceName: 'Compromised' });
    const del = await authed('delete', `/api/devices/${foreignDevice._id}`, cookie);

    assert.strictEqual(patch.statusCode, 404);
    assert.strictEqual(del.statusCode, 404);

    const stillThere = await Device.findById(foreignDevice._id);
    assert.strictEqual(stillThere.deviceName, 'Phase18 Protected Device');
  });

  it('rejects non-allowlisted device update fields', async () => {
    const device = await Device.create({
      user: user._id,
      deviceName: 'Phase18 Allowlist Device',
      deviceType: 'web',
      platform: 'Web',
      sessionId: 'phase18-allowlist-session'
    });

    const res = await authed('patch', `/api/devices/${device._id}`, cookie)
      .send({ deviceName: 'Valid Rename', isOnline: false });

    assert.strictEqual(res.statusCode, 400);
    assert.match(JSON.stringify(res.body), /Unsupported device fields: isOnline/);

    const unchanged = await Device.findById(device._id);
    assert.strictEqual(unchanged.deviceName, 'Phase18 Allowlist Device');
  });

  it('deleting an owned device destroys the target session but keeps the current session active', async () => {
    const targetSid = `phase18-delete-target-${Date.now()}`;
    await createSession(user, targetSid);
    const device = await Device.create({
      user: user._id,
      deviceName: 'Phase18 Delete Target',
      deviceType: 'web',
      platform: 'Web',
      sessionId: targetSid
    });

    const res = await authed('delete', `/api/devices/${device._id}`, cookie);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(await storeGet(targetSid), undefined);

    const stillAuthed = await authed('get', '/api/devices', cookie);
    assert.strictEqual(stillAuthed.statusCode, 200);
  });

  it('remote logout destroys the target session, removes the target device, and preserves the current session', async () => {
    const targetSid = `phase18-logout-target-${Date.now()}`;
    await createSession(user, targetSid);
    await Device.create({
      user: user._id,
      deviceName: 'Phase18 Logout Target',
      deviceType: 'desktop',
      platform: 'Electron',
      sessionId: targetSid
    });

    const res = await authed('post', '/api/session/logout-device', cookie)
      .send({ sessionId: targetSid });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(await storeGet(targetSid), undefined);
    assert.strictEqual(await Device.countDocuments({ sessionId: targetSid }), 0);

    const current = await authed('get', '/api/session/devices', cookie);
    assert.strictEqual(current.statusCode, 200);
  });

  it('remote logout refuses another user session and leaves it intact', async () => {
    const foreignSid = `phase18-foreign-logout-${Date.now()}`;
    await createSession(otherUser, foreignSid);
    await Device.create({
      user: otherUser._id,
      deviceName: 'Phase18 Foreign Logout Target',
      deviceType: 'desktop',
      platform: 'Electron',
      sessionId: foreignSid
    });

    const res = await authed('post', '/api/session/logout-device', cookie)
      .send({ sessionId: foreignSid });

    assert.strictEqual(res.statusCode, 404);
    assert.ok(await storeGet(foreignSid));
    assert.strictEqual(await Device.countDocuments({ sessionId: foreignSid }), 1);
  });
});
