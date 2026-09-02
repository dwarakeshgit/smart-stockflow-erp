const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, default: 'General' },
  currentStock: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true, default: 0 },
  stockValue: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
  supplier: { type: String, default: 'N/A' },
  // Multiple Prices feature (Smart Inventory Features)
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate stockValue before saving
productSchema.pre('save', function (next) {
  this.stockValue = this.currentStock * this.unitPrice;
  next();
});

module.exports = mongoose.model('Product', productSchema);
