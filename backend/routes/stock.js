const express = require('express');
const router = express.Router();
const { getStockMovements, createStockMovement } = require('../controllers/stockController');

router.get('/', getStockMovements);
router.post('/', createStockMovement);

module.exports = router;
