# StockFlow — Inventory, Production & Order Management

A full-stack web app (HTML/CSS/vanilla JS + Node.js/Express + MongoDB/Mongoose) that recreates the
**structure and flow** of the Product Tour PDF you shared — same sections (Stock Count & Valuation,
Stock Movement History, Production Status, Finished Good Costing, Order Status & Timeline,
Procurement Features, Reports, KPI Summary, Smart Tracking, ROI Calculator) — with a **new navy/purple
color palette**, and real database-backed CRUD instead of static mockups.

---

## Architecture

```
Browser (HTML + CSS + Vanilla JS)
        │  fetch()
        ▼
REST API (Express.js routes/controllers)
        │  Mongoose ODM
        ▼
MongoDB (7 collections: users, products, stockmovements,
         productions, orders, ordertimelines, reports)
```

## Folder structure

```
product-tour-project/
├── frontend/            (10 HTML pages)
├── css/                 (style.css, dashboard.css, responsive.css)
├── js/                  (main.js + one JS file per page)
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/          (7 Mongoose schemas)
│   ├── routes/          (6 route files)
│   └── controllers/     (5 controller files)
├── seed/seed.js
├── .env.example
├── package.json
└── README.md
```

---

# STEP-BY-STEP SETUP (Windows/Mac/Linux)

## STEP 1 — Install Node.js
1. Go to https://nodejs.org and download the **LTS** version.
2. Run the installer, accept defaults.
3. Verify in a terminal (Command Prompt / PowerShell / Terminal):
   ```
   node -v
   npm -v
   ```
   You should see version numbers (e.g. `v20.x.x`). If you get "command not found",
   restart your terminal, or restart your computer, then try again.

## STEP 2 — Get the project onto your machine
Unzip the project folder you downloaded from this chat. You should see the
`product-tour-project` folder with `frontend/`, `backend/`, `css/`, `js/`, `seed/` inside it.
Open a terminal **inside that folder**:
```
cd path/to/product-tour-project
```

## STEP 3 — Initialize / install dependencies
The `package.json` is already created for you. Just run:
```
npm install
```
**Expected result:** a `node_modules` folder appears, and the terminal prints something like
`added 119 packages`.

**Common errors:**
- `npm: command not found` → Node.js isn't installed correctly. Redo Step 1.
- Network errors → check your internet connection / firewall.

## STEP 4 — Install MongoDB
You have two options:

