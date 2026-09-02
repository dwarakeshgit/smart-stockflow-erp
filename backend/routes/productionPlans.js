const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan } = require('../controllers/productionPlanController');

router.get('/', getPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);

module.exports = router;
