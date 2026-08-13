/**
 * Export every MongoDB collection to server/demo-data/*.json (MongoDB Extended JSON).
 * Lets the demo data be committed to git and restored anywhere with `npm run import-data`.
 * Usage: npm run export-data
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EJSON } from 'bson';
import connectDB from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../demo-data');
fs.mkdirSync(OUT_DIR, { recursive: true });

await connectDB();

const collections = await mongoose.connection.db.collections();
let total = 0;
for (const col of collections) {
  const name = col.collectionName;
  if (name.startsWith('system.')) continue;
  const docs = await col.find({}).toArray();
  fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), EJSON.stringify(docs, null, 2));
  console.log(`Exported ${docs.length} docs -> demo-data/${name}.json`);
  total += docs.length;
}

console.log(`\nDone. ${total} documents exported to server/demo-data/.`);
await mongoose.disconnect();
