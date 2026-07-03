import mongoose from 'mongoose';

// Merges legacy `property` + `property_details` (1-to-1 -> embedded)
// + `property_images` (max 6 -> embedded array).
const imageSchema = new mongoose.Schema({ path: { type: String, required: true } });

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }, // house | apartment | villa | cabin
    location: { type: String, required: true },
    status: { type: String, enum: ['sell', 'rent'], required: true },
    details: {
      nbBedrooms: { type: Number, required: true, min: 1 },
      nbBathrooms: { type: Number, required: true, min: 1 },
      nbLivingrooms: { type: Number, required: true, min: 1 },
      furnished: { type: Number, enum: [0, 1], required: true },
      moreDetails: { type: String, default: '' },
      governorate: { type: String, required: true },
      city: { type: String, required: true },
      exactLocation: { type: String, required: true },
      area: { type: Number, required: true },
      price: { type: Number, required: true }
    },
    images: [imageSchema],
    legacyId: { type: Number, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Property', propertySchema);
