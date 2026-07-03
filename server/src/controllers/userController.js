import Property from '../models/Property.js';
import User from '../models/User.js';

// GET /api/users/me  (user.php — profile data)
export async function getMe(req, res) {
  const u = req.user;
  res.json({
    user: {
      id: u._id, firstname: u.firstname, lastname: u.lastname,
      email: u.email, number: u.number, profile: u.profile, verify: u.verify, role: u.role
    }
  });
}

// PUT /api/users/me  (user.php — edit profile + optional profile picture upload)
export async function updateMe(req, res, next) {
  try {
    const { firstname, lastname, email, phone } = req.body;
    if (phone && !/^\d{8}$/.test(String(phone))) {
      return res.status(400).json({ message: 'Phone number must be exactly 8 digits.' });
    }
    if (email && email.toLowerCase() !== req.user.email) {
      if (await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } })) {
        return res.status(409).json({ message: 'An account with this email already exists!' });
      }
    }
    if (phone && phone !== req.user.number) {
      if (await User.findOne({ number: String(phone), _id: { $ne: req.user._id } })) {
        return res.status(409).json({ message: 'An account with this number already exists!' });
      }
    }

    if (firstname) req.user.firstname = firstname;
    if (lastname) req.user.lastname = lastname;
    if (email) req.user.email = email.toLowerCase();
    if (phone) req.user.number = String(phone);
    if (req.file) req.user.profile = `uploads/profiles/${req.file.filename}`;

    await req.user.save();
    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: req.user._id, firstname: req.user.firstname, lastname: req.user.lastname,
        email: req.user.email, number: req.user.number, profile: req.user.profile,
        verify: req.user.verify, role: req.user.role
      }
    });
  } catch (err) { next(err); }
}

// GET /api/users/:id  (user_details.php — public profile + their properties)
export async function getUserDetails(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('firstname lastname email number verify');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const properties = await Property.find({ owner: user._id });
    res.json({
      user: {
        id: user._id, firstname: user.firstname, lastname: user.lastname,
        email: user.email, number: user.number, verify: user.verify
      },
      propertyCount: properties.length,
      properties: properties.map((p) => ({
        id: p._id, title: p.title, location: p.location,
        price: p.details.price,
        images: p.images.map((img) => ({ id: img._id, path: img.path }))
      }))
    });
  } catch (err) { next(err); }
}
