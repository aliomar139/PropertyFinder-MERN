import mongoose from 'mongoose';

// Mirrors the legacy `account` table.
// Numeric flags kept for behavioral parity with the PHP app:
//   role:   0 = user, 1 = admin
//   status: 0 = active, 1 = banned
//   locked: 0 = unlocked, 1 = locked (after 5 failed logins)
//   verify: 0 = not verified, 1 = verified
const userSchema = new mongoose.Schema(
  {
    // Names not strictly required: legacy MySQL rows may have empty values.
    firstname: { type: String, required: false, trim: true, default: '' },
    lastname: { type: String, required: false, trim: true, default: '' },
    // Uniqueness of the phone number is enforced at signup/profile-update time
    // (like the PHP app did) — NOT as a DB constraint, so legacy rows with
    // duplicate or empty numbers can still be migrated.
    number: { type: String, required: false, index: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash (or legacy sha256 hex, upgraded on login)
    passwordAlgo: { type: String, enum: ['bcrypt', 'sha256'], default: 'bcrypt' },
    role: { type: Number, enum: [0, 1], default: 0 },
    status: { type: Number, enum: [0, 1], default: 0 },
    locked: { type: Number, enum: [0, 1], default: 0 },
    tries: { type: Number, default: 0 },
    resetCode: { type: String, default: null },
    profile: { type: String, default: null }, // profile picture filename
    verify: { type: Number, enum: [0, 1], default: 0 },
    // legacy `favorites` join table, embedded
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    legacyId: { type: Number, index: true } // userId from MySQL, set by the migration script
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
