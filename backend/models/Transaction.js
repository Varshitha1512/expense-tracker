const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true, trim: true },
  amount:        { type: Number, required: true, min: 0.01 },
  type:          { type: String, required: true, enum: ['income', 'expense'] },
  category:      { type: String, required: true },
  date:          { type: Date, default: Date.now },
  description:   { type: String, trim: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'upi', 'other'], default: 'other' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
