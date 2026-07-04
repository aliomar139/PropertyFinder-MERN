/**
 * Import demo data from server/demo-data/*.json into MongoDB.
 * By default it SKIPS any collection that already has documents, so it won't
 * clobber your own data. Pass --force to wipe those collections and reload.
 * Usage: npm run import-data          (safe: only fills empty collections)
 *        node scripts/import-data.js --force   (overwrite existing data)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EJSON } from 'bson';
import connectDB from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../demo-data');
const force = process.argv.includes('--force');

if (!fs.existsSync(DATA_DIR)) {
  console.error(`No demo-data folder found at ${DATA_DIR}. Nothing to import.`);
  process.exit(1);
}

await connectDB();

const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
for (const file of files) {
  const name = path.basename(file, '.json');
  const col = mongoose.connection.db.collection(name);
  const existing = await col.countDocuments();
  if (existing > 0 && !force) {
    console.log(`Skipped ${name}: already has ${existing} docs (use --force to overwrite).`);
    continue;
  }
  if (force && existing > 0) await col.deleteMany({});
  const docs = EJSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  if (docs.length) await col.insertMany(docs);
  console.log(`Imported ${docs.length} docs into ${name}.`);
}

console.log('\nDone.');
await mongoose.disconnect();
