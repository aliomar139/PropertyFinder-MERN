import mongoose from 'mongoose';

// Legacy `report` table. One report per (user, property) — enforced like the PHP check.
const reportSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    dateReported: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

reportSchema.index({ property: 1, user: 1 }, { unique: true });

export default mongoose.model('Report', reportSchema);
