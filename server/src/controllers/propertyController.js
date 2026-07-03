import fs from 'fs';
import path from 'path';
import Property from '../models/Property.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { buildPropertyText } from '../utils/propertyText.js';
import { UPLOAD_ROOT } from '../middleware/upload.js';

function toCard(p) {
  return {
    id: p._id,
    title: p.title,
    description: p.description,
    type: p.type,
    location: p.location,
    status: p.status,
    price: p.details.price,
    area: p.details.area,
    images: p.images.map((img) => ({ id: img._id, path: img.path })),
    details: p.details,
    owner: p.owner
  };
}

function deleteImageFiles(property) {
  for (const img of property.images) {
    const abs = path.join(UPLOAD_ROOT, path.basename(img.path));
    fs.promises.unlink(abs).catch(() => {});
  }
}

export async function deletePropertiesOfOwner(ownerId) {
  const properties = await Property.find({ owner: ownerId });
  for (const p of properties) {
    deleteImageFiles(p);
    await Report.deleteMany({ property: p._id });
    await User.updateMany({}, { $pull: { favorites: p._id } });
  }
  await Property.deleteMany({ owner: ownerId });
}

// GET /api/properties  (home.php — filters + sorting)
export async function listProperties(req, res, next) {
  try {
    const { type, governorate, city, min_price, max_price, lease_type, furnished, sort_by, sort_order } = req.query;

    const filter = {};
    if (type) filter.type = new RegExp(`^${type}$`, 'i'); // home.php uses capitalized values, listPage stores lowercase
    if (governorate) filter['details.governorate'] = governorate;
    if (city) {
      // LIKE '%city%', tolerant of legacy formatting: the old listPage.php
      // stored cities lowercase-hyphenated ("ain-el-mreisseh") while newer
      // rows store natural casing ("Ain El Mreisseh"). Treat spaces and
      // hyphens as interchangeable, case-insensitive.
      const pattern = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[\s-]+/g, '[\\s-]+');
      filter['details.city'] = new RegExp(pattern, 'i');
    }
    if (min_price) filter['details.price'] = { ...(filter['details.price'] || {}), $gte: Number(min_price) };
    if (max_price) filter['details.price'] = { ...(filter['details.price'] || {}), $lte: Number(max_price) };
    if (lease_type) filter.status = lease_type;
    if (furnished === '0' || furnished === '1') filter['details.furnished'] = Number(furnished);

    const order = sort_order === 'desc' ? -1 : 1;
    let sort = {};
    if (sort_by === 'price') sort = { 'details.price': order };
    else if (sort_by === 'area') sort = { 'details.area': order };
    else if (sort_by === 'date') sort = { createdAt: order }; // PHP sorted by id ≈ posting order

    const properties = await Property.find(filter).sort(sort);
    res.json({ properties: properties.map(toCard) });
  } catch (err) { next(err); }
}

// GET /api/properties/mine  (my-propreties.php)
export async function myProperties(req, res, next) {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json({ properties: properties.map(toCard) });
  } catch (err) { next(err); }
}

// GET /api/properties/:id  (property_details.php)
export async function getProperty(req, res, next) {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'firstname lastname verify');
    if (!property) return res.status(404).json({ message: 'Property not found!' });

    const isFavorite = req.user.favorites.some((f) => String(f) === String(property._id));
    res.json({ property: toCard(property), isFavorite });
  } catch (err) { next(err); }
}

function collectPhotos(req) {
  const photos = [];
  for (let i = 1; i <= 6; i++) {
    const f = req.files?.[`photo${i}`]?.[0];
    photos.push(f ? `uploads/${f.filename}` : null);
  }
  return photos;
}

function parseBody(body) {
  return {
    governorate: body.governorate,
    city: body.city,
    exactLocation: body.locationDetails,
    type: body.type,
    area: Number(body.area),
    status: body.status,
    price: Number(body.price),
    bedrooms: Number(body.bedrooms),
    bathrooms: Number(body.bathrooms),
    livingrooms: Number(body.livingrooms),
    furnished: body.furnished === 'yes' || body.furnished === '1' ? 1 : 0,
    moreDetails: body['more-details'] || body.moreDetails || ''
  };
}

