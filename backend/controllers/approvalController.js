const Approval = require('../models/Approval');

// GET /api/approvals?type=Inventory|Quality|Procurement
exports.getApprovals = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const approvals = await Approval.find(filter).sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/approvals
exports.createApproval = async (req, res) => {
  try {
    const approval = new Approval(req.body);
    const saved = await approval.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/approvals/:id  (used to Approve / Reject)
exports.updateApproval = async (req, res) => {
  try {
    const approval = await Approval.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    res.json(approval);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
