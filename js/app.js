// Mini Daraz Main Application Coordinator & Event Router

const App = {
    currentHeroSlide: 0,
    heroTimer: null,

    async init() {
        console.log('🚀 Launching Mini Daraz Marketplace...');
        
        // 1. Initialize State & Data
        await store.init();

        // 2. Render Initial UI
        UI.renderCategories();
        UI.updateCounters();
        UI.startFlashSaleCountdown();
        App.renderHomeProductSections();
        App.initHeroSlider();
        App.bindEvents();

        // 3. Initialize Seller/Admin subsystem
        Seller.init();

        console.log('🌟 Mini Daraz ready for Pakistani shoppers and sellers!');
    },

    // Render Home Product Sections
    renderHomeProductSections() {
        const flashProds = store.getFlashSaleProducts();
        const trendProds = store.getTrendingProducts();
        const bestDeals = store.products.filter(p => p.price < 10000 || p.discount >= 20);
        const filteredProds = store.getFilteredProducts();

        UI.renderGrid('flash-sale-grid', flashProds);
        UI.renderGrid('trending-grid', trendProds);
        UI.renderGrid('deals-grid', bestDeals);
        UI.renderGrid('all-products-grid', filteredProds);
        UI.renderGrid('recommended-grid', store.getRecommendedProducts());
    },

    // Hero Banner Carousel
    initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        if (!slides || slides.length === 0) return;

        App.showSlide(0);

        if (App.heroTimer) clearInterval(App.heroTimer);
        App.heroTimer = setInterval(() => {
            App.nextSlide();
        }, 5000);
    },

    showSlide(index) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        if (!slides.length) return;

        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        App.currentHeroSlide = index;

        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    },

    nextSlide() {
        App.showSlide(App.currentHeroSlide + 1);
    },

    prevSlide() {
        App.showSlide(App.currentHeroSlide - 1);
    },

    // Bind Event Listeners
    bindEvents() {
        // Store updates subscribers
        store.subscribe('products_loaded', () => {
            App.renderHomeProductSections();
            Seller.renderStats();
            Seller.renderInventoryTable();
        });

        store.subscribe('cart_updated', () => {
            UI.updateCounters();
            UI.renderCartDrawer();
        });

        store.subscribe('wishlist_updated', () => {
            UI.updateCounters();
        });

        store.subscribe('orders_updated', () => {
            App.renderMyOrdersView();
            Seller.renderStats();
            Seller.renderOrdersTable();
        });

        store.subscribe('city_changed', () => {
            UI.updateCounters();
            UI.renderCartDrawer();
        });

        store.subscribe('filter_changed', (filtered) => {
            UI.renderGrid('all-products-grid', filtered);
            const countEl = document.getElementById('search-results-count');
            if (countEl) countEl.innerText = `${filtered.length} products found`;
        });

        // Search Input Handling
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                store.setFilter('searchQuery', query);
                App.handleSearchSuggestions(query);
            });

            searchInput.addEventListener('focus', (e) => {
                if (e.target.value.trim().length > 1) {
                    App.handleSearchSuggestions(e.target.value);
                }
            });
        }

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            const popup = document.getElementById('search-suggestions-box');
            const searchWrap = document.querySelector('.search-bar-wrap');
            if (popup && searchWrap && !searchWrap.contains(e.target)) {
                popup.style.display = 'none';
            }
        });

        // Sort By Select
        const sortSelect = document.getElementById('sort-products-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                store.setFilter('sortBy', e.target.value);
            });
        }

        // Price Filter Apply
        const minPriceInput = document.getElementById('filter-min-price');
        const maxPriceInput = document.getElementById('filter-max-price');
        const applyPriceBtn = document.getElementById('btn-apply-price');
        if (applyPriceBtn && minPriceInput && maxPriceInput) {
            applyPriceBtn.addEventListener('click', () => {
                const min = parseFloat(minPriceInput.value) || 0;
                const max = parseFloat(maxPriceInput.value) || 500000;
                store.setFilter('minPrice', min);
                store.setFilter('maxPrice', max);
                UI.showToast(`Showing items between Rs. ${min.toLocaleString()} and Rs. ${max.toLocaleString()}`, 'info');
            });
        }
    },

    // Search Suggestions Auto-complete
    handleSearchSuggestions(query) {
        const popup = document.getElementById('search-suggestions-box');
        if (!popup) return;

        if (!query || query.trim().length < 2) {
            popup.style.display = 'none';
            return;
        }

        const q = query.toLowerCase();
        const matches = store.products.filter(p => 
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q))
        ).slice(0, 5);

        if (matches.length === 0) {
            popup.innerHTML = `
                <div class="suggestion-item text-slate-400">
                    <i class="fa-solid fa-magnifying-glass"></i> No instant matches for "${query}"
                </div>
            `;
        } else {
            popup.innerHTML = matches.map(p => `
                <div class="suggestion-item" onclick="UI.openProductModal('${p.id}'); document.getElementById('search-suggestions-box').style.display='none';">
                    <img src="${p.imageUrl}" alt="${p.title}" class="suggestion-thumb">
                    <div class="suggestion-meta">
                        <span class="suggestion-title">${p.title}</span>
                        <span class="suggestion-price">${UI.formatPKR(p.price)}</span>
                    </div>
                </div>
            `).join('');
        }

        popup.style.display = 'block';
    },

    // Switch Main Application Views (Home, Browse, Orders, Wishlist, Admin/Seller)
    switchView(viewName) {
        const homeView = document.getElementById('view-home');
        const browseView = document.getElementById('view-browse');
        const ordersView = document.getElementById('view-orders');
        const sellerView = document.getElementById('view-seller');

        // Scroll top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update nav buttons
        document.querySelectorAll('.nav-link-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        if (homeView) homeView.style.display = viewName === 'home' ? 'block' : 'none';
        if (browseView) browseView.style.display = viewName === 'browse' ? 'block' : 'none';
        if (ordersView) ordersView.style.display = viewName === 'orders' ? 'block' : 'none';
        if (sellerView) sellerView.style.display = viewName === 'seller' ? 'block' : 'none';

        if (viewName === 'orders') {
            App.renderMyOrdersView();
        } else if (viewName === 'seller') {
            Seller.renderStats();
            Seller.renderInventoryTable();
            Seller.renderOrdersTable();
        } else if (viewName === 'browse') {
            UI.renderGrid('all-products-grid', store.getFilteredProducts());
        }
    },

    // Render "My Orders" Customer Screen
    renderMyOrdersView() {
        const container = document.getElementById('customer-orders-list');
        if (!container) return;

        if (store.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-box-open empty-icon"></i>
                    <h3>No Orders Yet</h3>
                    <p class="empty-text">You haven’t placed any orders on Mini Daraz yet. Start exploring thousands of authentic items!</p>
                    <button class="btn-primary" onclick="App.switchView('home');">Shop Now</button>
                </div>
            `;
            return;
        }

        container.innerHTML = store.orders.map(order => `
            <div class="customer-order-card">
                <div class="order-card-header">
                    <div class="order-id-date">
                        <span class="order-number-title">Order ID: <strong>${order.orderNumber}</strong></span>
                        <span class="order-date-label">Placed on: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="order-status-badge status-${(order.orderStatus || 'processing').toLowerCase()}">
                        <i class="fa-solid fa-truck"></i> ${order.orderStatus || 'Processing'}
                    </div>
                </div>

                <div class="order-courier-banner">
                    <span><i class="fa-solid fa-barcode"></i> Courier: <strong>${order.courier || 'TCS Express'}</strong></span>
                    <span>• Tracking ID: <strong>${order.trackingNumber || 'PK-TCS-00000'}</strong></span>
                    <span>• Destination: <strong>${order.city}, ${order.province || 'Pakistan'}</strong></span>
                </div>

                <div class="order-items-scroll">
                    ${order.items.map(item => `
                        <div class="order-item-chip">
                            <img src="${item.imageUrl}" alt="${item.title}" class="order-item-thumb">
                            <div class="order-item-desc">
                                <strong>${item.title}</strong>
                                <small>Qty: ${item.quantity} ${item.selectedColor ? `• ${item.selectedColor}` : ''}</small>
                                <span class="order-item-price">${UI.formatPKR(item.price)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-card-footer">
                    <div class="order-total-sum">
                        <span>Total: <strong class="text-orange-600">${UI.formatPKR(order.totalAmount)}</strong> (${order.paymentMethod.toUpperCase()})</span>
                    </div>
                    <div class="order-actions-right">
                        <button class="btn-secondary-sm" onclick="UI.openOrderDetailsModal('${order.orderNumber}')">
                            <i class="fa-solid fa-file-invoice"></i> View Invoice
                        </button>
                        <button class="btn-primary-sm" onclick="App.switchView('home'); UI.showToast('Select products to buy again', 'info');">
                            Buy Again
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// UI helper to open Order details modal
UI.openOrderDetailsModal = function(orderNumber) {
    const order = store.orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber);
    if (order) {
        Checkout.showOrderConfirmation(order);
    }
};

UI.openOrdersView = function() {
    App.switchView('orders');
};

// Bootstrap application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
