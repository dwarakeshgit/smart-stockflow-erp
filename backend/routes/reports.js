const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET /api/reports  (optionally filter by ?category=Sales)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const reports = await Report.find(filter).sort({ category: 1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
