/**
 * MINI DARAZ - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Application State
    const state = {
        products: [],
        categories: [],
        cart: JSON.parse(localStorage.getItem('mini_daraz_cart') || '[]'),
        wishlist: JSON.parse(localStorage.getItem('mini_daraz_wishlist') || '[]'),
        user: JSON.parse(localStorage.getItem('mini_daraz_user') || 'null'),
        currentCategory: 'all',
        searchQuery: '',
        sortBy: 'popular',
        appliedPromo: null,
        currentSlide: 0,
        selectedProduct: null
    };

    // Initialize App Data
    await initApp();

    async function initApp() {
        console.log("⚡ Initializing Mini Daraz App...");
        
        // Load Products from Supabase DB or Local Seed
        state.products = await DatabaseService.getProducts();
        state.categories = window.CATEGORIES_DATA || [];

        // Render Initial UI
        renderCategoryNav();
        renderCategoryGrid();
        renderProducts();
        renderFlashSaleProducts();
        updateHeaderCounters();
        initHeroSlider();
        startFlashSaleTimer();
        setupEventListeners();
        checkUserSession();
    }

    // ----------------------------------------------------
    // HEADER & USER STATE
    // ----------------------------------------------------
    function updateHeaderCounters() {
        const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const wishlistCount = state.wishlist.length;

        document.querySelectorAll('.cart-count-badge').forEach(el => el.textContent = cartCount);
        document.querySelectorAll('.wishlist-count-badge').forEach(el => el.textContent = wishlistCount);
    }

    function checkUserSession() {
        const userBtn = document.getElementById('user-menu-btn');
        if (state.user && userBtn) {
            userBtn.innerHTML = `
                <i class="lucide-user-check action-icon"></i>
                <span class="action-label">Hi, ${state.user.name.split(' ')[0]}</span>
            `;
        }
    }

    // ----------------------------------------------------
    // RENDER CATEGORIES
    // ----------------------------------------------------
    function renderCategoryNav() {
        const container = document.getElementById('category-nav-inner');
        if (!container) return;

        container.innerHTML = state.categories.map(cat => `
            <div class="nav-item ${state.currentCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
                <span>${cat.name}</span>
            </div>
        `).join('');

        container.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const catSlug = item.dataset.category;
                state.currentCategory = catSlug;
                renderCategoryNav();
                renderProducts();
            });
        });
    }

    function renderCategoryGrid() {
        const container = document.getElementById('category-grid-container');
        if (!container) return;

        container.innerHTML = state.categories.filter(c => c.slug !== 'all').map(cat => `
            <div class="cat-card" data-category="${cat.slug}">
                <div class="cat-icon-wrap">
                    <i class="lucide-${cat.icon}"></i>
                </div>
                <div class="cat-name">${cat.name}</div>
            </div>
        `).join('');

        container.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                state.currentCategory = card.dataset.category;
                renderCategoryNav();
                renderProducts();
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ----------------------------------------------------
    // HERO SLIDER
    // ----------------------------------------------------
    function initHeroSlider() {
        const slides = document.querySelectorAll('.slide-item');
        const dotsContainer = document.getElementById('slider-dots');
        if (!slides.length || !dotsContainer) return;

        dotsContainer.innerHTML = Array.from(slides).map((_, idx) => `
            <div class="dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}"></div>
        `).join('');

        function goToSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            state.currentSlide = index;
        }

        dotsContainer.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
        });

        // Auto slide every 5 seconds
        setInterval(() => {
            let nextIndex = (state.currentSlide + 1) % slides.length;
            goToSlide(nextIndex);
        }, 5000);
    }

    // ----------------------------------------------------
    // FLASH SALE TIMER
    // ----------------------------------------------------
    function startFlashSaleTimer() {
        let hours = 2, minutes = 45, seconds = 30;

        setInterval(() => {
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) hours = 12;
                }
            }

            const hStr = String(hours).padStart(2, '0');
            const mStr = String(minutes).padStart(2, '0');
            const sStr = String(seconds).padStart(2, '0');

            const hEl = document.getElementById('timer-hours');
            const mEl = document.getElementById('timer-mins');
            const sEl = document.getElementById('timer-secs');

            if (hEl) hEl.textContent = hStr;
            if (mEl) mEl.textContent = mStr;
            if (sEl) sEl.textContent = sStr;
        }, 1000);
    }

    function renderFlashSaleProducts() {
        const container = document.getElementById('flash-sale-grid');
        if (!container) return;

        const flashProducts = state.products.filter(p => p.is_flash_sale).slice(0, 6);
        container.innerHTML = flashProducts.map(product => createProductCardHtml(product)).join('');
        attachCardListeners(container);
    }

    // ----------------------------------------------------
    // RENDER PRODUCTS CATALOG
    // ----------------------------------------------------
    function renderProducts() {
        const container = document.getElementById('products-catalog-grid');
        const countLabel = document.getElementById('products-count-label');
        if (!container) return;

        let filtered = state.products;

        // Category Filter
        if (state.currentCategory && state.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category.toLowerCase() === state.currentCategory.toLowerCase());
        }

        // Search Filter
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Sorting
        if (state.sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (state.sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (state.sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        if (countLabel) countLabel.textContent = `${filtered.length} Items Found`;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                    <i class="lucide-search-x" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
                    <h3>No products found</h3>
                    <p>Try searching for a different term or selecting another category.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(product => createProductCardHtml(product)).join('');
        attachCardListeners(container);
    }

    function createProductCardHtml(product) {
        const isWishlisted = state.wishlist.some(id => id === product.id);
        const starsHtml = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image-wrap">
                    ${product.discount_percent ? `<span class="discount-badge">-${product.discount_percent}%</span>` : ''}
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="Add to Wishlist">
                        <i class="lucide-heart"></i>
                    </button>
                    <img src="${product.image_url}" alt="${product.title}" class="product-img" loading="lazy" />
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h4 class="product-title" data-id="${product.id}">${product.title}</h4>
                    <div class="rating-row">
                        <span class="stars">${starsHtml}</span>
                        <span class="reviews-count">(${product.reviews_count || 12})</span>
                    </div>
                    <div class="price-row">
                        <span class="current-price">Rs. ${product.price.toLocaleString()}</span>
                        ${product.original_price ? `<span class="original-price">Rs. ${product.original_price.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn-add-cart" data-id="${product.id}">
                            <i class="lucide-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-quick-view" data-id="${product.id}" title="Quick View">
                            <i class="lucide-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachCardListeners(parentContainer) {
        // Add to Cart
        parentContainer.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pid = btn.dataset.id;
                addToCart(pid);
            });
        });

        // Wishlist Toggle
        parentContainer.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pid = btn.dataset.id;
                toggleWishlist(pid);
                btn.classList.toggle('active', state.wishlist.includes(pid));
            });
        });

        // Quick View / Detail Modal
        parentContainer.querySelectorAll('.product-title, .btn-quick-view').forEach(el => {
            el.addEventListener('click', () => {
                const pid = el.dataset.id;
                openProductDetailModal(pid);
            });
        });
    }

    // ----------------------------------------------------
    // CART OPERATIONS
    // ----------------------------------------------------
    function addToCart(productId, quantity = 1) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        const existing = state.cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            state.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
                quantity: quantity
            });
        }

        saveCart();
        updateHeaderCounters();
        showToast(`Added "${product.title.substring(0, 24)}..." to cart!`, 'orange');
    }

    function updateCartItemQty(productId, delta) {
        const item = state.cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                renderCartDrawer();
                updateHeaderCounters();
            }
        }
    }

    function removeFromCart(productId) {
        state.cart = state.cart.filter(i => i.id !== productId);
        saveCart();
        renderCartDrawer();
        updateHeaderCounters();
        showToast("Item removed from cart", "success");
    }

    function saveCart() {
        localStorage.setItem('mini_daraz_cart', JSON.stringify(state.cart));
    }

    function renderCartDrawer() {
        const body = document.getElementById('cart-drawer-body');
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountEl = document.getElementById('cart-discount');
        const grandTotalEl = document.getElementById('cart-grand-total');

        if (!body) return;

        if (state.cart.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="lucide-shopping-bag" style="font-size: 54px; color: #ddd; margin-bottom: 12px;"></i>
                    <h4>Your Cart is Empty</h4>
                    <p style="font-size: 13px; margin-top: 6px;">Browse our categories and add items to your cart.</p>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
            if (discountEl) discountEl.textContent = '- Rs. 0';
            if (grandTotalEl) grandTotalEl.textContent = 'Rs. 0';
            return;
        }

        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        if (state.appliedPromo === 'DARAZ10') discount = subtotal * 0.10;
        if (state.appliedPromo === 'MINI20') discount = subtotal * 0.20;
        const grandTotal = subtotal - discount;

        body.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image_url}" class="cart-item-img" alt="${item.title}" />
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                    <div class="cart-qty-controls">
                        <button class="btn-qty-mini btn-qty-minus" data-id="${item.id}">-</button>
                        <span style="font-size: 13px; font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                        <button class="btn-qty-mini btn-qty-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <i class="lucide-trash-2 cart-item-remove" data-id="${item.id}" title="Remove"></i>
            </div>
        `).join('');

        if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (discountEl) discountEl.textContent = `- Rs. ${discount.toLocaleString()}`;
        if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;

        // Event listeners inside drawer
        body.querySelectorAll('.btn-qty-minus').forEach(b => b.addEventListener('click', () => updateCartItemQty(b.dataset.id, -1)));
        body.querySelectorAll('.btn-qty-plus').forEach(b => b.addEventListener('click', () => updateCartItemQty(b.dataset.id, 1)));
        body.querySelectorAll('.cart-item-remove').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.id)));
    }

    // ----------------------------------------------------
    // WISHLIST OPERATIONS
    // ----------------------------------------------------
    function toggleWishlist(productId) {
        const index = state.wishlist.indexOf(productId);
        if (index > -1) {
            state.wishlist.splice(index, 1);
            showToast("Removed from wishlist", "success");
        } else {
            state.wishlist.push(productId);
            showToast("Saved to your wishlist!", "orange");
        }
        localStorage.setItem('mini_daraz_wishlist', JSON.stringify(state.wishlist));
        updateHeaderCounters();
    }

    function renderWishlistDrawer() {
        const body = document.getElementById('wishlist-drawer-body');
        if (!body) return;

        const wishlistedProducts = state.products.filter(p => state.wishlist.includes(p.id));

        if (wishlistedProducts.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="lucide-heart-off" style="font-size: 54px; color: #ddd; margin-bottom: 12px;"></i>
                    <h4>Your Wishlist is Empty</h4>
                    <p style="font-size: 13px; margin-top: 6px;">Tap the heart icon on products to save them for later.</p>
                </div>
            `;
            return;
        }

        body.innerHTML = wishlistedProducts.map(p => `
            <div class="cart-item">
                <img src="${p.image_url}" class="cart-item-img" alt="${p.title}" />
                <div class="cart-item-info">
                    <div class="cart-item-title">${p.title}</div>
                    <div class="cart-item-price">Rs. ${p.price.toLocaleString()}</div>
                    <button class="btn-add-cart" data-id="${p.id}" style="margin-top: 8px; width: max-content;">
                        <i class="lucide-shopping-cart"></i> Move to Cart
                    </button>
                </div>
                <i class="lucide-x cart-item-remove" data-id="${p.id}" title="Remove from Wishlist"></i>
            </div>
        `).join('');

        body.querySelectorAll('.btn-add-cart').forEach(b => {
            b.addEventListener('click', () => {
                addToCart(b.dataset.id);
                toggleWishlist(b.dataset.id);
                renderWishlistDrawer();
            });
        });

        body.querySelectorAll('.cart-item-remove').forEach(b => {
            b.addEventListener('click', () => {
                toggleWishlist(b.dataset.id);
                renderWishlistDrawer();
            });
        });
    }

    // ----------------------------------------------------
    // PRODUCT DETAIL MODAL
    // ----------------------------------------------------
    function openProductDetailModal(productId) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        state.selectedProduct = product;
        const modal = document.getElementById('product-detail-modal');
        const container = document.getElementById('product-detail-container');
        if (!modal || !container) return;

        const starsHtml = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

        container.innerHTML = `
            <div class="product-detail-layout">
                <div>
                    <img src="${product.image_url}" class="detail-img-large" alt="${product.title}" />
                </div>
                <div class="detail-info">
                    <span class="detail-category">${product.category}</span>
                    <h2 class="detail-title">${product.title}</h2>
                    <div class="rating-row" style="margin-bottom: 14px;">
                        <span class="stars">${starsHtml}</span>
                        <span style="font-weight: 700; color: var(--text-dark);">${product.rating}</span>
                        <span class="reviews-count">(${product.reviews_count} Customer Reviews)</span>
                        <span style="margin-left: auto; color: var(--success); font-weight: 700; font-size: 12px;">In Stock (${product.stock})</span>
                    </div>
                    <div class="detail-price-box">
                        <span class="detail-price">Rs. ${product.price.toLocaleString()}</span>
                        ${product.original_price ? `<span class="detail-orig-price">Rs. ${product.original_price.toLocaleString()}</span>` : ''}
                        ${product.discount_percent ? `<span class="discount-badge">SAVE ${product.discount_percent}%</span>` : ''}
                    </div>
                    <p class="detail-desc">${product.description}</p>

                    <div class="qty-selector">
                        <span style="font-weight: 700; font-size: 13px;">Quantity:</span>
                        <button class="qty-btn" id="modal-qty-minus">-</button>
                        <input type="number" id="modal-qty-input" class="qty-input" value="1" min="1" max="${product.stock}" />
                        <button class="qty-btn" id="modal-qty-plus">+</button>
                    </div>

                    <div class="detail-btns">
                        <button class="btn-primary" id="modal-add-cart-btn" style="flex: 1;">
                            <i class="lucide-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-buy-now" id="modal-buy-now-btn">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('open');

        // Quantity Handlers
        const qtyInput = container.querySelector('#modal-qty-input');
        container.querySelector('#modal-qty-minus').addEventListener('click', () => {
            if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
        });
        container.querySelector('#modal-qty-plus').addEventListener('click', () => {
            qtyInput.value = parseInt(qtyInput.value) + 1;
        });

        // Add to Cart
        container.querySelector('#modal-add-cart-btn').addEventListener('click', () => {
            addToCart(product.id, parseInt(qtyInput.value));
            modal.classList.remove('open');
        });

        // Buy Now
        container.querySelector('#modal-buy-now-btn').addEventListener('click', () => {
            addToCart(product.id, parseInt(qtyInput.value));
            modal.classList.remove('open');
            openCheckoutModal();
        });
    }

    // ----------------------------------------------------
    // CHECKOUT & ORDER CONFIRMATION (100% IN-SITE)
    // ----------------------------------------------------
    function openCheckoutModal() {
        if (state.cart.length === 0) {
            showToast("Your cart is empty!", "success");
            return;
        }

        const modal = document.getElementById('checkout-modal');
        if (!modal) return;

        renderCheckoutSummary();
        modal.classList.add('open');
    }

    function renderCheckoutSummary() {
        const listContainer = document.getElementById('checkout-items-list');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const discountEl = document.getElementById('checkout-discount');
        const grandTotalEl = document.getElementById('checkout-grand-total');

        if (!listContainer) return;

        const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        let discount = 0;
        if (state.appliedPromo === 'DARAZ10') discount = subtotal * 0.10;
        if (state.appliedPromo === 'MINI20') discount = subtotal * 0.20;
        const grandTotal = subtotal - discount;

        listContainer.innerHTML = state.cart.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span>${item.title} (x${item.quantity})</span>
                <span style="font-weight: 700;">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');

        if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (discountEl) discountEl.textContent = `- Rs. ${discount.toLocaleString()}`;
        if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }

    async function handleCheckoutFormSubmit(e) {
        e.preventDefault();
        
        const btn = document.getElementById('place-order-btn');
        btn.disabled = true;
        btn.innerHTML = `<i class="lucide-loader-2 spin"></i> Processing Order...`;

        const name = document.getElementById('checkout-name').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const city = document.getElementById('checkout-city').value.trim();
        const payment = document.querySelector('.payment-card.selected')?.dataset.method || 'Cash on Delivery';

        const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        let discount = 0;
        if (state.appliedPromo === 'DARAZ10') discount = subtotal * 0.10;
        if (state.appliedPromo === 'MINI20') discount = subtotal * 0.20;
        const grandTotal = subtotal - discount;

        const orderPayload = {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            shipping_address: address,
            city: city,
            payment_method: payment,
            total_amount: subtotal,
            discount_amount: discount,
            final_amount: grandTotal,
            items: state.cart
        };

        // Create Order in Supabase / LocalStorage
        const response = await DatabaseService.createOrder(orderPayload);

        btn.disabled = false;
        btn.innerHTML = `Place Order Now`;

        if (response.success) {
            // Clear Cart
            state.cart = [];
            saveCart();
            updateHeaderCounters();

            // Close Checkout Modal
            document.getElementById('checkout-modal').classList.remove('open');

            // Show Confirmation View
            openOrderConfirmationModal(response.order);
        } else {
            showToast("Failed to place order. Please try again.", "success");
        }
    }

    function openOrderConfirmationModal(order) {
        const modal = document.getElementById('order-confirmation-modal');
        const container = document.getElementById('order-confirmation-container');
        if (!modal || !container) return;

        const estDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        container.innerHTML = `
            <div class="order-success-card">
                <div class="success-icon-wrap">
                    <i class="lucide-check"></i>
                </div>
                <h2>Order Placed Successfully!</h2>
                <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">
                    Thank you for shopping with Mini Daraz! Your order is being processed.
                </p>

                <div class="order-number-badge">Order ID: ${order.order_number}</div>

                <div class="tracking-steps">
                    <div class="step active">
                        <div class="step-dot"><i class="lucide-check"></i></div>
                        <div class="step-text">Placed</div>
                    </div>
                    <div class="step active">
                        <div class="step-dot"><i class="lucide-package"></i></div>
                        <div class="step-text">Processing</div>
                    </div>
                    <div class="step">
                        <div class="step-dot"><i class="lucide-truck"></i></div>
                        <div class="step-text">On the Way</div>
                    </div>
                    <div class="step">
                        <div class="step-dot"><i class="lucide-home"></i></div>
                        <div class="step-text">Delivered</div>
                    </div>
                </div>

                <div style="background: #fafafa; border: 1px solid #eee; border-radius: var(--radius-md); padding: 16px; text-align: left; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span style="color: var(--text-muted);">Customer:</span>
                        <strong>${order.customer_name} (${order.customer_phone})</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span style="color: var(--text-muted);">Delivery Address:</span>
                        <strong>${order.shipping_address}, ${order.city}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span style="color: var(--text-muted);">Estimated Delivery:</span>
                        <strong style="color: var(--primary);">${estDate}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px dashed #ddd; font-weight: 800;">
                        <span>Total Paid (COD):</span>
                        <span style="color: var(--primary);">Rs. ${order.final_amount.toLocaleString()}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button class="btn-primary" id="continue-shopping-btn" style="flex: 1;">Continue Shopping</button>
                    <a href="admin.html" class="btn-outline" style="display: inline-flex; align-items: center; gap: 6px;">
                        <i class="lucide-layout-dashboard"></i> View in Admin Panel
                    </a>
                </div>
            </div>
        `;

        modal.classList.add('open');

        container.querySelector('#continue-shopping-btn').addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    // ----------------------------------------------------
    // TOAST NOTIFICATIONS & LISTENERS
    // ----------------------------------------------------
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="lucide-check-circle"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function setupEventListeners() {
        // Search Input
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value;
                renderProducts();
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Sort Select
        const sortSelect = document.getElementById('sort-products-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.sortBy = e.target.value;
                renderProducts();
            });
        }

        // Drawers Trigger
        const cartBtn = document.getElementById('cart-btn');
        const wishlistBtn = document.getElementById('wishlist-btn');
        const cartDrawer = document.getElementById('cart-drawer');
        const wishlistDrawer = document.getElementById('wishlist-drawer');

        if (cartBtn && cartDrawer) {
            cartBtn.addEventListener('click', () => {
                renderCartDrawer();
                cartDrawer.classList.add('open');
            });
        }
        if (wishlistBtn && wishlistDrawer) {
            wishlistBtn.addEventListener('click', () => {
                renderWishlistDrawer();
                wishlistDrawer.classList.add('open');
            });
        }

        // Drawer Close Buttons
        document.querySelectorAll('.drawer-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.drawer').classList.remove('open');
            });
        });

        // Modals Close Buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.remove('open');
            });
        });

        // Checkout Button inside Cart Drawer
        const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
        if (cartCheckoutBtn) {
            cartCheckoutBtn.addEventListener('click', () => {
                document.getElementById('cart-drawer').classList.remove('open');
                openCheckoutModal();
            });
        }

        // Apply Promo Code
        const promoBtn = document.getElementById('apply-promo-btn');
        if (promoBtn) {
            promoBtn.addEventListener('click', () => {
                const code = document.getElementById('promo-input').value.trim().toUpperCase();
                if (code === 'DARAZ10' || code === 'MINI20') {
                    state.appliedPromo = code;
                    showToast(`Promo "${code}" applied!`, "orange");
                    renderCartDrawer();
                } else {
                    showToast("Invalid promo code! Try DARAZ10 or MINI20", "success");
                }
            });
        }

        // Checkout Payment Cards Selector
        document.querySelectorAll('.payment-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Checkout Form Submit
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckoutFormSubmit);
        }
    }
});
