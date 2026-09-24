/**
 * MINI DARAZ - Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', async () => {
    let products = [];
    let orders = [];
    let activeTab = 'dashboard';
    let editingProductId = null;

    await initAdmin();

    async function initAdmin() {
        console.log("⚡ Initializing Mini Daraz Admin Panel...");
        
        // Load data from Supabase / LocalStorage
        products = await DatabaseService.getProducts();
        orders = await DatabaseService.getOrders();

        updateDashboardStats();
        renderProductsTable();
        renderOrdersTable();
        setupAdminEventListeners();
    }

    // ----------------------------------------------------
    // DASHBOARD STATS
    // ----------------------------------------------------
    function updateDashboardStats() {
        const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.final_amount || 0), 0);
        const totalOrdersCount = orders.length;
        const totalProductsCount = products.length;
        const uniqueCustomers = new Set(orders.map(o => o.customer_email || o.customer_phone)).size;

        document.getElementById('stat-total-sales').textContent = `Rs. ${totalSales.toLocaleString()}`;
        document.getElementById('stat-total-orders').textContent = totalOrdersCount;
        document.getElementById('stat-total-products').textContent = totalProductsCount;
        document.getElementById('stat-total-customers').textContent = uniqueCustomers || totalOrdersCount;
    }

    // ----------------------------------------------------
    // PRODUCTS MANAGEMENT
    // ----------------------------------------------------
    function renderProductsTable() {
        const tbody = document.getElementById('admin-products-tbody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 30px;">No products found in database.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>
                    <img src="${p.image_url}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #eee;" />
                </td>
                <td>
                    <strong style="color: #2d3748;">${p.title}</strong>
                    <div style="font-size: 11px; color: #718096;">ID: ${p.id}</div>
                </td>
                <td><span style="background: #edf2f7; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${p.category}</span></td>
                <td>
                    <strong style="color: #f57224;">Rs. ${parseFloat(p.price).toLocaleString()}</strong>
                    ${p.original_price ? `<div style="font-size: 11px; text-decoration: line-through; color: #a0aec0;">Rs. ${parseFloat(p.original_price).toLocaleString()}</div>` : ''}
                </td>
                <td>
                    <span style="font-weight: 700; color: ${p.stock < 5 ? '#e53e3e' : '#38a169'};">${p.stock} units</span>
                </td>
                <td>
                    ${p.is_flash_sale ? `<span class="status-badge pending">Flash Sale</span>` : ''}
                    ${p.is_featured ? `<span class="status-badge processing">Featured</span>` : ''}
                    ${!p.is_flash_sale && !p.is_featured ? `<span style="color:#a0aec0; font-size:12px;">Standard</span>` : ''}
                </td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn-action-icon edit-prod-btn" data-id="${p.id}" title="Edit Product"><i class="lucide-edit-3"></i></button>
                        <button class="btn-action-icon delete delete-prod-btn" data-id="${p.id}" title="Delete Product"><i class="lucide-trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Attach event listeners
        tbody.querySelectorAll('.edit-prod-btn').forEach(b => {
            b.addEventListener('click', () => openEditProductModal(b.dataset.id));
        });
        tbody.querySelectorAll('.delete-prod-btn').forEach(b => {
            b.addEventListener('click', () => handleDeleteProduct(b.dataset.id));
        });
    }

    // Add / Edit Product Modal
    function openAddProductModal() {
        editingProductId = null;
        document.getElementById('product-modal-title').textContent = 'Add New Product';
        document.getElementById('admin-product-form').reset();
        document.getElementById('product-modal-overlay').classList.add('open');
    }

    function openEditProductModal(productId) {
        const prod = products.find(p => p.id === productId);
        if (!prod) return;

        editingProductId = productId;
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        
        document.getElementById('prod-title').value = prod.title;
        document.getElementById('prod-category').value = prod.category;
        document.getElementById('prod-price').value = prod.price;
        document.getElementById('prod-orig-price').value = prod.original_price || '';
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-image').value = prod.image_url;
        document.getElementById('prod-desc').value = prod.description || '';
        document.getElementById('prod-flash').checked = !!prod.is_flash_sale;
        document.getElementById('prod-featured').checked = !!prod.is_featured;

        document.getElementById('product-modal-overlay').classList.add('open');
    }

    async function handleProductFormSubmit(e) {
        e.preventDefault();
        
        const payload = {
            title: document.getElementById('prod-title').value.trim(),
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            original_price: parseFloat(document.getElementById('prod-orig-price').value || document.getElementById('prod-price').value * 1.3),
            stock: parseInt(document.getElementById('prod-stock').value),
            image_url: document.getElementById('prod-image').value.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            description: document.getElementById('prod-desc').value.trim(),
            is_flash_sale: document.getElementById('prod-flash').checked,
            is_featured: document.getElementById('prod-featured').checked
        };

        if (editingProductId) {
            await DatabaseService.updateProduct(editingProductId, payload);
        } else {
            await DatabaseService.addProduct(payload);
        }

        // Refresh Data
        products = await DatabaseService.getProducts();
        renderProductsTable();
        updateDashboardStats();

        document.getElementById('product-modal-overlay').classList.remove('open');
        alert(editingProductId ? "Product updated successfully!" : "Product added successfully!");
    }

    async function handleDeleteProduct(productId) {
        if (confirm("Are you sure you want to delete this product?")) {
            await DatabaseService.deleteProduct(productId);
            products = await DatabaseService.getProducts();
            renderProductsTable();
            updateDashboardStats();
        }
    }

    // ----------------------------------------------------
    // ORDERS MANAGEMENT
    // ----------------------------------------------------
    function renderOrdersTable() {
        const tbody = document.getElementById('admin-orders-tbody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 30px;">No orders received yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const itemCount = Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity||1), 0) : 1;

            return `
                <tr>
                    <td><strong style="color: #f57224;">${o.order_number}</strong></td>
                    <td>
                        <strong>${o.customer_name}</strong>
                        <div style="font-size: 11px; color: #718096;">📞 ${o.customer_phone}</div>
                        <div style="font-size: 11px; color: #a0aec0;">📍 ${o.city}</div>
                    </td>
                    <td><span style="font-weight: 600;">${itemCount} items</span></td>
                    <td><strong style="color: #2d3748;">Rs. ${parseFloat(o.final_amount).toLocaleString()}</strong></td>
                    <td>
                        <select class="order-status-select" data-id="${o.id || o.order_number}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; border: 1px solid #cbd5e0;">
                            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td style="font-size: 12px; color: #718096;">${dateStr}</td>
                    <td>
                        <button class="btn-action-icon view-order-btn" data-id="${o.id || o.order_number}" title="View Order Receipt"><i class="lucide-eye"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        // Status change listener
        tbody.querySelectorAll('.order-status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                const orderId = e.target.dataset.id;
                await DatabaseService.updateOrderStatus(orderId, newStatus);
                orders = await DatabaseService.getOrders();
                updateDashboardStats();
            });
        });

        // View Order Details
        tbody.querySelectorAll('.view-order-btn').forEach(b => {
            b.addEventListener('click', () => openOrderDetailModal(b.dataset.id));
        });
    }

    function openOrderDetailModal(orderId) {
        const order = orders.find(o => o.id === orderId || o.order_number === orderId);
        if (!order) return;

        const modal = document.getElementById('order-detail-modal');
        const container = document.getElementById('order-detail-container');
        if (!modal || !container) return;

        const itemsHtml = (order.items || []).map(i => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <img src="${i.image_url}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" />
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 700;">${i.title}</div>
                    <div style="font-size: 12px; color: #718096;">Qty: ${i.quantity} x Rs. ${i.price.toLocaleString()}</div>
                </div>
                <strong style="color: #f57224;">Rs. ${(i.price * i.quantity).toLocaleString()}</strong>
            </div>
        `).join('');

        container.innerHTML = `
            <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px; border-bottom: 2px solid #f57224; padding-bottom: 8px;">Order Receipt (${order.order_number})</h3>
            <div style="background: #f7fafc; padding: 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
                <div><strong>Customer:</strong> ${order.customer_name} (${order.customer_email || 'N/A'})</div>
                <div><strong>Phone:</strong> ${order.customer_phone}</div>
                <div><strong>Address:</strong> ${order.shipping_address}, ${order.city}</div>
                <div><strong>Payment:</strong> ${order.payment_method}</div>
                <div><strong>Status:</strong> <span class="status-badge pending">${order.status}</span></div>
            </div>

            <h4 style="font-size: 14px; margin-bottom: 10px;">Ordered Items</h4>
            ${itemsHtml}

            <div style="text-align: right; margin-top: 16px; font-size: 16px; font-weight: 800; border-top: 2px dashed #e2e8f0; padding-top: 10px;">
                Total Amount: <span style="color: #f57224;">Rs. ${parseFloat(order.final_amount).toLocaleString()}</span>
            </div>
        `;

        modal.classList.add('open');
    }

    // ----------------------------------------------------
    // NAVIGATION & EVENT LISTENERS
    // ----------------------------------------------------
    function setupAdminEventListeners() {
        // Sidebar Tab Switching
        document.querySelectorAll('.menu-link[data-tab]').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const tab = link.dataset.tab;
                activeTab = tab;

                document.getElementById('sec-dashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
                document.getElementById('sec-products').style.display = tab === 'products' ? 'block' : 'none';
                document.getElementById('sec-orders').style.display = tab === 'orders' ? 'block' : 'none';
            });
        });

        // Add Product Button
        document.getElementById('btn-add-product')?.addEventListener('click', openAddProductModal);

        // Product Form Submit
        document.getElementById('admin-product-form')?.addEventListener('submit', handleProductFormSubmit);

        // Modals Close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.remove('open');
            });
        });
    }
});
