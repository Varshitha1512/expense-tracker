const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const defaultCategories = [
  { name: 'Food & Dining',  type: 'expense', icon: '🍔', color: '#f59e0b' },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6' },
  { name: 'Shopping',       type: 'expense', icon: '🛍️', color: '#ec4899' },
  { name: 'Entertainment',  type: 'expense', icon: '🎬', color: '#8b5cf6' },
  { name: 'Health',         type: 'expense', icon: '💊', color: '#ef4444' },
  { name: 'Utilities',      type: 'expense', icon: '💡', color: '#f97316' },
  { name: 'Housing',        type: 'expense', icon: '🏠', color: '#14b8a6' },
  { name: 'Salary',         type: 'income',  icon: '💼', color: '#22c55e' },
  { name: 'Freelance',      type: 'income',  icon: '💻', color: '#10b981' },
  { name: 'Investment',     type: 'income',  icon: '📈', color: '#06b6d4' },
  { name: 'Other',          type: 'both',    icon: '📦', color: '#94a3b8' },
];

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password });
    await Category.insertMany(defaultCategories.map(c => ({ ...c, user: user._id })));
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, currency: user.currency } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, currency: user.currency, monthlyBudget: user.monthlyBudget } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  const { _id, name, email, currency, monthlyBudget } = req.user;
  res.json({ user: { id: _id, name, email, currency, monthlyBudget } });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, currency, monthlyBudget } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, currency, monthlyBudget }, { new: true });
    res.json({ user: { id: user._id, name: user.name, email: user.email, currency: user.currency, monthlyBudget: user.monthlyBudget } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
