const express = require('express');
const router = express.Router();
const { getBOMs, getBOMById, createBOM } = require('../controllers/bomController');

router.get('/', getBOMs);
router.get('/:id', getBOMById);
router.post('/', createBOM);

module.exports = router;
