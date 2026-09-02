const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  productionId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  targetQuantity: { type: Number, required: true },
  completedQuantity: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['COMPLETED', 'IN-TESTING', 'WIP', 'PENDING', 'PLANNED'],
    default: 'PLANNED'
  },
  totalCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Production', productionSchema);
