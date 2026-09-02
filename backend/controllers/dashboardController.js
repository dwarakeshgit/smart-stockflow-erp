const Product = require('../models/Product');
const Production = require('../models/Production');
const Order = require('../models/Order');

// GET /api/dashboard/summary
exports.getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    // Low stock = currentStock below minimumStock
    const products = await Product.find();
    const lowStockItems = products.filter(p => p.currentStock < p.minimumStock).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.stockValue || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

    const pendingOrders = await Order.countDocuments({
      $or: [{ invoiceStatus: 'Invoice Pending' }, { goodsStatus: { $ne: 'Dispatched' } }]
    });

    const productionInProgress = await Production.countDocuments({
      status: { $in: ['WIP', 'IN-TESTING'] }
    });

    const totalOrders = await Order.countDocuments();

    res.json({
      totalProducts,
      totalStock,
      lowStockItems,
      totalStockValue,
      pendingOrders,
      totalOrders,
      productionInProgress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
