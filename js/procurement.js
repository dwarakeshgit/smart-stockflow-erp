async function loadPurchaseOrders() {
  try {
    const orders = await apiGet('/orders');
    const purchases = orders.filter(o => o.type === 'Purchase');
    const tbody = document.getElementById('purchaseTable');
    if (!purchases.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No purchase orders yet.</td></tr>';
      return;
    }
    tbody.innerHTML = purchases.map(o => `
      <tr>
        <td>${o.transactionName}</td>
        <td>${o.supplier || '-'}</td>
        <td><span class="badge ${statusBadgeClass(o.invoiceStatus)}">${o.invoiceStatus}</span></td>
        <td><span class="badge ${statusBadgeClass(o.goodsStatus)}">${o.goodsStatus}</span></td>
        <td>₹${Number(o.amount).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load purchase orders: ' + err.message, 'error');
  }
}
document.addEventListener('DOMContentLoaded', loadPurchaseOrders);
