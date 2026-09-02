const mongoose = require('mongoose');

const procurementDocumentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['Purchase Order', 'Quotation', 'Invoice', 'GRN', 'Debit Note', 'Delivery Challan', 'Other'],
    required: true
  },
  reference: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Received', 'Closed'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProcurementDocument', procurementDocumentSchema);
