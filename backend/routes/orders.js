const express = require('express');
const router = express.Router();
const {
  getOrders, createOrder, updateOrder, getOrderTimeline, updateTimelineStage
} = require('../controllers/orderController');

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.get('/:id/timeline', getOrderTimeline);
router.put('/timeline/:stageId', updateTimelineStage);

module.exports = router;
