const Role = require('../models/Role');

const DEFAULT_ROLES = [
  { roleName: 'Admin', permissions: { viewInventory: true, editInventory: true, deleteInventory: true, viewProduction: true, editProduction: true, viewOrders: true, manageUsers: true } },
  { roleName: 'Manager', permissions: { viewInventory: true, editInventory: true, deleteInventory: false, viewProduction: true, editProduction: true, viewOrders: true, manageUsers: false } },
  { roleName: 'Employee', permissions: { viewInventory: true, editInventory: false, deleteInventory: false, viewProduction: true, editProduction: false, viewOrders: true, manageUsers: false } }
];

// GET /api/roles  (auto-seeds the three default roles the first time this is called)
exports.getRoles = async (req, res) => {
  try {
    const count = await Role.countDocuments();
    if (count === 0) {
      await Role.create(DEFAULT_ROLES);
    }
    const roles = await Role.find().sort({ roleName: 1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/roles/:id
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
