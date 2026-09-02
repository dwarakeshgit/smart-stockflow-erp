require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/stock-movements', require('./routes/stock'));
app.use('/api/production', require('./routes/production'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/production-plans', require('./routes/productionPlans'));
app.use('/api/bom', require('./routes/bom'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/procurement', require('./routes/procurement'));

// Fallback route -> serve index.html (the product tour landing page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
