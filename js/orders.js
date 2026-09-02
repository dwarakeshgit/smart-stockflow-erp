let allOrders = [];

async function loadOrders() {
  try {
    allOrders = await apiGet('/orders');
    renderOrders(allOrders);
  } catch (err) {
    showToast('Failed to load orders: ' + err.message, 'error');
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.transactionName}</td>
      <td>${o.type}</td>
      <td>
        <select onchange="updateOrderField('${o._id}','invoiceStatus',this.value)">
          <option ${o.invoiceStatus === 'Invoice Pending' ? 'selected' : ''}>Invoice Pending</option>
          <option ${o.invoiceStatus === 'Invoice Created' ? 'selected' : ''}>Invoice Created</option>
        </select>
      </td>
      <td>
        <select onchange="updateOrderField('${o._id}','goodsStatus',this.value)">
          <option ${o.goodsStatus === 'Not Dispatched' ? 'selected' : ''}>Not Dispatched</option>
          <option ${o.goodsStatus === 'Partially Dispatched' ? 'selected' : ''}>Partially Dispatched</option>
          <option ${o.goodsStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
        </select>
      </td>
      <td>₹${Number(o.amount).toLocaleString('en-IN')}</td>
      <td><button class="btn btn-outline btn-sm" onclick="viewTimeline('${o._id}','${o.transactionName.replace(/'/g, "")}')">View</button></td>
    </tr>
  `).join('');
}

window.updateOrderField = async function (id, field, value) {
  try {
    await apiPut(`/orders/${id}`, { [field]: value });
    showToast('Order updated');
    loadOrders();
  } catch (err) {
    showToast('Update failed: ' + err.message, 'error');
  }
};

window.viewTimeline = async function (orderId, title) {
  const card = document.getElementById('timelineCard');
  const body = document.getElementById('timelineBody');
  document.getElementById('timelineTitle').textContent = `Order Timeline — ${title}`;
  card.style.display = 'block';
  body.innerHTML = '<p class="text-muted">Loading…</p>';
  try {
    const timeline = await apiGet(`/orders/${orderId}/timeline`);
    if (!timeline.length) {
      body.innerHTML = '<p class="text-muted">No timeline entries recorded for this order yet (only sample data comes pre-seeded for the Butterfly Valve order).</p>';
      return;
    }
    body.innerHTML = `
      <div class="timeline-track" style="flex-wrap:wrap;">
        ${timeline.map(t => `
          <div class="tstep">
            <div class="tdot" style="background:${t.status === 'Completed' ? 'var(--success)' : 'var(--grey-mid)'}; color:${t.status === 'Completed' ? 'white' : 'var(--text-muted)'}">
              ${t.status === 'Completed' ? '✓' : '•'}
            </div>
            ${t.stage}<br>${new Date(t.date).toLocaleDateString('en-IN')}
          </div>
          <div class="tline"></div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<p style="color:var(--danger);">Failed to load timeline: ${err.message}</p>`;
  }
};

const orderModal = document.getElementById('orderModal');
document.getElementById('addOrderBtn').addEventListener('click', () => {
  document.getElementById('orderForm').reset();
  orderModal.classList.add('active');
});
document.getElementById('cancelOrderBtn').addEventListener('click', () => orderModal.classList.remove('active'));

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    transactionName: document.getElementById('transactionName').value,
    type: document.getElementById('type').value,
    amount: Number(document.getElementById('amount').value),
    customer: document.getElementById('customer').value,
    supplier: document.getElementById('supplier').value,
    invoiceStatus: document.getElementById('invoiceStatus').value,
    goodsStatus: document.getElementById('goodsStatus').value
  };
  try {
    await apiPost('/orders', payload);
    showToast('Order created');
    orderModal.classList.remove('active');
    loadOrders();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', loadOrders);