**Option A — MongoDB Atlas (cloud, recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free (M0) cluster.
3. Under "Database Access", create a user with a username/password.
4. Under "Network Access", add your IP (or `0.0.0.0/0` for "allow from anywhere" while testing).
5. Click "Connect" → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/product_tour_db
   ```

**Option B — MongoDB installed locally**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install it (on Windows, install it as a service so it starts automatically).
3. Your local connection string will be:
   ```
   mongodb://127.0.0.1:27017/product_tour_db
   ```

## STEP 5 — Create your `.env` file
1. In the project root, copy `.env.example` and rename the copy to `.env`.
2. Open `.env` and paste your connection string:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/product_tour_db
   PORT=5000
   ```
   (or your Atlas string from Step 4, Option A)

## STEP 6 — Start the backend
```
npm start
```
**Expected result:**
```
MongoDB connected: 127.0.0.1  (or your Atlas host)
Server running on http://localhost:5000
```
Keep this terminal window open — this is your running server.

**Common errors:**
- `MongoDB connection error` → check `.env` for typos, check that MongoDB is actually running
  (Option B) or that your Atlas IP/user/password are correct (Option A).
- `Port already in use` → another program is using port 5000. Change `PORT=5001` in `.env` and restart.
- `Cannot find module 'express'` → you skipped `npm install`. Run it again.

## STEP 7 — Seed sample data
Open a **second** terminal (keep the server running in the first one), `cd` into the project folder, and run:
```
npm run seed
```
**Expected result:** console logs "Seeding complete!" after creating sample users, products,
stock movements, production records, orders, an order timeline, and reports.

## STEP 8 — Open the app in your browser
Go to:
```
http://localhost:5000
```
You'll land on the Product Tour welcome page. Click **"Let's Get Started!"** to walk through all
14 tour slides (use the Next/Back buttons or your keyboard arrow keys), or jump straight to
`http://localhost:5000/dashboard.html` for the working application.

---

# HOW THE PIECES CONNECT (for your understanding)

**Example: Adding a product**
1. You fill in the "Add Product" form on `inventory.html` and click Save.
2. `js/inventory.js` calls `apiPost('/products', payload)`, which does a `fetch()`
   `POST` request to `http://localhost:5000/api/products`.
3. Express (`backend/routes/products.js`) routes this to `productController.createProduct`.
4. The controller creates a `new Product(req.body)` and calls `.save()` — Mongoose writes it to MongoDB.
5. The response comes back to the browser, and the page reloads the product list from `/api/products`.
6. Refresh the page — the product is still there, because it's stored in MongoDB, not in the browser.

The same request → route → controller → Mongoose → MongoDB pattern is used for stock movements,
production records, and orders.

---

# TESTING CRUD MANUALLY

- **Add:** Inventory page → "+ Add Product" → fill form → Save. It should appear in the table immediately.
- **View:** Refresh the page (F5). The data should still be there (proof it's in MongoDB, not memory).
- **Edit:** Click "Edit" next to any product, change a value, Save. The table updates.
- **Delete:** Click "Delete" next to a product, confirm. It disappears from the table and from MongoDB.
- Repeat the same idea for Production ("New Production Record" + status dropdown) and Orders
  ("New Order" + inline status dropdowns + "View" timeline).

---

# FINAL TEST CHECKLIST

- [ ] MongoDB connected (`npm start` shows "MongoDB connected")
- [ ] Backend running on http://localhost:5000
- [ ] Seed data loaded (`npm run seed` ran without errors)
- [ ] Products CRUD works (add/edit/delete on Inventory page)
- [ ] Stock movement logging works and updates Current Stock
- [ ] Production CRUD + status change works
- [ ] Orders CRUD + status change + timeline view works
- [ ] Reports page shows categories and KPI summary
- [ ] Dashboard summary cards show real numbers (not hardcoded)
- [ ] Search works on Inventory page
- [ ] Category filter works on Reports page
- [ ] ROI calculator computes and displays savings
- [ ] Navigation between all pages works
- [ ] Page looks reasonable on a narrow/mobile browser window
- [ ] No red errors in the browser console (F12 → Console tab)

---

# HOW TO EXPLAIN THIS PROJECT

**1. What is the project?**
A web-based inventory, production, and order management system — a mini ERP — inspired by the
sections of the Product Tour PDF, rebuilt with a real database and backend instead of static mockups.

**2. Why this project?**
It touches nearly every core web-development skill at once: frontend UI, REST API design, a real
database, and CRUD — which makes it a strong end-to-end learning and portfolio project.

**3–9. Why these technologies?**
- **HTML** structures each page's content.
- **CSS** gives it a consistent, professional look (navy/purple theme, cards, badges, responsive layout).
- **JavaScript** makes pages interactive without a page reload — forms, search, modals, live dashboard numbers.
- **Node.js** runs JavaScript outside the browser to build the server.
- **Express.js** is a minimal framework that makes it easy to define REST API routes.
- **MongoDB** is a flexible, document-based database — a natural fit for records like products and
  orders that don't always have identical fields.

**10. How does frontend talk to backend?**
Via `fetch()` calls from JavaScript to Express REST endpoints (`GET`, `POST`, `PUT`, `DELETE`)
that return/accept JSON.

**11. How is data stored?**
Express controllers use **Mongoose** (an ODM — Object Data Modeling library) to define schemas and
save/query documents in MongoDB collections.

**12. What are the MongoDB collections?**
`users`, `products`, `stockmovements`, `productions`, `orders`, `ordertimelines`, `reports`.

**13. What APIs exist?**
`/api/products`, `/api/stock-movements`, `/api/production`, `/api/orders`
(+ `/api/orders/:id/timeline`), `/api/reports`, `/api/dashboard/summary`.

**14. What CRUD operations were implemented?**
Full CRUD for Products; Create/Read for Stock Movements; Create/Read/Update for Production and Orders.

**15. Main features?**
Product tour walkthrough, inventory tracking with valuation, stock movement history, production
status & costing, sales/purchase order tracking with a visual timeline, procurement feature
highlights, a categorized report library, KPI summaries computed from live order data, smart
tracking snapshot, and an ROI calculator.

**16. What could be improved?**
Add authentication/login using the `users` collection, role-based permissions (Admin/Manager/Employee),
pagination for large tables, file uploads for documents, and email/SMS auto-reminders for procurement.
