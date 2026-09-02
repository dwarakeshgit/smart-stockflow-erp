const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, enum: ['Admin', 'Manager', 'Employee'], required: true, unique: true },
  permissions: {
    viewInventory: { type: Boolean, default: true },
    editInventory: { type: Boolean, default: false },
    deleteInventory: { type: Boolean, default: false },
    viewProduction: { type: Boolean, default: true },
    editProduction: { type: Boolean, default: false },
    viewOrders: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('Role', roleSchema);
