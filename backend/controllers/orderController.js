const Order = require('../models/Order');
const OrderTimeline = require('../models/OrderTimeline');

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/orders/:id/timeline
exports.getOrderTimeline = async (req, res) => {
  try {
    const timeline = await OrderTimeline.find({ orderId: req.params.id }).sort({ date: 1 });
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/timeline/:stageId  (update a single timeline stage's status)
exports.updateTimelineStage = async (req, res) => {
  try {
    const stage = await OrderTimeline.findByIdAndUpdate(req.params.stageId, req.body, { new: true, runValidators: true });
    if (!stage) return res.status(404).json({ message: 'Timeline stage not found' });
    res.json(stage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
