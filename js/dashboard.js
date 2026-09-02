async function loadDashboard() {
  try {
    const summary = await apiGet('/dashboard/summary');
    const grid = document.getElementById('summaryGrid');
    grid.innerHTML = `
      <div class="summary-card"><div class="label">Total Products</div><div class="value">${summary.totalProducts}</div></div>
      <div class="summary-card alert"><div class="label">Low Stock Items</div><div class="value">${summary.lowStockItems}</div></div>
      <div class="summary-card"><div class="label">Total Stock Value</div><div class="value">${formatCurrency(summary.totalStockValue)}</div></div>
      <div class="summary-card warn"><div class="label">Pending Orders</div><div class="value">${summary.pendingOrders}</div></div>
      <div class="summary-card ok"><div class="label">Production In Progress</div><div class="value">${summary.productionInProgress}</div></div>
      <div class="summary-card"><div class="label">Total Orders</div><div class="value">${summary.totalOrders}</div></div>
    `;

    const alertsBox = document.getElementById('alertsBox');
    if (summary.lowStockItems > 0) {
      alertsBox.innerHTML = `<p style="color:var(--danger);">⚠️ ${summary.lowStockItems} item(s) are below minimum stock level. <a href="inventory.html">View Inventory →</a></p>`;
    } else {
      alertsBox.innerHTML = `<p style="color:var(--success);">✅ All stock levels are healthy.</p>`;
    }
  } catch (err) {
    showToast('Failed to load dashboard summary: ' + err.message, 'error');
  }

  try {
    const movements = await apiGet('/stock-movements');
    const tbody = document.querySelector('#recentMovementsTable tbody');
    if (!movements.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No stock movements yet.</td></tr>';
      return;
    }
    tbody.innerHTML = movements.slice(0, 6).map(m => `
      <tr>
        <td>${formatDate(m.date)}</td>
        <td>${m.productId ? m.productId.itemName : 'N/A'}</td>
        <td>${m.changedVia}</td>
        <td style="color:${m.changeQuantity >= 0 ? 'var(--success)' : 'var(--danger)'}">${m.changeQuantity >= 0 ? '+' : ''}${m.changeQuantity}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load recent movements: ' + err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
