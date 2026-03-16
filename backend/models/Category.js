const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true, trim: true },
  type:   { type: String, required: true, enum: ['income', 'expense', 'both'] },
  icon:   { type: String, default: '📦' },
  color:  { type: String, default: '#6366f1' },
  budget: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
