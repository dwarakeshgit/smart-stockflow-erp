let allProduction = [];

async function loadProduction() {
  try {
    allProduction = await apiGet('/production');
    renderProduction(allProduction);
  } catch (err) {
    showToast('Failed to load production records: ' + err.message, 'error');
  }
}

function renderProduction(records) {
  const tbody = document.getElementById('productionTable');
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted">No production records yet.</td></tr>';
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td>${r.productionId}</td>
      <td>${r.productName}</td>
      <td>${r.targetQuantity}</td>
      <td>${r.completedQuantity || '-'}</td>
      <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
      <td>₹${Number(r.totalCost).toLocaleString('en-IN')}</td>
      <td>
        <select onchange="quickStatusChange('${r._id}', this.value)" class="search-input" style="width:auto;">
          <option value="">Change status…</option>
          <option>PLANNED</option><option>PENDING</option><option>WIP</option><option>IN-TESTING</option><option>COMPLETED</option>
        </select>
      </td>
    </tr>
  `).join('');
}

window.quickStatusChange = async function (id, status) {
  if (!status) return;
  try {
    await apiPut(`/production/${id}`, { status });
    showToast('Status updated');
    loadProduction();
  } catch (err) {
    showToast('Update failed: ' + err.message, 'error');
  }
};

const productionModal = document.getElementById('productionModal');
document.getElementById('addProductionBtn').addEventListener('click', () => {
  document.getElementById('productionForm').reset();
  productionModal.classList.add('active');
});
document.getElementById('cancelProductionBtn').addEventListener('click', () => productionModal.classList.remove('active'));

document.getElementById('productionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    productionId: document.getElementById('productionId').value,
    productName: document.getElementById('productName').value,
    targetQuantity: Number(document.getElementById('targetQuantity').value),
    completedQuantity: Number(document.getElementById('completedQuantity').value),
    status: document.getElementById('status').value,
    totalCost: Number(document.getElementById('totalCost').value)
  };
  try {
    await apiPost('/production', payload);
    showToast('Production record created');
    productionModal.classList.remove('active');
    loadProduction();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', loadProduction);
