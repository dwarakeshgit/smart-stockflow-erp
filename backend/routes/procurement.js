const express = require('express');
const router = express.Router();
const {
  getDocuments, createDocument, getReminders, createReminder
} = require('../controllers/procurementController');

router.get('/documents', getDocuments);
router.post('/documents', createDocument);
router.get('/reminders', getReminders);
router.post('/reminders', createReminder);

module.exports = router;
