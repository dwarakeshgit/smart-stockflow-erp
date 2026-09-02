const Production = require('../models/Production');

// GET /api/production
exports.getProductionRecords = async (req, res) => {
  try {
    const records = await Production.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/production
exports.createProductionRecord = async (req, res) => {
  try {
    const record = new Production(req.body);
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/production/:id
exports.updateProductionRecord = async (req, res) => {
  try {
    const record = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Production record not found' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
