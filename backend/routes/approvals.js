const express = require('express');
const router = express.Router();
const { getApprovals, createApproval, updateApproval } = require('../controllers/approvalController');

router.get('/', getApprovals);
router.post('/', createApproval);
router.put('/:id', updateApproval);

module.exports = router;
