const ProductionPlan = require('../models/ProductionPlan');

// GET /api/production-plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/production-plans
exports.createPlan = async (req, res) => {
  try {
    const plan = new ProductionPlan(req.body);
    const saved = await plan.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/production-plans/:id
exports.updatePlan = async (req, res) => {
  try {
    const plan = await ProductionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ message: 'Production plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
