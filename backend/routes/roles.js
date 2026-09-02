const express = require('express');
const router = express.Router();
const { getRoles, updateRole } = require('../controllers/roleController');

router.get('/', getRoles);
router.put('/:id', updateRole);

module.exports = router;
