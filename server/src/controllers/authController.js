import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendResetCode } from '../utils/mailer.js';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    number: user.number,
    role: user.role,
    verify: user.verify,
    profile: user.profile
  };
}

// Verify against bcrypt or legacy sha256 (migrated accounts); upgrade legacy to bcrypt.
async function checkPassword(user, plain) {
  if (user.passwordAlgo === 'sha256') {
    if (sha256(plain) !== user.password) return false;
    user.password = await bcrypt.hash(plain, 10);
    user.passwordAlgo = 'bcrypt';
    return true;
  }
  return bcrypt.compare(plain, user.password);
}

// POST /api/auth/signup  (signUp.php)
export async function signup(req, res, next) {
  try {
    const { firstname, lastname, phoneNumber, email, password, confirmPassword } = req.body;
    if (!firstname || !lastname || !phoneNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password should be at least 8 characters.' });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match. Please try again!" });
    if (!/^\d{8}$/.test(String(phoneNumber))) return res.status(400).json({ message: 'Phone number should be exactly 8 digits.' });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists!' });
    }
    if (await User.findOne({ number: String(phoneNumber) })) {
      return res.status(409).json({ message: 'An account with this number already exists!' });
    }

    await User.create({
      firstname, lastname,
      number: String(phoneNumber),
      email,
      password: await bcrypt.hash(password, 10),
      passwordAlgo: 'bcrypt'
    });

    res.status(201).json({ message: 'Your account has been created. Please log in to continue.' });
  } catch (err) { next(err); }
}

// POST /api/auth/login  (login.php — incl. tries counter, lock at 5, ban check)
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "An Account With This Email Doesn't Exist!" });

    if (user.status === 1) {
      return res.status(403).json({ message: 'Your account is banned. Please contact support for more information.' });
    }
    if (user.locked === 1) {
      return res.status(423).json({ message: 'Account locked. Reset your password and try again!' });
    }

    if (await checkPassword(user, password)) {
      user.tries = 0;
      user.locked = 0;
      await user.save();
      return res.json({ token: signToken(user), user: publicUser(user) });
    }

    user.tries += 1;
    let message = 'Invalid Login Details!';
    if (user.tries >= 5) {
      user.locked = 1;
      message = 'Account locked due to too many failed attempts.';
    }
    await user.save();
    res.status(401).json({ message });
  } catch (err) { next(err); }
}

// POST /api/auth/reset-code  (reset.php — email a 6-digit code)
export async function requestResetCode(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: "An Account With This Email Doesn't Exist!" });

    const code = String(crypto.randomInt(100000, 1000000));
    user.resetCode = code;
    await user.save();

    await sendResetCode(user.email, user.firstname, code);
    res.json({ message: 'The Security Code Was Sent Successfully!' });
  } catch (err) { next(err); }
}

// POST /api/auth/verify-reset-code  (change-pass.php step 1)
export async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.resetCode || String(code) !== String(user.resetCode)) {
      return res.status(400).json({ message: 'The code you entered is incorrect.' });
    }
    res.json({ message: 'Code validated.' });
  } catch (err) { next(err); }
}

// POST /api/auth/reset-password  (change-pass.php step 2 — also clears tries/lock)
export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.resetCode || String(code) !== String(user.resetCode)) {
      return res.status(400).json({ message: 'The code you entered is incorrect.' });
    }
    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordAlgo = 'bcrypt';
    user.resetCode = null;
    user.tries = 0;
    user.locked = 0;
    await user.save();

    res.json({ message: 'Your password was changed successfully!' });
  } catch (err) { next(err); }
}

// POST /api/auth/change-password  (userchange-pass.php — logged in, requires old password)
export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    if (!(await checkPassword(user, oldPassword || ''))) {
      return res.status(400).json({ message: 'Invalid old password' });
    }
    if (await checkPassword(user, newPassword || '')) {
      return res.status(400).json({ message: 'This is your current password. Please choose a new one.' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'The password should be at least 8 characters long.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match. Please try again!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordAlgo = 'bcrypt';
    await user.save();
    res.json({ message: 'Password changed successfully!' });
  } catch (err) { next(err); }
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
