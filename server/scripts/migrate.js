/**
 * One-shot migration: legacy MySQL `project` DB -> MongoDB.
 *
 * Reads: account, property, property_details, property_images,
 *        verification_requests, report, favorites
 * Writes: users, properties (details+images embedded), reports,
 *         verificationrequests (favorites embedded in users)
 *
 * Also copies the legacy uploads/ folder into server/uploads/.
 *
 * Usage: configure MYSQL_* and LEGACY_ROOT in .env, then `npm run migrate`.
 * Legacy sha256 password hashes are preserved (passwordAlgo: 'sha256');
 * they are upgraded to bcrypt automatically on each user's next login.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Property from '../src/models/Property.js';
import Report from '../src/models/Report.js';
import VerificationRequest from '../src/models/VerificationRequest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');
const LEGACY_ROOT = path.resolve(SERVER_ROOT, process.env.LEGACY_ROOT || '../..');

function copyLegacyUploads() {
  const src = path.join(LEGACY_ROOT, 'uploads');
  const dest = path.join(SERVER_ROOT, 'uploads');
  if (!fs.existsSync(src)) {
    console.warn(`WARNING: no legacy uploads folder found at ${src} — property images will be missing.`);
    console.warn('Set LEGACY_ROOT in .env to the folder that contains the old PHP app');
    console.warn('(the folder with uploads/ and pictures/), e.g. LEGACY_ROOT=C:/Users/admin/Desktop/I3302');
    return;
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Copied legacy uploads from ${src} -> ${dest}`);
}

// Legacy paths look like "uploads/123_x.jpg" or "uploads/id_docs/x.png"
// (some profile pics were "pictures/profile_1.png" — those are copied too if present)
function normalizePath(p) {
  if (!p) return null;
  return p.replace(/\\/g, '/').replace(/^\.?\//, '');
}

async function main() {
  const sql = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'project'
  });
  await connectDB();

  copyLegacyUploads();

  // Also copy legacy profile pictures (pictures/profile_*.{jpg,png,...}) if present
  const legacyPics = path.join(LEGACY_ROOT, 'pictures');
  const profileDest = path.join(SERVER_ROOT, 'uploads', 'profiles');
  fs.mkdirSync(profileDest, { recursive: true });
  if (fs.existsSync(legacyPics)) {
    for (const f of fs.readdirSync(legacyPics)) {
      if (/^profile_/.test(f)) fs.copyFileSync(path.join(legacyPics, f), path.join(profileDest, f));
    }
  }

  console.log('Clearing target collections...');
  await Promise.all([User.deleteMany({}), Property.deleteMany({}), Report.deleteMany({}), VerificationRequest.deleteMany({})]);

  // Rebuild indexes to match the current schema (drops stale unique indexes
  // left over from earlier schema versions, e.g. unique `number`).
  for (const M of [User, Property, Report, VerificationRequest]) {
    await M.collection.dropIndexes().catch(() => {});
    await M.syncIndexes();
  }

  const skippedRows = []; // { table, id, reason }
  const flag01 = (v) => (Number(v) ? 1 : 0);

  // ---- users ----
  // Every row is migrated independently: one bad legacy row must never
  // abort the run (empty names, duplicate emails, odd flag values, ...).
  const [accounts] = await sql.query('SELECT * FROM account');
  const userMap = new Map(); // legacy userId -> Mongo _id
  for (const a of accounts) {
    try {
      if (!a.email || !String(a.email).trim()) throw new Error('empty email');
      if (!a.password) throw new Error('empty password');
      const profile = a.profile ? `uploads/profiles/${path.basename(a.profile)}` : null;
      const u = await User.create({
        firstname: (a.firstname ?? '').toString().trim(),
        lastname: (a.lastname ?? '').toString().trim(),
        number: (a.number ?? '').toString().trim(),
        email: String(a.email).trim(),
        password: a.password, // sha256 hex from PHP
        passwordAlgo: 'sha256',
        role: flag01(a.role),
        status: flag01(a.status),
        locked: flag01(a.locked),
        tries: Number(a.tries) || 0,
        resetCode: a.reset_code ? String(a.reset_code) : null,
        profile,
        verify: flag01(a.verify),
        legacyId: a.userId
      });
      userMap.set(a.userId, u._id);
    } catch (err) {
      skippedRows.push({ table: 'account', id: a.userId, reason: err.message });
    }
  }
  console.log(`Migrated ${userMap.size}/${accounts.length} accounts`);

  // ---- properties (+details +images) ----
  const [props] = await sql.query('SELECT * FROM property');
  const [details] = await sql.query('SELECT * FROM property_details');
  const [images] = await sql.query('SELECT * FROM property_images');
  const detailsByProp = new Map(details.map((d) => [d.property_id, d]));
  const imagesByProp = new Map();
  for (const img of images) {
    if (!imagesByProp.has(img.property_id)) imagesByProp.set(img.property_id, []);
    imagesByProp.get(img.property_id).push(img);
  }

  const propMap = new Map(); // legacy property id -> Mongo _id
  for (const p of props) {
    try {
      const d = detailsByProp.get(p.id);
      const owner = userMap.get(p.owner_id);
      if (!d) throw new Error('missing property_details row');
      if (!owner) throw new Error(`owner ${p.owner_id} was not migrated`);
      const status = ['sell', 'rent'].includes(p.status) ? p.status : 'sell';
      const doc = await Property.create({
        owner,
        title: p.title || 'Untitled property',
        description: p.description || '-',
        type: p.type || 'house',
        location: p.location || '-',
        status,
        details: {
          nbBedrooms: Number(d.nbBedrooms) || 1,
          nbBathrooms: Number(d.nbBathrooms) || 1,
          nbLivingrooms: Number(d.nbLivingrooms) || 1,
          furnished: flag01(d.furnished),
          moreDetails: d.moreDetails || '',
          governorate: d.governorate || '-',
          city: d.city || '-',
          exactLocation: d.exact_location || '-',
          area: Number(d.area) || 0,
          price: Number(d.price) || 0
        },
        images: (imagesByProp.get(p.id) || [])
          .map((img) => normalizePath(img.image_path))
          .filter(Boolean)
          .map((imgPath) => ({ path: imgPath })),
        legacyId: p.id
      });
      propMap.set(p.id, doc._id);
    } catch (err) {
      skippedRows.push({ table: 'property', id: p.id, reason: err.message });
    }
  }
  console.log(`Migrated ${propMap.size}/${props.length} properties`);

  // ---- favorites (embedded in users) ----
  const [favs] = await sql.query('SELECT * FROM favorites');
  let favCount = 0;
  for (const f of favs) {
    try {
      const uid = userMap.get(f.userId);
      const pid = propMap.get(f.property_id);
      if (!uid || !pid) throw new Error('user or property not migrated');
      await User.findByIdAndUpdate(uid, { $addToSet: { favorites: pid } });
      favCount++;
    } catch (err) {
      skippedRows.push({ table: 'favorites', id: `${f.userId}/${f.property_id}`, reason: err.message });
    }
  }
  console.log(`Migrated ${favCount}/${favs.length} favorites`);

  // ---- reports ----
  // NOTE: the PHP report form stored property_details.id in report.property_id
  // (while reports.php joined it against property.id). Resolve via the
  // property_details mapping first, then fall back to a direct property id.
  const detailsIdToPropertyId = new Map(details.map((d) => [d.id, d.property_id]));
  const [reports] = await sql.query('SELECT * FROM report');
  let repCount = 0;
  for (const r of reports) {
    try {
      const legacyPropId = detailsIdToPropertyId.get(r.property_id) ?? r.property_id;
      const pid = propMap.get(legacyPropId);
      const uid = userMap.get(r.user_id);
      if (!pid || !uid) throw new Error('user or property not migrated');
      await Report.create({ property: pid, user: uid, reason: r.reason || '-', dateReported: r.date_reported || new Date() });
      repCount++;
    } catch (err) {
      skippedRows.push({ table: 'report', id: r.id, reason: err.code === 11000 ? 'duplicate (user, property)' : err.message });
    }
  }
  console.log(`Migrated ${repCount}/${reports.length} reports`);

  // ---- verification requests ----
  const [verifs] = await sql.query('SELECT * FROM verification_requests');
  let verCount = 0;
  for (const v of verifs) {
    try {
      const uid = userMap.get(v.userId);
      if (!uid) throw new Error(`user ${v.userId} not migrated`);
      const status = [0, 1, 2].includes(Number(v.status)) ? Number(v.status) : 0;
      await VerificationRequest.create({
        user: uid,
        idDocumentPath: normalizePath(v.id_document_path) || 'uploads/id_docs/missing',
        status
      });
      verCount++;
    } catch (err) {
      skippedRows.push({ table: 'verification_requests', id: v.id, reason: err.message });
    }
  }
  console.log(`Migrated ${verCount}/${verifs.length} verification requests`);

  await sql.end();
  await mongoose.disconnect();

  if (skippedRows.length) {
    console.log(`\n${skippedRows.length} row(s) could not be migrated:`);
    for (const s of skippedRows) console.log(`  - ${s.table} #${s.id}: ${s.reason}`);
  } else {
    console.log('\nAll rows migrated successfully.');
  }
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
