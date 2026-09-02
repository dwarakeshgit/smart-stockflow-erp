const mongoose = require('mongoose');

const orderTimelineSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  stage: {
    type: String,
    enum: ['PO', 'Inward', 'GRN / Quality', 'Invoice', 'Debit Note', 'Delivery Challan'],
    required: true
  },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  date: { type: Date, default: Date.now },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('OrderTimeline', orderTimelineSchema);
