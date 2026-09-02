const mongoose = require('mongoose');

const bomComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const bomSchema = new mongoose.Schema({
  finishedProduct: { type: String, required: true },
  components: { type: [bomComponentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BOM', bomSchema);
