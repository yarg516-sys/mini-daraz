// Mini Daraz Seller & Admin Management Portal

const Seller = {
    currentEditProductId: null,

    init() {
        Seller.renderStats();
        Seller.renderInventoryTable();
        Seller.renderOrdersTable();
        Seller.populateCategorySelects();
    },

    // Populate Category dropdowns in Add/Edit forms
    populateCategorySelects() {
        const addCat = document.getElementById('seller-product-category');
        const editCat = document.getElementById('edit-product-category');

        const options = store.categories.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join('');

        if (addCat) addCat.innerHTML = options;
        if (editCat) editCat.innerHTML = options;
    },

    // Render Stats Overview
    renderStats() {
        const revEl = document.getElementById('stat-total-revenue');
        const ordersEl = document.getElementById('stat-total-orders');
        const prodEl = document.getElementById('stat-total-products');
        const avgEl = document.getElementById('stat-avg-order');

        const totalRevenue = store.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalOrders = store.orders.length;
        const totalProducts = store.products.length;
        const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        if (revEl) revEl.innerText = UI.formatPKR(totalRevenue);
        if (ordersEl) ordersEl.innerText = totalOrders;
        if (prodEl) prodEl.innerText = totalProducts;
        if (avgEl) avgEl.innerText = UI.formatPKR(avgOrder);
    },

    // Render Inventory Table
    renderInventoryTable(filterQuery = '') {
        const tableBody = document.getElementById('seller-products-tbody');
        if (!tableBody) return;

        let list = [...store.products];
        if (filterQuery.trim()) {
            const q = filterQuery.toLowerCase();
            list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-6 text-slate-500">
                        No products found matching your inventory search.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = list.map((p, idx) => `
            <tr>
                <td class="text-slate-400">#${idx + 1}</td>
                <td>
                    <div class="table-product-cell">
                        <img src="${p.imageUrl}" alt="${p.title}" class="table-thumb" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=100&q=80'">
                        <div class="table-product-title-wrap">
                            <span class="table-p-title" title="${p.title}">${p.title}</span>
                            <span class="table-p-brand">${p.brand || 'Original'} • ${p.category}</span>
                        </div>
                    </div>
                </td>
                <td class="font-semibold text-slate-800">${UI.formatPKR(p.price)}</td>
                <td>
                    <span class="stock-badge ${p.stock < 10 ? 'stock-low' : 'stock-ok'}">
                        ${p.stock} in stock
                    </span>
                </td>
                <td>
                    <div class="stars-inline">
                        <i class="fa-solid fa-star text-amber-400"></i> ${p.rating || 4.8} <small class="text-slate-400">(${p.reviewsCount || 0})</small>
                    </div>
                </td>
                <td>
                    <span class="seller-city-tag">${p.sellerCity || 'Karachi'}</span>
                </td>
                <td>
                    <div class="table-action-btns">
                        <button class="btn-action-edit" onclick="Seller.openEditModal('${p.id}')" title="Edit Product">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn-action-del" onclick="Seller.confirmDelete('${p.id}')" title="Delete Product">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Render Orders Table
    renderOrdersTable() {
        const tableBody = document.getElementById('seller-orders-tbody');
        if (!tableBody) return;

        if (store.orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-6 text-slate-500">
                        No customer orders received yet. Place an order from the store to see it here live!
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = store.orders.map(o => `
            <tr>
                <td>
                    <strong class="order-link" onclick="UI.openOrderDetailsModal('${o.orderNumber}')">${o.orderNumber}</strong>
                    <div class="text-xs text-slate-400">${new Date(o.createdAt || Date.now()).toLocaleDateString('en-PK')}</div>
                </td>
                <td>
                    <div class="customer-info-cell">
                        <strong>${o.customerName}</strong>
                        <small class="text-slate-500">${o.customerPhone}</small>
                        <small class="text-slate-400">${o.city}, ${o.province || 'Pakistan'}</small>
                    </div>
                </td>
                <td>
                    <span class="items-count-badge">${o.items.length} item(s)</span>
                </td>
                <td class="font-bold text-slate-800">${UI.formatPKR(o.totalAmount)}</td>
                <td>
                    <span class="payment-method-tag">${o.paymentMethod.toUpperCase()}</span>
                </td>
                <td>
                    <select class="status-select status-${(o.orderStatus || 'Processing').toLowerCase()}" onchange="Seller.handleStatusChange('${o.orderNumber}', this.value)">
                        <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn-primary-xs" onclick="UI.openOrderDetailsModal('${o.orderNumber}')">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Status change listener
    async handleStatusChange(orderId, newStatus) {
        await store.updateOrderStatus(orderId, newStatus);
        Seller.renderStats();
        UI.showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    },

    // Open Add Product Modal
    openAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        const form = document.getElementById('add-product-form');
        if (form) form.reset();
        if (modal) modal.classList.add('active');
    },

    closeAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) modal.classList.remove('active');
    },

    // Submit Add Product Form
    async handleAddProductSubmit(event) {
        if (event) event.preventDefault();

        const title = document.getElementById('seller-product-title').value.trim();
        const category = document.getElementById('seller-product-category').value;
        const brand = document.getElementById('seller-product-brand').value.trim() || 'Pakistani Merchant';
        const price = parseFloat(document.getElementById('seller-product-price').value);
        const oldPrice = parseFloat(document.getElementById('seller-product-oldprice').value) || null;
        const stock = parseInt(document.getElementById('seller-product-stock').value) || 20;
        const sellerName = document.getElementById('seller-store-name').value.trim() || 'Mini Daraz Store';
        const sellerCity = document.getElementById('seller-store-city').value;
        const imageUrl = document.getElementById('seller-product-image').value.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
        const description = document.getElementById('seller-product-desc').value.trim() || 'High-quality authentic Pakistani product with verified seller warranty.';

        if (!title || !price) {
            UI.showToast('Please provide product title and price.', 'warning');
            return;
        }

        const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

        const newProduct = {
            title,
            category,
            brand,
            price,
            oldPrice,
            discount,
            stock,
            rating: 5.0,
            reviewsCount: 1,
            sellerName,
            sellerCity,
            imageUrl,
            description,
            isFlashSale: false,
            isTrending: true,
            isRecommended: true,
            specifications: {
                'Brand': brand,
                'Origin': `Verified ${sellerCity}, Pakistan`,
                'Warranty': '7 Days Mini Daraz Replacement Guarantee'
            },
            colors: ['Standard Edition']
        };

        const added = await store.addNewProduct(newProduct);
        Seller.closeAddProductModal();
        Seller.renderStats();
        Seller.renderInventoryTable();
        UI.showToast(`Product "${title.substring(0, 24)}..." successfully listed on Mini Daraz!`, 'success');
    },

    // Edit Product Modal
    openEditModal(productId) {
        const product = store.getProductById(productId);
        if (!product) return;

        Seller.currentEditProductId = productId;
        const modal = document.getElementById('edit-product-modal');

        document.getElementById('edit-product-title').value = product.title;
        document.getElementById('edit-product-category').value = product.category;
        document.getElementById('edit-product-brand').value = product.brand || '';
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-oldprice').value = product.oldPrice || '';
        document.getElementById('edit-product-stock').value = product.stock;
        document.getElementById('edit-product-image').value = product.imageUrl;
        document.getElementById('edit-product-desc').value = product.description;

        if (modal) modal.classList.add('active');
    },

    closeEditModal() {
        const modal = document.getElementById('edit-product-modal');
        if (modal) modal.classList.remove('active');
        Seller.currentEditProductId = null;
    },

    async handleEditProductSubmit(event) {
        if (event) event.preventDefault();
        if (!Seller.currentEditProductId) return;

        const title = document.getElementById('edit-product-title').value.trim();
        const category = document.getElementById('edit-product-category').value;
        const brand = document.getElementById('edit-product-brand').value.trim();
        const price = parseFloat(document.getElementById('edit-product-price').value);
        const oldPrice = parseFloat(document.getElementById('edit-product-oldprice').value) || null;
        const stock = parseInt(document.getElementById('edit-product-stock').value) || 0;
        const imageUrl = document.getElementById('edit-product-image').value.trim();
        const description = document.getElementById('edit-product-desc').value.trim();

        const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

        const updates = {
            title,
            category,
            brand,
            price,
            oldPrice,
            discount,
            stock,
            imageUrl,
            description
        };

        await store.updateProduct(Seller.currentEditProductId, updates);
        Seller.closeEditModal();
        Seller.renderInventoryTable();
        UI.showToast('Product updated successfully!', 'success');
    },

    // Confirm and Delete Product
    async confirmDelete(productId) {
        const p = store.getProductById(productId);
        if (!p) return;

        if (confirm(`Are you sure you want to delete "${p.title}" from Mini Daraz inventory?`)) {
            await store.deleteProduct(productId);
            Seller.renderStats();
            Seller.renderInventoryTable();
            UI.showToast('Product deleted from store.', 'info');
        }
    }
};
