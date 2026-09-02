const BOM = require('../models/BOM');

// GET /api/bom
exports.getBOMs = async (req, res) => {
  try {
    const boms = await BOM.find().sort({ createdAt: -1 });
    res.json(boms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bom/:id
exports.getBOMById = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ message: 'BOM not found' });
    res.json(bom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bom
exports.createBOM = async (req, res) => {
  try {
    const bom = new BOM(req.body);
    const saved = await bom.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
