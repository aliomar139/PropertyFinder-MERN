import User from '../models/User.js';
import Property from '../models/Property.js';
import { deletePropertiesOfOwner } from './propertyController.js';

async function usersWithCounts(filter = {}) {
  const users = await User.find(filter).sort({ createdAt: 1 }).select('firstname lastname email role status');
  const counts = await Property.aggregate([{ $group: { _id: '$owner', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return users.map((u) => ({
    id: u._id,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    role: u.role,
    status: u.status,
    propertyCount: countMap.get(String(u._id)) || 0
  }));
}

// GET /api/admin/users  (user_management.php)
export async function listUsers(req, res, next) {
  try { res.json({ users: await usersWithCounts() }); } catch (err) { next(err); }
}

// GET /api/admin/users/banned  (banned_owners.php)
export async function listBanned(req, res, next) {
  try { res.json({ users: await usersWithCounts({ status: 1 }) }); } catch (err) { next(err); }
}

// POST /api/admin/users/:id/ban  (ban_user.php — sets status=1 AND deletes their properties)
export async function banUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 1) return res.status(400).json({ message: 'Cannot ban an admin.' });

    user.status = 1;
    await user.save();
    await deletePropertiesOfOwner(user._id);
    res.json({ message: 'Ban successful.' });
  } catch (err) { next(err); }
}

// POST /api/admin/users/:id/unban  (unban_user.php)
export async function unbanUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.status = 0;
    await user.save();
    res.json({ message: 'User successfully unbanned!' });
  } catch (err) { next(err); }
}

// GET /api/admin/properties  (property_management.php)
export async function listAllProperties(req, res, next) {
  try {
    const properties = await Property.find().sort({ createdAt: 1 }).populate('owner', 'firstname lastname');
    res.json({
      properties: properties.map((p) => ({
        id: p._id,
        title: p.title,
        owner: p.owner
          ? { id: p.owner._id, firstname: p.owner.firstname, lastname: p.owner.lastname }
          : null
      }))
    });
  } catch (err) { next(err); }
}
