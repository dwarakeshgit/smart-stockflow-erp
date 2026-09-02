const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// GET /api/stock-movements
exports.getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find().populate('productId', 'itemName').sort({ date: -1 });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/stock-movements
exports.createStockMovement = async (req, res) => {
  try {
    const movement = new StockMovement(req.body);
    const saved = await movement.save();

    // Update the related product's currentStock and stockValue
    const product = await Product.findById(req.body.productId);
    if (product) {
      product.currentStock += Number(req.body.changeQuantity);
      await product.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
