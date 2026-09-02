// Controls the multi-slide product tour AND makes every feature card interactive
// by wiring it to the existing Express REST API + MongoDB (via main.js helpers).
(function () {
  /* ---------------------------------------------------------------------
   * 1. SLIDE NAVIGATION (unchanged behaviour: Back / Next / arrow keys)
   * ------------------------------------------------------------------- */
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 1;

  function showSlide(n) {
    if (n < 1) n = 1;
    if (n > total) n = total;
    current = n;
    slides.forEach(s => s.classList.remove('active'));
    document.querySelector(`.slide[data-slide="${current}"]`).classList.add('active');
    document.getElementById('slideCounter').textContent = `Slide ${current} / ${total}`;
    document.getElementById('backBtn').style.visibility = current === 1 ? 'hidden' : 'visible';
    document.getElementById('nextBtn').style.display = current === total ? 'none' : 'inline-flex';
  }

  document.getElementById('nextBtn').addEventListener('click', () => showSlide(current + 1));
  document.getElementById('backBtn').addEventListener('click', () => showSlide(current - 1));

  document.addEventListener('keydown', (e) => {
    // Don't hijack arrow keys while the user is typing in a modal form field
    if (document.activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') showSlide(current + 1);
    if (e.key === 'ArrowLeft') showSlide(current - 1);
  });

  /* ---------------------------------------------------------------------
   * 2. GENERIC MODAL SYSTEM (reused by every feature below)
   * ------------------------------------------------------------------- */
  const modal = document.getElementById('tourModal');
  const modalBox = document.getElementById('tourModalBox');
  const modalTitle = document.getElementById('tourModalTitle');
  const modalBody = document.getElementById('tourModalBody');

  function openModal(title, wide) {
    modalTitle.textContent = title;
    modalBody.innerHTML = '<div class="inline-loading">Loading…</div>';
    modalBox.classList.toggle('wide', !!wide);
    modal.classList.add('active');
  }
  function closeModal() { modal.classList.remove('active'); }
  function modalError(msg) { modalBody.innerHTML = `<p class="inline-error">${msg}</p>`; }
  document.getElementById('tourModalCloseBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  /* ---------------------------------------------------------------------
   * 3. SLIDE 2 — STOCK COUNT & VALUATION
   * ------------------------------------------------------------------- */
  let tourProducts = [];

  async function loadTourStock() {
    const tbody = document.getElementById('tourStockTable');
    tbody.innerHTML = '<tr><td colspan="3" class="text-muted">Loading…</td></tr>';
    try {
      tourProducts = await apiGet('/products');
      renderTourStock(tourProducts);
      const totalValue = tourProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
      document.getElementById('tourValuationAmt').textContent = formatCurrency(totalValue);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3" class="inline-error">Failed to load stock: ${err.message}</td></tr>`;
    }
  }

  function renderTourStock(products) {
    const tbody = document.getElementById('tourStockTable');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-muted">No products found. Seed the database or add one from Inventory.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(p => `
      <tr class="row-clickable" onclick="tourViewProduct('${p._id}')">
        <td>${p.itemName}</td>
        <td>${p.currentStock}</td>
        <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); tourViewProduct('${p._id}')">View</button></td>
      </tr>
    `).join('');
  }

  document.getElementById('tourStockSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderTourStock(tourProducts.filter(p => p.itemName.toLowerCase().includes(q)));
  });
  document.getElementById('tourStockRefreshBtn').addEventListener('click', loadTourStock);

  window.tourViewProduct = function (id) {
    const p = tourProducts.find(x => x._id === id);
    if (!p) return;
    openModal('Product Details');
    modalBody.innerHTML = `
      <table>
        <tr><th style="text-align:left;">Item Name</th><td>${p.itemName}</td></tr>
        <tr><th style="text-align:left;">Category</th><td>${p.category}</td></tr>
        <tr><th style="text-align:left;">Current Stock</th><td>${p.currentStock}</td></tr>
        <tr><th style="text-align:left;">Unit Price</th><td>₹${Number(p.unitPrice).toLocaleString('en-IN')}</td></tr>
        <tr><th style="text-align:left;">Stock Value</th><td>${formatCurrency(p.currentStock * p.unitPrice)}</td></tr>
        <tr><th style="text-align:left;">Minimum Stock</th><td>${p.minimumStock}</td></tr>
        <tr><th style="text-align:left;">Supplier</th><td>${p.supplier || '-'}</td></tr>
      </table>
    `;
  };

  /* ---------------------------------------------------------------------
   * 4. SLIDE 3 — STOCK MOVEMENT HISTORY (+ "Add Stock" on Slide 2 reuses this)
   * ------------------------------------------------------------------- */
  async function loadTourMovements() {
    const tbody = document.getElementById('tourMovementsTable');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Loading…</td></tr>';
    try {
      const movements = await apiGet('/stock-movements');
      if (!movements.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No stock movements yet.</td></tr>';
        return;
      }
      tbody.innerHTML = movements.slice(0, 10).map(m => `
        <tr>
          <td>${formatDate(m.date)}</td>
          <td>${m.productId ? m.productId.itemName : 'N/A'}</td>
          <td>${m.changedVia}</td>
          <td style="color:${m.changeQuantity >= 0 ? 'var(--success)' : 'var(--danger)'}">${m.changeQuantity >= 0 ? '+' : ''}${Number(m.changeQuantity).toFixed(2)}</td>
          <td>${m.changedBy}</td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="inline-error">Failed to load movements: ${err.message}</td></tr>`;
    }
  }

  function openAddMovementModal() {
    openModal('Add Stock Movement');
    const options = tourProducts.map(p => `<option value="${p._id}">${p.itemName}</option>`).join('');
    modalBody.innerHTML = `
      <form id="tourMovementForm">
        <div class="form-group">
          <label>Product</label>
          <select id="mvProduct" required>${options || '<option value="">No products available</option>'}</select>
        </div>
        <div class="form-group">
          <label>Changed Via</label>
          <select id="mvChangedVia">
            <option>Process FG</option><option>Inward Document</option><option>Manual Adjustment</option>
            <option>GRN / Quality Report</option><option>Sales Order</option><option>Purchase Order</option>
          </select>
        </div>
        <div class="form-group"><label>Change Quantity (use negative to reduce)</label><input type="number" id="mvQuantity" required></div>
        <div class="form-group"><label>Changed By</label><input type="text" id="mvChangedBy" required></div>
        <div id="mvError"></div>
        <div class="nav-row">
          <span></span>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    document.getElementById('tourMovementForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = document.getElementById('mvProduct').value;
      if (!productId) { document.getElementById('mvError').innerHTML = '<p class="inline-error">No product selected.</p>'; return; }
      const payload = {
        productId,
        changedVia: document.getElementById('mvChangedVia').value,
        changeQuantity: Number(document.getElementById('mvQuantity').value),
        changedBy: document.getElementById('mvChangedBy').value
      };
      try {
        await apiPost('/stock-movements', payload);
        showToast('Stock movement recorded');
        closeModal();
        await loadTourStock();
        await loadTourMovements();
      } catch (err) {
        document.getElementById('mvError').innerHTML = `<p class="inline-error">${err.message}</p>`;
      }
    });
  }
  document.getElementById('tourAddMovementBtn').addEventListener('click', openAddMovementModal);
  document.getElementById('tourAddStockBtn').addEventListener('click', openAddMovementModal);

  /* ---------------------------------------------------------------------
   * 5. SLIDE 4 — SMART INVENTORY FEATURES
   * ------------------------------------------------------------------- */
  document.getElementById('cardLowStock').addEventListener('click', async () => {
    openModal('Low-stock Alerts');
    try {
      const products = await apiGet('/products');
      const low = products.filter(p => p.currentStock <= p.minimumStock);
      if (!low.length) { modalBody.innerHTML = '<p class="text-muted">No products are currently at or below their minimum stock level.</p>'; return; }
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Product</th><th>Current Stock</th><th>Minimum Stock</th><th>Alert</th></tr></thead>
          <tbody>${low.map(p => `
            <tr><td>${p.itemName}</td><td>${p.currentStock}</td><td>${p.minimumStock}</td>
            <td><span class="badge badge-pending">Low Stock</span></td></tr>
          `).join('')}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load alerts: ${err.message}`); }
  });

  document.getElementById('cardDashboard').addEventListener('click', async () => {
    openModal('Intelligent Dashboard');
    try {
      const s = await apiGet('/dashboard/summary');
      modalBody.innerHTML = `
        <div class="summary-grid" style="grid-template-columns:repeat(2,1fr);">
          <div class="summary-card"><div class="label">Total Products</div><div class="value">${s.totalProducts}</div></div>
          <div class="summary-card"><div class="label">Total Stock (units)</div><div class="value">${s.totalStock}</div></div>
          <div class="summary-card alert"><div class="label">Low Stock Items</div><div class="value">${s.lowStockItems}</div></div>
          <div class="summary-card ok"><div class="label">Total Inventory Value</div><div class="value">${formatCurrency(s.totalStockValue)}</div></div>
        </div>
      `;
    } catch (err) { modalError(`Failed to load dashboard: ${err.message}`); }
  });

  document.getElementById('cardMultiPrice').addEventListener('click', async () => {
    openModal('Multiple Prices', true);
    try {
      const products = await apiGet('/products');
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Product</th><th>Unit Price</th><th>Purchase Price</th><th>Selling Price</th><th></th></tr></thead>
          <tbody>${products.map(p => `
            <tr>
              <td>${p.itemName}</td>
              <td>₹${Number(p.unitPrice).toLocaleString('en-IN')}</td>
              <td><input type="number" id="pp-${p._id}" value="${p.purchasePrice || 0}" style="width:100px;"></td>
              <td><input type="number" id="sp-${p._id}" value="${p.sellingPrice || 0}" style="width:100px;"></td>
              <td><button class="btn btn-outline btn-sm" onclick="tourSavePrices('${p._id}')">Save</button></td>
            </tr>
          `).join('')}</tbody>
        </table>
        <div id="priceMsg"></div>
      `;
    } catch (err) { modalError(`Failed to load pricing: ${err.message}`); }
  });

  window.tourSavePrices = async function (id) {
    const purchasePrice = Number(document.getElementById(`pp-${id}`).value) || 0;
    const sellingPrice = Number(document.getElementById(`sp-${id}`).value) || 0;
    try {
      await apiPut(`/products/${id}`, { purchasePrice, sellingPrice });
      document.getElementById('priceMsg').innerHTML = '<p style="color:var(--success);margin-top:10px;">Saved.</p>';
      showToast('Prices updated');
    } catch (err) {
      document.getElementById('priceMsg').innerHTML = `<p class="inline-error">${err.message}</p>`;
    }
  };

  async function loadInventoryApprovals() {
    openModal('Inventory Approval', true);
    try {
      const [approvals, products] = await Promise.all([apiGet('/approvals?type=Inventory'), apiGet('/products')]);
      const options = products.map(p => `<option value="${p._id}" data-name="${p.itemName}">${p.itemName}</option>`).join('');
      modalBody.innerHTML = `
        <form id="newApprovalForm" style="margin-bottom:16px;">
          <div class="form-row">
            <div class="form-group"><label>Product needing adjustment approval</label><select id="apProduct">${options}</select></div>
            <div class="form-group"><label>Note</label><input type="text" id="apNote" placeholder="e.g. Stock count correction"></div>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Submit for Approval</button>
        </form>
        <table>
          <thead><tr><th>Title</th><th>Requested By</th><th>Status</th><th></th></tr></thead>
          <tbody id="invApprovalsTable">${renderApprovalRows(approvals)}</tbody>
        </table>
      `;
      document.getElementById('newApprovalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById('apProduct');
        const name = select.options[select.selectedIndex]?.dataset.name || 'Item';
        try {
          await apiPost('/approvals', { type: 'Inventory', title: `Adjustment: ${name}`, description: document.getElementById('apNote').value, requestedBy: 'Tour User' });
          showToast('Approval request submitted');
          loadInventoryApprovals();
        } catch (err) { showToast('Failed: ' + err.message, 'error'); }
      });
    } catch (err) { modalError(`Failed to load approvals: ${err.message}`); }
  }
  document.getElementById('cardInvApproval').addEventListener('click', loadInventoryApprovals);

  function renderApprovalRows(approvals) {
    if (!approvals.length) return '<tr><td colspan="4" class="text-muted">No approval requests yet.</td></tr>';
    return approvals.map(a => `
      <tr>
        <td>${a.title}</td>
        <td>${a.requestedBy}</td>
        <td><span class="badge ${statusBadgeClass(a.status)}">${a.status}</span></td>
        <td>
          ${a.status === 'Pending' ? `
            <button class="btn btn-outline btn-sm" onclick="tourDecideApproval('${a._id}','Approved','${a.type}')">Approve</button>
            <button class="btn btn-outline btn-sm" onclick="tourDecideApproval('${a._id}','Rejected','${a.type}')">Reject</button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  }

  window.tourDecideApproval = async function (id, status, type) {
    try {
      await apiPut(`/approvals/${id}`, { status });
      showToast(`Marked as ${status}`);
      if (type === 'Inventory') loadInventoryApprovals();
      else if (type === 'Quality') loadQualityApproval();
      else if (type === 'Procurement') loadDocApproval();
    } catch (err) { showToast('Update failed: ' + err.message, 'error'); }
  };

  /* ---------------------------------------------------------------------
   * 6. SLIDE 5 — PRODUCTION STATUS
   * ------------------------------------------------------------------- */
  let tourProduction = [];

  async function loadTourProduction() {
    const tbody = document.getElementById('tourProductionTable');
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Loading…</td></tr>';
    try {
      tourProduction = await apiGet('/production');
      if (!tourProduction.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No production records yet.</td></tr>';
        return;
      }
      tbody.innerHTML = tourProduction.map(r => `
        <tr class="row-clickable" onclick="tourViewProduction('${r._id}')">
          <td>${r.productName}</td>
          <td>${r.targetQuantity}</td>
          <td>${r.completedQuantity || '-'}</td>
          <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="inline-error">Failed to load production: ${err.message}</td></tr>`;
    }
  }

  window.tourViewProduction = function (id) {
    const r = tourProduction.find(x => x._id === id);
    if (!r) return;
    openModal(`Production — ${r.productionId}`);
    modalBody.innerHTML = `
      <table style="margin-bottom:16px;">
        <tr><th style="text-align:left;">Production ID</th><td>${r.productionId}</td></tr>
        <tr><th style="text-align:left;">Product</th><td>${r.productName}</td></tr>
        <tr><th style="text-align:left;">Target Qty</th><td>${r.targetQuantity}</td></tr>
        <tr><th style="text-align:left;">Completed Qty</th><td>${r.completedQuantity || 0}</td></tr>
        <tr><th style="text-align:left;">Total Cost</th><td>₹${Number(r.totalCost).toLocaleString('en-IN')}</td></tr>
      </table>
      <div class="form-group">
        <label>Update Status</label>
        <select id="prodStatusSelect">
          ${['PLANNED', 'PENDING', 'WIP', 'IN-TESTING', 'COMPLETED'].map(s => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="tourSaveProductionStatus('${r._id}')">Save Status</button>
      <div id="prodStatusMsg"></div>
    `;
  };

  window.tourSaveProductionStatus = async function (id) {
    const status = document.getElementById('prodStatusSelect').value;
    try {
      await apiPut(`/production/${id}`, { status });
      document.getElementById('prodStatusMsg').innerHTML = '<p style="color:var(--success);margin-top:10px;">Status updated.</p>';
      showToast('Production status updated');
      await loadTourProduction();
    } catch (err) {
      document.getElementById('prodStatusMsg').innerHTML = `<p class="inline-error">${err.message}</p>`;
    }
  };

  /* ---------------------------------------------------------------------
   * 7. SLIDE 6 — FINISHED GOOD COSTING (light real-data touch)
   * ------------------------------------------------------------------- */
  async function loadTourCosting() {
    const box = document.getElementById('tourCostingCard');
    try {
      const records = await apiGet('/production');
      const done = records.find(r => r.status === 'COMPLETED') || records[0];
      if (!done) { box.innerHTML = '<p class="text-muted mt-16">No production records yet.</p>'; return; }
      box.innerHTML = `
        <div class="card" style="max-width:420px;margin:40px auto;">
          <h3>${done.productionId}</h3>
          <p class="text-muted">Production Process for ${done.productName}</p>
          <span class="badge ${statusBadgeClass(done.status)}">${done.status}</span>
          <h2 style="margin-top:16px;color:var(--navy);">Total Cost: ₹${Number(done.totalCost).toLocaleString('en-IN')} <small style="font-size:14px;">(For ${done.completedQuantity || done.targetQuantity} pcs)</small></h2>
        </div>
      `;
    } catch (err) {
      box.innerHTML = `<p class="inline-error">Failed to load costing: ${err.message}</p>`;
    }
  }

  /* ---------------------------------------------------------------------
   * 8. SLIDE 7 — ADVANCED PRODUCTION FEATURES
   * ------------------------------------------------------------------- */
  document.getElementById('cardSmartPlanning').addEventListener('click', async () => {
    openModal('Smart Planning', true);
    try {
      const [plans, products] = await Promise.all([apiGet('/production-plans'), apiGet('/products')]);
      const productOptions = products.map(p => `<option value="${p.itemName}">${p.itemName}</option>`).join('');
      modalBody.innerHTML = `
        <form id="planForm" style="margin-bottom:20px;">
          <div class="form-row">
            <div class="form-group"><label>Product</label><select id="planProduct">${productOptions}</select></div>
            <div class="form-group"><label>Target Quantity</label><input type="number" id="planQty" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Planned Start Date</label><input type="date" id="planStart" required></div>
            <div class="form-group"><label>Planned Completion Date</label><input type="date" id="planEnd" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Priority</label><select id="planPriority"><option>Low</option><option selected>Medium</option><option>High</option><option>Urgent</option></select></div>
            <div class="form-group"><label>Status</label><select id="planStatus"><option>Draft</option><option>Scheduled</option><option>In Progress</option><option>Completed</option></select></div>
          </div>
          <div id="planError"></div>
          <button type="submit" class="btn btn-primary">Save Plan</button>
        </form>
        <h3 style="margin-bottom:10px;color:var(--navy);">Existing Plans</h3>
        <table>
          <thead><tr><th>Product</th><th>Target</th><th>Start</th><th>Completion</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>${plans.length ? plans.map(p => `
            <tr><td>${p.productName}</td><td>${p.targetQuantity}</td><td>${new Date(p.startDate).toLocaleDateString('en-IN')}</td>
            <td>${new Date(p.completionDate).toLocaleDateString('en-IN')}</td><td>${p.priority}</td>
            <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td></tr>
          `).join('') : '<tr><td colspan="6" class="text-muted">No plans yet.</td></tr>'}</tbody>
        </table>
      `;
      document.getElementById('planForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          productName: document.getElementById('planProduct').value,
          targetQuantity: Number(document.getElementById('planQty').value),
          startDate: document.getElementById('planStart').value,
          completionDate: document.getElementById('planEnd').value,
          priority: document.getElementById('planPriority').value,
          status: document.getElementById('planStatus').value
        };
        try {
          await apiPost('/production-plans', payload);
          showToast('Production plan saved');
          document.getElementById('cardSmartPlanning').click();
        } catch (err) { document.getElementById('planError').innerHTML = `<p class="inline-error">${err.message}</p>`; }
      });
    } catch (err) { modalError(`Failed to load Smart Planning: ${err.message}`); }
  });

  let bomComponentCount = 0;
  document.getElementById('cardBOM').addEventListener('click', async () => {
    openModal('Multi-level BOM', true);
    bomComponentCount = 0;
    try {
      const [boms, products] = await Promise.all([apiGet('/bom'), apiGet('/products')]);
      const productOptions = products.map(p => `<option value="${p.itemName}">${p.itemName}</option>`).join('');
      modalBody.innerHTML = `
        <form id="bomForm" style="margin-bottom:20px;">
          <div class="form-group"><label>Finished Product</label><select id="bomProduct">${productOptions}<option value="Butterfly Valve">Butterfly Valve (custom)</option></select></div>
          <div id="bomComponents"></div>
          <button type="button" class="btn btn-outline btn-sm" id="addComponentBtn">+ Add Component</button>
          <div id="bomError" class="mt-16"></div>
          <div class="nav-row"><span></span><button type="submit" class="btn btn-primary">Save BOM</button></div>
        </form>
        <h3 style="margin-bottom:10px;color:var(--navy);">Existing BOMs</h3>
        <div id="bomList">${boms.length ? boms.map(b => `
          <div class="expand-row" onclick="tourToggleBom('${b._id}')"><span>${b.finishedProduct}</span><span class="text-muted">⌄ View</span></div>
          <div id="bom-detail-${b._id}" style="display:none;padding:10px 0;">
            ${b.components.map(c => `<div>• ${c.componentName} × ${c.quantity}</div>`).join('') || '<div class="text-muted">No components recorded.</div>'}
          </div>
        `).join('') : '<p class="text-muted">No BOMs created yet.</p>'}</div>
      `;
      function addComponentRow() {
        bomComponentCount++;
        const row = document.createElement('div');
        row.className = 'bom-component-row';
        row.id = `bomRow-${bomComponentCount}`;
        row.innerHTML = `
          <input type="text" placeholder="Component name" class="bomCompName">
          <input type="number" placeholder="Qty" value="1" class="bomCompQty">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('bomRow-${bomComponentCount}').remove()">✕</button>
        `;
        document.getElementById('bomComponents').appendChild(row);
      }
      document.getElementById('addComponentBtn').addEventListener('click', addComponentRow);
      addComponentRow(); addComponentRow(); // start with 2 rows, matching the example in the spec

      document.getElementById('bomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rows = document.querySelectorAll('.bom-component-row');
        const components = Array.from(rows).map(r => ({
          componentName: r.querySelector('.bomCompName').value,
          quantity: Number(r.querySelector('.bomCompQty').value) || 1
        })).filter(c => c.componentName);
        if (!components.length) { document.getElementById('bomError').innerHTML = '<p class="inline-error">Add at least one component.</p>'; return; }
        try {
          await apiPost('/bom', { finishedProduct: document.getElementById('bomProduct').value, components });
          showToast('BOM saved');
          document.getElementById('cardBOM').click();
        } catch (err) { document.getElementById('bomError').innerHTML = `<p class="inline-error">${err.message}</p>`; }
      });
    } catch (err) { modalError(`Failed to load BOM: ${err.message}`); }
  });
  window.tourToggleBom = function (id) {
    const el = document.getElementById(`bom-detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  };

  const PERMISSION_LABELS = {
    viewInventory: 'View Inventory', editInventory: 'Edit Inventory', deleteInventory: 'Delete Inventory',
    viewProduction: 'View Production', editProduction: 'Edit Production', viewOrders: 'View Orders', manageUsers: 'Manage Users'
  };
  document.getElementById('cardRoles').addEventListener('click', async () => {
    openModal('Role-wise Access', true);
    try {
      const roles = await apiGet('/roles');
      const permKeys = Object.keys(PERMISSION_LABELS);
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Permission</th>${roles.map(r => `<th>${r.roleName}</th>`).join('')}</tr></thead>
          <tbody>
            ${permKeys.map(key => `
              <tr>
                <td>${PERMISSION_LABELS[key]}</td>
                ${roles.map(r => `<td style="text-align:center;"><input type="checkbox" ${r.permissions[key] ? 'checked' : ''} onchange="tourTogglePermission('${r._id}','${key}',this.checked)"></td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="tip mt-16">Changes save immediately per checkbox.</p>
      `;
    } catch (err) { modalError(`Failed to load roles: ${err.message}`); }
  });
  window.tourTogglePermission = async function (roleId, key, value) {
    try {
      await apiPut(`/roles/${roleId}`, { [`permissions.${key}`]: value });
      showToast('Permission updated');
    } catch (err) { showToast('Failed: ' + err.message, 'error'); }
  };

  async function loadQualityApproval() {
    openModal('Quality Approval', true);
    try {
      const [approvals, production] = await Promise.all([apiGet('/approvals?type=Quality'), apiGet('/production')]);
      const pendingCandidates = production.filter(r => ['WIP', 'IN-TESTING'].includes(r.status));
      modalBody.innerHTML = `
        <div style="margin-bottom:16px;">
          <label class="text-muted" style="font-size:13px;">Send a production record for quality approval:</label><br>
          <select id="qaProduction" style="margin-top:6px;">${pendingCandidates.map(r => `<option value="${r._id}" data-label="${r.productionId} — ${r.productName}">${r.productionId} — ${r.productName} (${r.status})</option>`).join('') || '<option value="">No WIP/IN-TESTING records</option>'}</select>
          <button class="btn btn-outline btn-sm" onclick="tourRequestQuality()">Send for Approval</button>
        </div>
        <table>
          <thead><tr><th>Title</th><th>Requested By</th><th>Status</th><th></th></tr></thead>
          <tbody id="qaTable">${renderApprovalRows(approvals)}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load quality approvals: ${err.message}`); }
  }
  window.tourRequestQuality = async function () {
    const select = document.getElementById('qaProduction');
    if (!select.value) return;
    const label = select.options[select.selectedIndex].dataset.label;
    try {
      await apiPost('/approvals', { type: 'Quality', title: label, requestedBy: 'Tour User' });
      showToast('Sent for quality approval');
      loadQualityApproval();
    } catch (err) { showToast('Failed: ' + err.message, 'error'); }
  };
  document.getElementById('cardQuality').addEventListener('click', loadQualityApproval);

  /* ---------------------------------------------------------------------
   * 9. SLIDE 8 — ORDER STATUS
   * ------------------------------------------------------------------- */
  async function loadTourOrders() {
    const tbody = document.getElementById('tourOrdersTable');
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Loading…</td></tr>';
    try {
      const orders = await apiGet('/orders');
      if (!orders.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No orders yet.</td></tr>'; return; }
      tbody.innerHTML = orders.map(o => `
        <tr>
          <td>${o.transactionName}</td>
          <td>
            <select onchange="tourUpdateOrderField('${o._id}','invoiceStatus',this.value)">
              <option ${o.invoiceStatus === 'Invoice Pending' ? 'selected' : ''}>Invoice Pending</option>
              <option ${o.invoiceStatus === 'Invoice Created' ? 'selected' : ''}>Invoice Created</option>
            </select>
          </td>
          <td>
            <select onchange="tourUpdateOrderField('${o._id}','goodsStatus',this.value)">
              <option ${o.goodsStatus === 'Not Dispatched' ? 'selected' : ''}>Not Dispatched</option>
              <option ${o.goodsStatus === 'Partially Dispatched' ? 'selected' : ''}>Partially Dispatched</option>
              <option ${o.goodsStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
            </select>
          </td>
          <td>₹${Number(o.amount).toLocaleString('en-IN')}</td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="inline-error">Failed to load orders: ${err.message}</td></tr>`;
    }
  }
  window.tourUpdateOrderField = async function (id, field, value) {
    try {
      await apiPut(`/orders/${id}`, { [field]: value });
      showToast('Order updated');
    } catch (err) { showToast('Update failed: ' + err.message, 'error'); }
  };

  /* ---------------------------------------------------------------------
   * 10. SLIDE 9 — ORDER TIMELINE
   * ------------------------------------------------------------------- */
  async function loadTimelineOrderOptions() {
    const select = document.getElementById('tourTimelineOrderSelect');
    try {
      const orders = await apiGet('/orders');
      if (!orders.length) { select.innerHTML = '<option value="">No orders available</option>'; return; }
      select.innerHTML = '<option value="">Select an order…</option>' + orders.map(o => `<option value="${o._id}">${o.transactionName}</option>`).join('');
    } catch (err) {
      select.innerHTML = '<option value="">Failed to load orders</option>';
    }
  }
  document.getElementById('tourTimelineOrderSelect').addEventListener('change', async (e) => {
    const orderId = e.target.value;
    const body = document.getElementById('tourTimelineBody');
    if (!orderId) { body.innerHTML = '<p class="text-muted">Pick an order above to view its timeline.</p>'; return; }
    body.innerHTML = '<div class="inline-loading">Loading…</div>';
    try {
      const timeline = await apiGet(`/orders/${orderId}/timeline`);
      if (!timeline.length) {
        body.innerHTML = '<p class="text-muted">No timeline entries recorded for this order yet.</p>';
        return;
      }
      body.innerHTML = `
        <div class="timeline-track">
          ${timeline.map(t => `
            <div class="tstep" onclick="tourAdvanceTimelineStage('${t._id}','${orderId}','${t.status}')">
              <div class="tdot ${t.status === 'Completed' ? 'done' : ''}">${t.status === 'Completed' ? '✓' : '•'}</div>
              ${t.stage}<br>${new Date(t.date).toLocaleDateString('en-IN')}
            </div>
            <div class="tline"></div>
          `).join('')}
        </div>
        <p class="tip">Click a stage to toggle it Completed / Pending.</p>
        <table style="margin-top:12px;">
          <thead><tr><th>Stage</th><th>Status</th><th>Description</th></tr></thead>
          <tbody>${timeline.map(t => `<tr><td>${t.stage}</td><td><span class="badge ${statusBadgeClass(t.status)}">${t.status}</span></td><td>${t.description || '-'}</td></tr>`).join('')}</tbody>
        </table>
      `;
    } catch (err) {
      body.innerHTML = `<p class="inline-error">Failed to load timeline: ${err.message}</p>`;
    }
  });
  window.tourAdvanceTimelineStage = async function (stageId, orderId, currentStatus) {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await apiPut(`/orders/timeline/${stageId}`, { status: newStatus });
      showToast('Timeline stage updated');
      document.getElementById('tourTimelineOrderSelect').dispatchEvent(new Event('change'));
    } catch (err) { showToast('Failed: ' + err.message, 'error'); }
  };

  /* ---------------------------------------------------------------------
   * 11. SLIDE 10 — PROCUREMENT
   * ------------------------------------------------------------------- */
  document.getElementById('cardDocuments').addEventListener('click', async () => {
    openModal('16+ Documents', true);
    try {
      const docs = await apiGet('/procurement/documents');
      modalBody.innerHTML = `
        <form id="docForm" style="margin-bottom:16px;">
          <div class="form-row">
            <div class="form-group"><label>Document Type</label><select id="docType">
              <option>Purchase Order</option><option>Quotation</option><option>Invoice</option><option>GRN</option><option>Debit Note</option><option>Delivery Challan</option><option>Other</option>
            </select></div>
            <div class="form-group"><label>Reference</label><input type="text" id="docReference" required placeholder="e.g. PO-2026-014"></div>
          </div>
          <div class="form-group"><label>Status</label><select id="docStatus"><option>Draft</option><option>Sent</option><option>Received</option><option>Closed</option></select></div>
          <button type="submit" class="btn btn-primary btn-sm">Create Document</button>
        </form>
        <table>
          <thead><tr><th>Type</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>${docs.length ? docs.map(d => `<tr><td>${d.docType}</td><td>${d.reference}</td><td><span class="badge ${statusBadgeClass(d.status)}">${d.status}</span></td></tr>`).join('') : '<tr><td colspan="3" class="text-muted">No documents yet.</td></tr>'}</tbody>
        </table>
      `;
      document.getElementById('docForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await apiPost('/procurement/documents', {
            docType: document.getElementById('docType').value,
            reference: document.getElementById('docReference').value,
            status: document.getElementById('docStatus').value
          });
          showToast('Document created');
          document.getElementById('cardDocuments').click();
        } catch (err) { showToast('Failed: ' + err.message, 'error'); }
      });
    } catch (err) { modalError(`Failed to load documents: ${err.message}`); }
  });

  const FX_RATES_TO_INR = { INR: 1, USD: 83.5, EUR: 90.2, GBP: 105.7 };
  document.getElementById('cardCurrency').addEventListener('click', () => {
    openModal('Multi-Currency Support');
    modalBody.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Amount</label><input type="number" id="fxAmount" value="1000"></div>
        <div class="form-group"><label>Currency</label><select id="fxCurrency"><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option></select></div>
      </div>
      <button class="btn btn-primary btn-sm" id="fxConvertBtn">Convert to ₹ (INR)</button>
      <div id="fxResult" class="mt-16" style="font-size:20px;font-weight:700;color:var(--navy);"></div>
      <p class="tip mt-16">Demo conversion rates for illustration purposes.</p>
    `;
    document.getElementById('fxConvertBtn').addEventListener('click', () => {
      const amount = Number(document.getElementById('fxAmount').value) || 0;
      const currency = document.getElementById('fxCurrency').value;
      const converted = amount * FX_RATES_TO_INR[currency];
      document.getElementById('fxResult').textContent = `${amount} ${currency} = ${formatCurrency(converted)}`;
    });
  });

  document.getElementById('cardReminders').addEventListener('click', async () => {
    openModal('Auto-reminders', true);
    try {
      const reminders = await apiGet('/procurement/reminders');
      const today = new Date();
      modalBody.innerHTML = `
        <form id="remForm" style="margin-bottom:16px;">
          <div class="form-row">
            <div class="form-group"><label>Title</label><input type="text" id="remTitle" required placeholder="e.g. Follow up on PO-2026-014"></div>
            <div class="form-group"><label>Reminder Date</label><input type="date" id="remDate" required></div>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Create Reminder</button>
        </form>
        <table>
          <thead><tr><th>Title</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>${reminders.length ? reminders.map(r => {
            const due = new Date(r.reminderDate) <= today;
            const label = r.status === 'Completed' ? 'Completed' : (due ? 'Due' : 'Upcoming');
            return `<tr><td>${r.title}</td><td>${new Date(r.reminderDate).toLocaleDateString('en-IN')}</td><td><span class="badge ${statusBadgeClass(label === 'Due' ? 'PENDING' : label === 'Completed' ? 'COMPLETED' : 'PLANNED')}">${label}</span></td></tr>`;
          }).join('') : '<tr><td colspan="3" class="text-muted">No reminders yet.</td></tr>'}</tbody>
        </table>
      `;
      document.getElementById('remForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await apiPost('/procurement/reminders', { title: document.getElementById('remTitle').value, reminderDate: document.getElementById('remDate').value });
          showToast('Reminder created');
          document.getElementById('cardReminders').click();
        } catch (err) { showToast('Failed: ' + err.message, 'error'); }
      });
    } catch (err) { modalError(`Failed to load reminders: ${err.message}`); }
  });

  async function loadDocApproval() {
    openModal('Document Approval', true);
    try {
      const [approvals, docs] = await Promise.all([apiGet('/approvals?type=Procurement'), apiGet('/procurement/documents')]);
      modalBody.innerHTML = `
        <div style="margin-bottom:16px;">
          <label class="text-muted" style="font-size:13px;">Submit a document for approval:</label><br>
          <select id="docApprovalSelect" style="margin-top:6px;">${docs.map(d => `<option value="${d._id}" data-label="${d.docType} — ${d.reference}">${d.docType} — ${d.reference}</option>`).join('') || '<option value="">No documents yet</option>'}</select>
          <button class="btn btn-outline btn-sm" onclick="tourRequestDocApproval()">Send for Approval</button>
        </div>
        <table>
          <thead><tr><th>Title</th><th>Requested By</th><th>Status</th><th></th></tr></thead>
          <tbody id="docApTable">${renderApprovalRows(approvals)}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load document approvals: ${err.message}`); }
  }
  window.tourRequestDocApproval = async function () {
    const select = document.getElementById('docApprovalSelect');
    if (!select.value) return;
    const label = select.options[select.selectedIndex].dataset.label;
    try {
      await apiPost('/approvals', { type: 'Procurement', title: label, requestedBy: 'Tour User' });
      showToast('Sent for document approval');
      loadDocApproval();
    } catch (err) { showToast('Failed: ' + err.message, 'error'); }
  };
  document.getElementById('cardDocApproval').addEventListener('click', loadDocApproval);

  /* ---------------------------------------------------------------------
   * 12. SLIDE 11 — REPORTS
   * ------------------------------------------------------------------- */
  async function loadTourReportCounts() {
    try {
      const reports = await apiGet('/reports');
      document.querySelectorAll('#tourReportCards .feature-card').forEach(card => {
        const cat = card.dataset.category;
        const count = reports.filter(r => r.category === cat).length;
        card.querySelector('.rep-count').textContent = `${count}+`;
      });
    } catch (err) { showToast('Failed to load report counts: ' + err.message, 'error'); }
  }
  document.querySelectorAll('#tourReportCards .feature-card').forEach(card => {
    card.addEventListener('click', async () => {
      const category = card.dataset.category;
      openModal(`${category} Reports`);
      try {
        const reports = await apiGet(`/reports?category=${encodeURIComponent(category)}`);
        if (!reports.length) { modalBody.innerHTML = '<p class="text-muted">No reports found for this category.</p>'; return; }
        modalBody.innerHTML = `
          <table>
            <thead><tr><th>Report Name</th><th>Description</th></tr></thead>
            <tbody>${reports.map(r => `<tr><td>${r.reportName}</td><td>${r.description || '-'}</td></tr>`).join('')}</tbody>
          </table>
        `;
      } catch (err) { modalError(`Failed to load reports: ${err.message}`); }
    });
  });

  /* ---------------------------------------------------------------------
   * 13. SLIDE 12 — KPI SUMMARY
   * ------------------------------------------------------------------- */
  async function loadTourKpi() {
    const tbody = document.getElementById('tourKpiTable');
    try {
      const orders = await apiGet('/orders');
      const sales = orders.filter(o => o.type === 'Sales');
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const mtd = sales.filter(o => new Date(o.orderDate) >= monthStart);
      const last30Days = sales.filter(o => new Date(o.orderDate) >= last30);
      const sum = arr => arr.reduce((s, o) => s + o.amount, 0);
      tbody.innerHTML = `
        <tr><td>Month to Date</td><td>${formatCurrency(sum(mtd))}</td><td>${mtd.length}</td><td>${formatCurrency(sum(mtd))}</td><td>${mtd.length}</td></tr>
        <tr><td>Last 30 Days</td><td>${formatCurrency(sum(last30Days))}</td><td>${last30Days.length}</td><td>${formatCurrency(sum(last30Days))}</td><td>${last30Days.length}</td></tr>
      `;
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="inline-error">Failed to load KPIs: ${err.message}</td></tr>`;
    }
  }
  document.getElementById('cardInventorySummary').addEventListener('click', () => document.getElementById('cardDashboard').click());
  document.getElementById('cardProductionSummary').addEventListener('click', async () => {
    openModal('Production Summary');
    try {
      const records = await apiGet('/production');
      const byStatus = {};
      records.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Status</th><th>Count</th></tr></thead>
          <tbody>${Object.keys(byStatus).map(s => `<tr><td><span class="badge ${statusBadgeClass(s)}">${s}</span></td><td>${byStatus[s]}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted">No production records.</td></tr>'}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load production summary: ${err.message}`); }
  });

  /* ---------------------------------------------------------------------
   * 14. SLIDE 13 — SMART TRACKING
   * ------------------------------------------------------------------- */
  document.getElementById('cardGrowOrders').addEventListener('click', async () => {
    openModal('Grow Orders');
    try {
      const orders = await apiGet('/orders');
      const sales = orders.filter(o => o.type === 'Sales').sort((a, b) => b.amount - a.amount);
      modalBody.innerHTML = `
        <p class="tip mb-16">Top sales orders by value — your biggest growth opportunities.</p>
        <table>
          <thead><tr><th>Transaction</th><th>Amount</th></tr></thead>
          <tbody>${sales.length ? sales.slice(0, 10).map(o => `<tr><td>${o.transactionName}</td><td>₹${Number(o.amount).toLocaleString('en-IN')}</td></tr>`).join('') : '<tr><td colspan="2" class="text-muted">No sales orders yet.</td></tr>'}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load orders: ${err.message}`); }
  });
  document.getElementById('cardLateDeliveries').addEventListener('click', async () => {
    openModal('Avoid Late Deliveries');
    try {
      const orders = await apiGet('/orders');
      const risky = orders.filter(o => o.goodsStatus !== 'Dispatched');
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Transaction</th><th>Invoice</th><th>Goods Status</th></tr></thead>
          <tbody>${risky.length ? risky.map(o => `<tr><td>${o.transactionName}</td><td><span class="badge ${statusBadgeClass(o.invoiceStatus)}">${o.invoiceStatus}</span></td><td><span class="badge ${statusBadgeClass(o.goodsStatus)}">${o.goodsStatus}</span></td></tr>`).join('') : '<tr><td colspan="3" class="text-muted">All orders are fully dispatched.</td></tr>'}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load orders: ${err.message}`); }
  });
  document.getElementById('cardDeadStock').addEventListener('click', async () => {
    openModal('Reduce Dead Stock');
    try {
      const products = await apiGet('/products');
      const dead = products.filter(p => p.currentStock > (p.minimumStock * 5));
      modalBody.innerHTML = `
        <p class="tip mb-16">Products holding more than 5× their minimum stock — likely candidates for dead stock review.</p>
        <table>
          <thead><tr><th>Product</th><th>Current Stock</th><th>Minimum Stock</th></tr></thead>
          <tbody>${dead.length ? dead.map(p => `<tr><td>${p.itemName}</td><td>${p.currentStock}</td><td>${p.minimumStock}</td></tr>`).join('') : '<tr><td colspan="3" class="text-muted">No dead stock detected.</td></tr>'}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load products: ${err.message}`); }
  });
  document.getElementById('cardProdDelays').addEventListener('click', async () => {
    openModal('Track Production Delays');
    try {
      const records = await apiGet('/production');
      const delayed = records.filter(r => ['WIP', 'PENDING'].includes(r.status));
      modalBody.innerHTML = `
        <table>
          <thead><tr><th>Product</th><th>Target</th><th>Completed</th><th>Status</th></tr></thead>
          <tbody>${delayed.length ? delayed.map(r => `<tr><td>${r.productName}</td><td>${r.targetQuantity}</td><td>${r.completedQuantity || 0}</td><td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td></tr>`).join('') : '<tr><td colspan="4" class="text-muted">No delayed production records.</td></tr>'}</tbody>
        </table>
      `;
    } catch (err) { modalError(`Failed to load production: ${err.message}`); }
  });

  /* ---------------------------------------------------------------------
   * 15. SLIDE 14 — ROI CALCULATOR
   * ------------------------------------------------------------------- */
  document.getElementById('tourRoiBtn').addEventListener('click', () => {
    document.getElementById('tourRoiPanel').style.display = 'block';
  });
  document.getElementById('roiCalcBtn').addEventListener('click', () => {
    const operatingCost = Number(document.getElementById('roiOperatingCost').value) || 0;
    const monthlySavings = Number(document.getElementById('roiMonthlySavings').value) || 0;
    const implementationCost = Number(document.getElementById('roiImplementationCost').value) || 0;
    const months = Number(document.getElementById('roiMonths').value) || 1;

    const annualSavings = monthlySavings * 12;
    const totalSavingsOverPeriod = monthlySavings * months;
    const roiPercent = implementationCost > 0 ? ((totalSavingsOverPeriod - implementationCost) / implementationCost) * 100 : 0;
    const paybackMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;

    document.getElementById('roiMonthlyOut').textContent = formatCurrency(monthlySavings);
    document.getElementById('roiAnnualOut').textContent = formatCurrency(annualSavings);
    document.getElementById('roiPercentOut').textContent = `${roiPercent.toFixed(1)}%`;
    document.getElementById('roiPaybackOut').textContent = isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : 'N/A';
    document.getElementById('roiResults').style.display = 'block';
    void operatingCost; // reserved for future what-if comparisons; not used in the core formula
  });

  /* ---------------------------------------------------------------------
   * 16. INITIAL LOAD
   * ------------------------------------------------------------------- */
  async function init() {
    showSlide(1);
    await loadTourStock();       // needed before movements form can list products
    loadTourMovements();
    loadTourProduction();
    loadTourCosting();
    loadTourOrders();
    loadTimelineOrderOptions();
    loadTourReportCounts();
    loadTourKpi();
  }
  init();
})();
