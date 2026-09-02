const express = require('express');
const router = express.Router();
const {
  getProductionRecords, createProductionRecord, updateProductionRecord
} = require('../controllers/productionController');

router.get('/', getProductionRecords);
router.post('/', createProductionRecord);
router.put('/:id', updateProductionRecord);

module.exports = router;
