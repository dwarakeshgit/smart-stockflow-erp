async function loadTrackingSnapshot() {
  try {
    const [orders, production, products] = await Promise.all([
      apiGet('/orders'), apiGet('/production'), apiGet('/products')
    ]);

    const notDispatched = orders.filter(o => o.goodsStatus !== 'Dispatched').length;
    const delayedProduction = production.filter(p => p.status === 'PENDING' || p.status === 'WIP').length;
    const deadStock = products.filter(p => p.currentStock > (p.minimumStock * 5)).length;
    const totalOrders = orders.length;

    document.getElementById('trackingSnapshot').innerHTML = `
      <div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
        <div class="summary-card"><div class="label">Total Orders</div><div class="value">${totalOrders}</div></div>
        <div class="summary-card warn"><div class="label">Orders Not Fully Dispatched</div><div class="value">${notDispatched}</div></div>
        <div class="summary-card alert"><div class="label">Production Possibly Delayed</div><div class="value">${delayedProduction}</div></div>
        <div class="summary-card"><div class="label">Potential Dead Stock Items</div><div class="value">${deadStock}</div></div>
      </div>
    `;
  } catch (err) {
    showToast('Failed to load tracking snapshot: ' + err.message, 'error');
  }
}
document.addEventListener('DOMContentLoaded', loadTrackingSnapshot);