// POST /api/properties  (listPage.php)
export async function createProperty(req, res, next) {
  try {
    const d = parseBody(req.body);
    const required = ['governorate', 'city', 'exactLocation', 'type', 'status'];
    if (required.some((k) => !d[k]) || !d.area || !d.price || !d.bedrooms || !d.bathrooms || !d.livingrooms) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const { title, location, description } = buildPropertyText(d);
    const images = collectPhotos(req).filter(Boolean).map((p) => ({ path: p }));

    const property = await Property.create({
      owner: req.user._id,
      title, description, location,
      type: d.type,
      status: d.status,
      details: {
        nbBedrooms: d.bedrooms, nbBathrooms: d.bathrooms, nbLivingrooms: d.livingrooms,
        furnished: d.furnished, moreDetails: d.moreDetails,
        governorate: d.governorate, city: d.city, exactLocation: d.exactLocation,
        area: d.area, price: d.price
      },
      images
    });

    res.status(201).json({ message: 'Property details added successfully!', property: toCard(property) });
  } catch (err) { next(err); }
}

// PUT /api/properties/:id  (editproperty-details.php — incl. per-slot image replacement)
export async function updateProperty(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found!' });
    if (String(property.owner) !== String(req.user._id) && req.user.role !== 1) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    const d = parseBody(req.body);
    const { title, location, description } = buildPropertyText(d);

    property.set({
      title, description, location,
      type: d.type, status: d.status,
      details: {
        nbBedrooms: d.bedrooms, nbBathrooms: d.bathrooms, nbLivingrooms: d.livingrooms,
        furnished: d.furnished, moreDetails: d.moreDetails,
        governorate: d.governorate, city: d.city, exactLocation: d.exactLocation,
        area: d.area, price: d.price
      }
    });

    // Image slots: existing_image[i] holds the image id currently in slot i (or '').
    // A new photo{i} replaces that image (old file deleted), otherwise it's appended.
    let existing = req.body.existing_image ?? [];
    if (!Array.isArray(existing)) existing = Object.values(existing);
    for (let i = 1; i <= 6; i++) {
      const file = req.files?.[`photo${i}`]?.[0];
      if (!file) continue;
      const newPath = `uploads/${file.filename}`;
      const existingId = existing[i - 1];
      const img = existingId ? property.images.id(existingId) : null;
      if (img) {
        fs.promises.unlink(path.join(UPLOAD_ROOT, path.basename(img.path))).catch(() => {});
        img.path = newPath;
      } else {
        property.images.push({ path: newPath });
      }
    }

    await property.save();
    res.json({ message: 'Property updated successfully', property: toCard(property) });
  } catch (err) { next(err); }
}

// DELETE /api/properties/:id/images/:imageId  (clear_image.php)
export async function clearImage(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found!' });
    if (String(property.owner) !== String(req.user._id) && req.user.role !== 1) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }
    const img = property.images.id(req.params.imageId);
    if (!img) return res.status(404).json({ message: 'Image not found.' });

    fs.promises.unlink(path.join(UPLOAD_ROOT, path.basename(img.path))).catch(() => {});
    img.deleteOne();
    await property.save();
    res.json({ message: 'Image deleted successfully.', property: toCard(property) });
  } catch (err) { next(err); }
}

// DELETE /api/properties/:id  (delete_property.php — owner or admin; cascades reports/favorites/files)
export async function deleteProperty(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const isAdmin = req.user.role === 1;
    const isOwner = String(property.owner) === String(req.user._id);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Unauthorized action.' });

    deleteImageFiles(property);
    await Report.deleteMany({ property: property._id });
    await User.updateMany({}, { $pull: { favorites: property._id } });
    await property.deleteOne();

    res.json({ message: 'Property deleted successfully' });
  } catch (err) { next(err); }
}
