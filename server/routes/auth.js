import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
  updateUser,
} from '../db/store.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD'];

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, currency, monthlyIncomeGoal } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        error: 'Please enter your full name (at least 2 characters).',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        error: 'An account with this email already exists.',
      });
      return;
    }

    const chosenCurrency =
      currency && VALID_CURRENCIES.includes(currency) ? currency : 'USD';
    const parsedGoal =
      typeof monthlyIncomeGoal === 'number' && monthlyIncomeGoal >= 0
        ? monthlyIncomeGoal
        : 5000;

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      currency: chosenCurrency,
      monthlyIncomeGoal: parsedGoal,
    });

    const token = signToken(created._id);
    res.status(201).json({
      token,
      user: toPublicUser(created),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Unable to create account right now.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended' && user.role !== 'admin') {
      res.status(403).json({
        error: 'This account has been suspended by the administrator.',
      });
      return;
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Unable to sign in right now.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const { name, currency, monthlyIncomeGoal, currentPassword, newPassword } =
      req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ error: 'Name must be at least 2 characters.' });
        return;
      }
      updates.name = name.trim();
    }

    if (currency !== undefined) {
      if (typeof currency !== 'string' || !VALID_CURRENCIES.includes(currency)) {
        res.status(400).json({ error: 'Unsupported currency code.' });
        return;
      }
      updates.currency = currency;
    }

    if (monthlyIncomeGoal !== undefined) {
      if (
        !Number.isFinite(Number(monthlyIncomeGoal)) ||
        Number(monthlyIncomeGoal) < 0
      ) {
        res.status(400).json({
          error: 'Monthly income goal must be zero or positive.',
        });
        return;
      }
      updates.monthlyIncomeGoal = Number(monthlyIncomeGoal);
    }

    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({
          error: 'New password must be at least 6 characters.',
        });
        return;
      }
      if (typeof currentPassword !== 'string' || !currentPassword) {
        res.status(400).json({
          error: 'Enter your current password to set a new password.',
        });
        return;
      }
      const matches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!matches) {
        res.status(401).json({ error: 'Current password is incorrect.' });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await updateUser(user._id, updates);
    if (!updated) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

router.post('/logout', requireAuth, (_req, res) => {
  res.json({ success: true, message: 'Signed out successfully.' });
});

export default router;
