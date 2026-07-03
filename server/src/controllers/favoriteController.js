import Property from '../models/Property.js';

// POST /api/favorites/:propertyId/toggle  (property_details.php toggle_favorite)
export async function toggleFavorite(req, res, next) {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found!' });

    const idx = req.user.favorites.findIndex((f) => String(f) === String(property._id));
    let isFavorite;
    if (idx >= 0) {
      req.user.favorites.splice(idx, 1);
      isFavorite = false;
    } else {
      req.user.favorites.push(property._id);
      isFavorite = true;
    }
    await req.user.save();
    res.json({ isFavorite });
  } catch (err) { next(err); }
}

// GET /api/favorites  (favorites.php)
export async function listFavorites(req, res, next) {
  try {
    const properties = await Property.find({ _id: { $in: req.user.favorites } });
    res.json({
      properties: properties.map((p) => ({
        id: p._id, title: p.title, location: p.location,
        price: p.details.price,
        images: p.images.map((img) => ({ id: img._id, path: img.path }))
      }))
    });
  } catch (err) { next(err); }
}
