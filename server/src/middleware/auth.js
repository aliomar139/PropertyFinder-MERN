import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Replaces PHP $_SESSION['userId'] / $_SESSION['role'] checks.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    if (user.status === 1) return res.status(403).json({ message: 'Your account is banned. Please contact support for more information.' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Replaces the PHP `if ($_SESSION['role'] != 1) redirect` guard on admin pages.
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 1) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
