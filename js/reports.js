async function loadReports() {
  try {
    const reports = await apiGet('/reports');
    document.getElementById('reportCount').textContent = reports.length;

    const categories = ['Sales', 'Purchase', 'Inventory', 'Production'];
    const counts = {};
    categories.forEach(c => counts[c] = reports.filter(r => r.category === c).length);

    document.getElementById('categoryCards').innerHTML = categories.map(c => `
      <div class="feature-card">
        <h3>${c}</h3>
        <p class="sub">Ex: ${(reports.find(r => r.category === c) || {}).reportName || '-'}</p>
        <div style="font-size:26px;color:var(--success);font-weight:800;">${counts[c]}</div>
      </div>
    `).join('');

    renderReportsTable(reports);

    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      const val = e.target.value;
      renderReportsTable(val ? reports.filter(r => r.category === val) : reports);
    });
  } catch (err) {
    showToast('Failed to load reports: ' + err.message, 'error');
  }
}

function renderReportsTable(reports) {
  const tbody = document.getElementById('reportsTable');
  if (!reports.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-muted">No reports found.</td></tr>';
    return;
  }
  tbody.innerHTML = reports.map(r => `
    <tr><td>${r.reportName}</td><td>${r.category}</td><td>${r.description}</td></tr>
  `).join('');
}

async function loadKpiSummary() {
  try {
    const orders = await apiGet('/orders');
    const sales = orders.filter(o => o.type === 'Sales');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mtd = sales.filter(o => new Date(o.orderDate) >= monthStart);
    const last30Days = sales.filter(o => new Date(o.orderDate) >= last30);

    const sum = arr => arr.reduce((s, o) => s + o.amount, 0);

    document.getElementById('kpiTable').innerHTML = `
      <tr><td>Month to Date</td><td>${formatCurrency(sum(mtd))}</td><td>${mtd.length}</td><td>${formatCurrency(sum(mtd))}</td><td>${mtd.length}</td></tr>
      <tr><td>Last 30 Days</td><td>${formatCurrency(sum(last30Days))}</td><td>${last30Days.length}</td><td>${formatCurrency(sum(last30Days))}</td><td>${last30Days.length}</td></tr>
    `;
  } catch (err) {
    showToast('Failed to compute KPI summary: ' + err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadReports();
  loadKpiSummary();
});
