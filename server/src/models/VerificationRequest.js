import mongoose from 'mongoose';

// Legacy `verification_requests` table.
// status: 0 = pending, 1 = approved, 2 = rejected (parity with PHP)
const verificationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    idDocumentPath: { type: String, required: true },
    status: { type: Number, enum: [0, 1, 2], default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('VerificationRequest', verificationRequestSchema);
