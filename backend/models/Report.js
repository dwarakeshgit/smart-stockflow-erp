const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportName: { type: String, required: true },
  category: { type: String, enum: ['Sales', 'Purchase', 'Inventory', 'Production'], required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
