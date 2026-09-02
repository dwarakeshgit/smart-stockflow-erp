const ProcurementDocument = require('../models/ProcurementDocument');
const Reminder = require('../models/Reminder');

// GET /api/procurement/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await ProcurementDocument.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/procurement/documents
exports.createDocument = async (req, res) => {
  try {
    const doc = new ProcurementDocument(req.body);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/procurement/reminders
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ reminderDate: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/procurement/reminders
exports.createReminder = async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    const saved = await reminder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
