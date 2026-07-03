// End-to-end smoke test of the migrated API against an in-memory MongoDB.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';

const mongod = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
process.env.MONGO_URI = mongod.getUri('propertyfinder');
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '5099';

const server = spawn('node', ['src/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env },
  stdio: ['ignore', 'pipe', 'pipe']
});
server.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[server-err] ${d}`));

await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:5099/api';
let pass = 0, fail = 0;

async function check(name, fn) {
  try { await fn(); pass++; console.log(`PASS ${name}`); }
  catch (e) { fail++; console.log(`FAIL ${name}: ${e.message}`); }
}
const j = async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) });
const post = (p, body, tok) => fetch(B + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify(body) }).then(j);
const get = (p, tok) => fetch(B + p, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} }).then(j);
const del = (p, tok) => fetch(B + p, { method: 'DELETE', headers: tok ? { Authorization: `Bearer ${tok}` } : {} }).then(j);

await check('health', async () => {
  const r = await get('/health');
  if (!r.body.ok) throw new Error(JSON.stringify(r));
});

// signup validation
await check('signup rejects short password', async () => {
  const r = await post('/auth/signup', { firstname: 'A', lastname: 'B', phoneNumber: '12345678', email: 'a@b.com', password: 'short', confirmPassword: 'short' });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});
await check('signup rejects bad phone', async () => {
  const r = await post('/auth/signup', { firstname: 'A', lastname: 'B', phoneNumber: '123', email: 'a@b.com', password: 'password123', confirmPassword: 'password123' });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});
await check('signup ok', async () => {
  const r = await post('/auth/signup', { firstname: 'Ali', lastname: 'Omar', phoneNumber: '12345678', email: 'ali@test.com', password: 'password123', confirmPassword: 'password123' });
  if (r.status !== 201) throw new Error(JSON.stringify(r));
});
await check('signup duplicate email blocked', async () => {
  const r = await post('/auth/signup', { firstname: 'X', lastname: 'Y', phoneNumber: '87654321', email: 'ali@test.com', password: 'password123', confirmPassword: 'password123' });
  if (r.status !== 409) throw new Error(`status ${r.status}`);
});

// login + lockout
let token;
await check('login wrong pass -> 401', async () => {
  const r = await post('/auth/login', { email: 'ali@test.com', password: 'wrongpass' });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
});
await check('5 failed tries locks account', async () => {
  for (let i = 0; i < 4; i++) await post('/auth/login', { email: 'ali@test.com', password: 'wrongpass' });
  const r = await post('/auth/login', { email: 'ali@test.com', password: 'password123' });
  if (r.status !== 423) throw new Error(`expected 423 got ${r.status}: ${JSON.stringify(r.body)}`);
});
// unlock via reset-password path (skip email step by setting code directly through mongoose)
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGO_URI);
const users = mongoose.connection.collection('users');
await users.updateOne({ email: 'ali@test.com' }, { $set: { resetCode: '123456' } });
await check('reset-password clears lock', async () => {
  const r = await post('/auth/reset-password', { email: 'ali@test.com', code: '123456', newPassword: 'password123', confirmPassword: 'password123' });
  if (r.status !== 200) throw new Error(JSON.stringify(r));
});
await check('login ok after reset', async () => {
  const r = await post('/auth/login', { email: 'ali@test.com', password: 'password123' });
  if (r.status !== 200 || !r.body.token) throw new Error(JSON.stringify(r));
  token = r.body.token;
});

// legacy sha256 upgrade
import crypto from 'crypto';
await users.updateOne({ email: 'ali@test.com' }, { $set: { password: crypto.createHash('sha256').update('legacy-pass1').digest('hex'), passwordAlgo: 'sha256' } });
await check('legacy sha256 login works + upgrades to bcrypt', async () => {
  const r = await post('/auth/login', { email: 'ali@test.com', password: 'legacy-pass1' });
  if (r.status !== 200) throw new Error(JSON.stringify(r));
  token = r.body.token;
  const u = await users.findOne({ email: 'ali@test.com' });
  if (u.passwordAlgo !== 'bcrypt') throw new Error('not upgraded');
});

// property create (multipart with a photo)
let propId;
await check('create property (multipart, photo1)', async () => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({
    governorate: 'beirout', city: 'Hamra', locationDetails: 'Main Street', type: 'apartment',
    area: '120', price: '1500', status: 'rent', furnished: 'yes',
    bedrooms: '2', bathrooms: '1', livingrooms: '1', 'more-details': 'a balcony'
  })) fd.append(k, v);
  fd.append('photo1', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0, 1, 2])], { type: 'image/jpeg' }), 'test.jpg');
  const r = await fetch(B + '/properties', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }).then(j);
  if (r.status !== 201) throw new Error(JSON.stringify(r));
  propId = r.body.property.id;
  const p = r.body.property;
  if (p.title !== '120 (m²) apartment') throw new Error(`title: ${p.title}`);
  if (!p.description.includes('for rent at 1500 USD per month')) throw new Error(`desc: ${p.description}`);
  if (p.images.length !== 1) throw new Error('image not saved');
});

// filters
await check('filter by lease_type + price range', async () => {
  const r = await get('/properties?lease_type=rent&min_price=1000&max_price=2000', token);
  if (r.body.properties.length !== 1) throw new Error(JSON.stringify(r.body));
  const r2 = await get('/properties?lease_type=sell', token);
  if (r2.body.properties.length !== 0) throw new Error('sell filter leaked');
});
await check('filter by type (capitalized like home.php)', async () => {
  const r = await get('/properties?type=Apartment', token);
  if (r.body.properties.length !== 1) throw new Error(JSON.stringify(r.body));
});

// favorites: owner cannot be blocked server-side per legacy (UI-only), but toggle works
let user2Token;
await check('second user + favorite toggle', async () => {
  await post('/auth/signup', { firstname: 'Sara', lastname: 'K', phoneNumber: '11223344', email: 'sara@test.com', password: 'password123', confirmPassword: 'password123' });
  const r = await post('/auth/login', { email: 'sara@test.com', password: 'password123' });
  user2Token = r.body.token;
  const t1 = await post(`/favorites/${propId}/toggle`, {}, user2Token);
  if (t1.body.isFavorite !== true) throw new Error('toggle on failed');
  const list = await get('/favorites', user2Token);
  if (list.body.properties.length !== 1) throw new Error('favorites list wrong');
  const t2 = await post(`/favorites/${propId}/toggle`, {}, user2Token);
  if (t2.body.isFavorite !== false) throw new Error('toggle off failed');
});

// reports
await check('report + duplicate blocked + own property blocked', async () => {
  const r1 = await post('/reports', { propertyId: propId, reason: 'Fake listing' }, user2Token);
  if (r1.status !== 201) throw new Error(JSON.stringify(r1));
  const r2 = await post('/reports', { propertyId: propId, reason: 'again' }, user2Token);
  if (r2.status !== 409) throw new Error(`dup: ${r2.status}`);
  const r3 = await post('/reports', { propertyId: propId, reason: 'self' }, token);
  if (r3.status !== 400) throw new Error(`own: ${r3.status}`);
});

// admin
let adminToken;
await check('admin endpoints guarded + ban deletes properties', async () => {
  const denied = await get('/admin/users', user2Token);
  if (denied.status !== 403) throw new Error(`guard: ${denied.status}`);

  await users.updateOne({ email: 'sara@test.com' }, { $set: { role: 1 } });
  const r = await post('/auth/login', { email: 'sara@test.com', password: 'password123' });
  adminToken = r.body.token;

  const list = await get('/admin/users', adminToken);
  if (list.body.users.length !== 2) throw new Error('users list wrong');

  const aliId = list.body.users.find((u) => u.email === 'ali@test.com').id;
  const ban = await post(`/admin/users/${aliId}/ban`, {}, adminToken);
  if (ban.status !== 200) throw new Error(JSON.stringify(ban));

  const props = await get('/admin/properties', adminToken);
  if (props.body.properties.length !== 0) throw new Error('ban did not delete properties');

  const banned = await get('/admin/users/banned', adminToken);
  if (banned.body.users.length !== 1) throw new Error('banned list wrong');

  const bannedLogin = await post('/auth/login', { email: 'ali@test.com', password: 'legacy-pass1' });
  if (bannedLogin.status !== 403) throw new Error(`banned login: ${bannedLogin.status}`);

  const unban = await post(`/admin/users/${aliId}/unban`, {}, adminToken);
  if (unban.status !== 200) throw new Error(JSON.stringify(unban));
});

// reports list also empty now (cascade with property deletion)
await check('reports cascade-deleted with property', async () => {
  const r = await get('/reports', adminToken);
  if (r.body.reports.length !== 0) throw new Error(JSON.stringify(r.body));
});

// change password
await check('change-password requires correct old password', async () => {
  const bad = await post('/auth/change-password', { oldPassword: 'nope', newPassword: 'newpassword1', confirmPassword: 'newpassword1' }, adminToken);
  if (bad.status !== 400) throw new Error(`bad old: ${bad.status}`);
  const ok = await post('/auth/change-password', { oldPassword: 'password123', newPassword: 'newpassword1', confirmPassword: 'newpassword1' }, adminToken);
  if (ok.status !== 200) throw new Error(JSON.stringify(ok));
});

console.log(`\n${pass} passed, ${fail} failed`);
server.kill();
await mongoose.disconnect();
await mongod.stop();
process.exit(fail ? 1 : 0);
