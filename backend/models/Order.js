const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  transactionName: { type: String, required: true },
  type: { type: String, enum: ['Sales', 'Purchase'], required: true },
  customer: { type: String, default: '' },
  supplier: { type: String, default: '' },
  invoiceStatus: { type: String, enum: ['Invoice Created', 'Invoice Pending'], default: 'Invoice Pending' },
  goodsStatus: { type: String, enum: ['Dispatched', 'Partially Dispatched', 'Not Dispatched'], default: 'Not Dispatched' },
  amount: { type: Number, required: true, default: 0 },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
