const mongoose = require('mongoose');

const productionPlanSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  targetQuantity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  completionDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Draft', 'Scheduled', 'In Progress', 'Completed'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductionPlan', productionPlanSchema);
