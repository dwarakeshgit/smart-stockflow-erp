require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../backend/config/db');

const User = require('../backend/models/User');
const Product = require('../backend/models/Product');
const StockMovement = require('../backend/models/StockMovement');
const Production = require('../backend/models/Production');
const Order = require('../backend/models/Order');
const OrderTimeline = require('../backend/models/OrderTimeline');
const Report = require('../backend/models/Report');

const seedData = async () => {
  await connectDB();

  console.log('Clearing old data...');
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    StockMovement.deleteMany(),
    Production.deleteMany(),
    Order.deleteMany(),
    OrderTimeline.deleteMany(),
    Report.deleteMany()
  ]);

  console.log('Seeding users...');
  await User.create([
    { name: 'Rohit Sharma', email: 'admin@example.com', password: 'admin123', role: 'Admin' },
    { name: 'Vikas Kumar', email: 'manager@example.com', password: 'manager123', role: 'Manager' },
    { name: 'Shubham Patel', email: 'employee@example.com', password: 'employee123', role: 'Employee' }
  ]);

  console.log('Seeding products...');
  const products = await Product.create([
    { itemName: 'Keyboard (Brand: Logitech)', category: 'Accessories', currentStock: 200, unitPrice: 850, minimumStock: 50, supplier: 'Logitech India' },
    { itemName: 'Battery (Capacity: 70 Whr)', category: 'Components', currentStock: 150, unitPrice: 1200, minimumStock: 40, supplier: 'PowerCell Ltd' },
    { itemName: 'Display (15.6 inches, 1920x1080)', category: 'Components', currentStock: 120, unitPrice: 4500, minimumStock: 30, supplier: 'VisionTech' },
    { itemName: 'Storage (512 GB SSD)', category: 'Components', currentStock: 15, unitPrice: 3200, minimumStock: 25, supplier: 'DataStore Inc' }
  ]);
  // pre-save hook only runs on .save() from a doc instance; create() does call it, so stockValue is set.

  console.log('Seeding stock movements...');
  await StockMovement.create([
    { productId: products[0]._id, changedVia: 'Process FG', changeQuantity: 100, changedBy: 'Rohit' },
    { productId: products[0]._id, changedVia: 'Inward Document', changeQuantity: 100, changedBy: 'Vikas' },
    { productId: products[1]._id, changedVia: 'Manual Adjustment', changeQuantity: 50, changedBy: 'Shubham' },
    { productId: products[2]._id, changedVia: 'GRN / Quality Report', changeQuantity: 10, changedBy: 'Ashish' }
  ]);

  console.log('Seeding production records...');
  await Production.create([
    { productionId: 'PID0001', productName: 'Hoses', targetQuantity: 1000, completedQuantity: 1000, status: 'COMPLETED', totalCost: 250000 },
    { productionId: 'PID0002', productName: 'Fasteners', targetQuantity: 10, completedQuantity: 10, status: 'IN-TESTING', totalCost: 4200 },
    { productionId: 'PID0003', productName: 'Ball Bearings', targetQuantity: 1200, completedQuantity: 200, status: 'WIP', totalCost: 89000 },
    { productionId: 'PID0004', productName: 'Lubricant', targetQuantity: 100, completedQuantity: 0, status: 'PENDING', totalCost: 0 },
    { productionId: 'PID0005', productName: 'Gears', targetQuantity: 5, completedQuantity: 0, status: 'PLANNED', totalCost: 0 },
    { productionId: 'PID0006', productName: 'Butterfly Valve', targetQuantity: 10, completedQuantity: 10, status: 'COMPLETED', totalCost: 4024.39 }
  ]);

  console.log('Seeding orders...');
  const orders = await Order.create([
    { transactionName: 'Order for Globe Valve', type: 'Sales', customer: 'Smartbuy India Pvt Ltd', invoiceStatus: 'Invoice Created', goodsStatus: 'Dispatched', amount: 250000 },
    { transactionName: 'Order for Lily', type: 'Sales', customer: 'Lily Traders', invoiceStatus: 'Invoice Created', goodsStatus: 'Dispatched', amount: 120000 },
    { transactionName: 'Order for Relief Valve', type: 'Purchase', supplier: 'Reliance Industry Ltd', invoiceStatus: 'Invoice Pending', goodsStatus: 'Partially Dispatched', amount: 360000 },
    { transactionName: 'Order for Butterfly Valve', type: 'Purchase', supplier: 'Reliance Industry Ltd, Silvassa', invoiceStatus: 'Invoice Created', goodsStatus: 'Dispatched', amount: 360000 },
    { transactionName: 'Order for Cylinder Valve', type: 'Sales', customer: 'Apex Engineering', invoiceStatus: 'Invoice Pending', goodsStatus: 'Not Dispatched', amount: 180000 }
  ]);

  console.log('Seeding order timeline...');
  const butterflyOrder = orders[3];
  await OrderTimeline.create([
    { orderId: butterflyOrder._id, stage: 'PO', status: 'Completed', description: 'Purchase order raised' },
    { orderId: butterflyOrder._id, stage: 'Inward', status: 'Completed', description: 'Goods received at warehouse' },
    { orderId: butterflyOrder._id, stage: 'GRN / Quality', status: 'Completed', description: 'Quality inspection report generated' },
    { orderId: butterflyOrder._id, stage: 'Invoice', status: 'Completed', description: 'Invoice created for the order' },
    { orderId: butterflyOrder._id, stage: 'Debit Note', status: 'Completed', description: 'Debit note issued for returned items' },
    { orderId: butterflyOrder._id, stage: 'Delivery Challan', status: 'Completed', description: 'Delivery challan generated' }
  ]);

  console.log('Seeding reports...');
  await Report.create([
    { reportName: 'Sales Order Register', category: 'Sales', description: 'List of all sales orders' },
    { reportName: 'Sales Quotation Register', category: 'Sales', description: 'List of all quotations sent' },
    { reportName: 'PO Register', category: 'Purchase', description: 'List of all purchase orders' },
    { reportName: 'Vendor Payment Report', category: 'Purchase', description: 'Outstanding vendor payments' },
    { reportName: 'Product Price & Inventory', category: 'Inventory', description: 'Current stock and valuation' },
    { reportName: 'Low Stock Report', category: 'Inventory', description: 'Items below minimum stock level' },
    { reportName: 'FG Creation Report', category: 'Production', description: 'Finished goods created over time' },
    { reportName: 'Production Cost Report', category: 'Production', description: 'Cost breakdown per production run' }
  ]);

  console.log('Seeding complete!');
  mongoose.connection.close();
};

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
