const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  date: { type: Date, default: Date.now },
  changedVia: {
    type: String,
    enum: ['Process FG', 'Inward Document', 'Manual Adjustment', 'GRN / Quality Report', 'Sales Order', 'Purchase Order'],
    default: 'Manual Adjustment'
  },
  changeQuantity: { type: Number, required: true },
  changedBy: { type: String, required: true }
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
