/**
 * Seed a fresh database with an admin account (use when NOT migrating from MySQL).
 * Usage: npm run seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

const email = process.env.SEED_ADMIN_EMAIL || 'admin@propertyfinder.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin12345';

await connectDB();
const existing = await User.findOne({ email });
if (existing) {
  console.log(`Admin ${email} already exists.`);
} else {
  await User.create({
    firstname: 'Admin',
    lastname: 'User',
    number: '00000000',
    email,
    password: await bcrypt.hash(password, 10),
    passwordAlgo: 'bcrypt',
    role: 1
  });
  console.log(`Created admin ${email} / ${password} — change this password!`);
}
await mongoose.disconnect();
