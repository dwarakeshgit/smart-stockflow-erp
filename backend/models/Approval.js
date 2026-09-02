const mongoose = require('mongoose');

// Shared approval model reused by three tour features:
//   type: 'Inventory'  -> Inventory Approval   (Smart Inventory Features)
//   type: 'Quality'    -> Quality Approval     (Advanced Production Features)
//   type: 'Procurement'-> Document Approval    (Procurement)
const approvalSchema = new mongoose.Schema({
  type: { type: String, enum: ['Inventory', 'Quality', 'Procurement'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  requestedBy: { type: String, default: 'System' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Approval', approvalSchema);
