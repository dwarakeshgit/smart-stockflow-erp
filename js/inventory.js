let allProducts = [];

async function loadProducts() {
  try {
    allProducts = await apiGet('/products');
    renderProducts(allProducts);
    renderValuation(allProducts);
    populateMovementProductSelect(allProducts);
    renderLowStockNote(allProducts);
  } catch (err) {
    showToast('Failed to load products: ' + err.message, 'error');
  }
}

function renderProducts(products) {
  const tbody = document.getElementById('productsTable');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No products yet. Click "Add Product" to create one.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.itemName}</td>
      <td>${p.category}</td>
      <td style="color:${p.currentStock < p.minimumStock ? 'var(--danger)' : 'inherit'}">${p.currentStock}</td>
      <td>₹${Number(p.unitPrice).toLocaleString('en-IN')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editProduct('${p._id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderValuation(products) {
  const total = products.reduce((sum, p) => sum + (p.stockValue || p.currentStock * p.unitPrice), 0);
  document.getElementById('valuationAmt').textContent = formatCurrency(total);
}

function renderLowStockNote(products) {
  const low = products.filter(p => p.currentStock < p.minimumStock);
  document.getElementById('lowStockNote').textContent = low.length
    ? `${low.length} item(s) currently below minimum stock`
    : 'All items are sufficiently stocked';
}

function populateMovementProductSelect(products) {
  const select = document.getElementById('movementProductId');
  select.innerHTML = products.map(p => `<option value="${p._id}">${p.itemName}</option>`).join('');
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  renderProducts(allProducts.filter(p => p.itemName.toLowerCase().includes(term)));
});

// --- Product modal ---
const productModal = document.getElementById('productModal');
document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  productModal.classList.add('active');
});
document.getElementById('cancelProductBtn').addEventListener('click', () => productModal.classList.remove('active'));

window.editProduct = function (id) {
  const p = allProducts.find(x => x._id === id);
  if (!p) return;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = p._id;
  document.getElementById('itemName').value = p.itemName;
  document.getElementById('category').value = p.category;
  document.getElementById('supplier').value = p.supplier;
  document.getElementById('currentStock').value = p.currentStock;
  document.getElementById('unitPrice').value = p.unitPrice;
  document.getElementById('minimumStock').value = p.minimumStock;
  productModal.classList.add('active');
};

window.deleteProduct = async function (id) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiDelete(`/products/${id}`);
    showToast('Product deleted');
    loadProducts();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
};

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    itemName: document.getElementById('itemName').value,
    category: document.getElementById('category').value,
    supplier: document.getElementById('supplier').value,
    currentStock: Number(document.getElementById('currentStock').value),
    unitPrice: Number(document.getElementById('unitPrice').value),
    minimumStock: Number(document.getElementById('minimumStock').value)
  };
  try {
    if (id) {
      await apiPut(`/products/${id}`, payload);
      showToast('Product updated');
    } else {
      await apiPost('/products', payload);
      showToast('Product added');
    }
    productModal.classList.remove('active');
    loadProducts();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
});

// --- Movement modal ---
const movementModal = document.getElementById('movementModal');
document.getElementById('addMovementBtn').addEventListener('click', () => {
  document.getElementById('movementForm').reset();
  movementModal.classList.add('active');
});
document.getElementById('cancelMovementBtn').addEventListener('click', () => movementModal.classList.remove('active'));

document.getElementById('movementForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    productId: document.getElementById('movementProductId').value,
    changedVia: document.getElementById('changedVia').value,
    changeQuantity: Number(document.getElementById('changeQuantity').value),
    changedBy: document.getElementById('changedBy').value
  };
  try {
    await apiPost('/stock-movements', payload);
    showToast('Stock movement logged');
    movementModal.classList.remove('active');
    loadProducts();
    loadMovements();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
});

async function loadMovements() {
  try {
    const movements = await apiGet('/stock-movements');
    const tbody = document.getElementById('movementsTable');
    if (!movements.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No movements yet.</td></tr>';
      return;
    }
    tbody.innerHTML = movements.map(m => `
      <tr>
        <td>${formatDate(m.date)}</td>
        <td>${m.productId ? m.productId.itemName : 'N/A'}</td>
        <td>${m.changedVia}</td>
        <td style="color:${m.changeQuantity >= 0 ? 'var(--success)' : 'var(--danger)'}">${m.changeQuantity >= 0 ? '+' : ''}${m.changeQuantity.toFixed(2)}</td>
        <td>${m.changedBy}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load movements: ' + err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadMovements();
});
