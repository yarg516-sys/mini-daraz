// Mini Daraz UI Rendering Engine & Interactive Visual Components

const UI = {
    // Format Pakistani Rupee Currency
    formatPKR(amount) {
        if (amount === undefined || amount === null) return '₨ 0';
        return `₨ ${Math.round(amount).toLocaleString('en-PK')}`;
    },

    // Render Star Rating HTML
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.4;
        let html = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                html += '<i class="fa-solid fa-star text-amber-400"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                html += '<i class="fa-solid fa-star-half-stroke text-amber-400"></i>';
            } else {
                html += '<i class="fa-regular fa-star text-slate-300"></i>';
            }
        }
        return html;
    },

    // Render Single Product Card
    createProductCard(product) {
        const isWishlisted = store.isInWishlist(product.id);
        const discountBadge = product.discount && product.discount > 0 
            ? `<span class="discount-badge">-${product.discount}%</span>` 
            : '';
        const flashBadge = product.isFlashSale 
            ? `<span class="flash-badge"><i class="fa-solid fa-bolt"></i> Flash Sale</span>` 
            : '';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-wrap" onclick="UI.openProductModal('${product.id}')">
                    <img src="${product.imageUrl}" alt="${product.title}" loading="lazy" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80'">
                    <div class="badge-container">
                        ${discountBadge}
                        ${flashBadge}
                    </div>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" title="Save to Wishlist" onclick="event.stopPropagation(); UI.handleWishlistToggle('${product.id}', this)">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <div class="quick-view-overlay">
                        <span><i class="fa-regular fa-eye"></i> Quick View</span>
                    </div>
                </div>

                <div class="product-info" onclick="UI.openProductModal('${product.id}')">
                    <div class="seller-tag">
                        <i class="fa-solid fa-store text-orange-500"></i> ${product.sellerName || 'Verified Store'} • <span class="seller-city">${product.sellerCity || 'Karachi'}</span>
                    </div>
                    <h3 class="product-title" title="${product.title}">${product.title}</h3>
                    
                    <div class="rating-row">
                        <div class="stars">${UI.renderStars(product.rating || 4.8)}</div>
                        <span class="rating-score">${(product.rating || 4.8).toFixed(1)}</span>
                        <span class="reviews-count">(${product.reviewsCount || 42})</span>
                    </div>

                    <div class="price-row">
                        <div class="price-box">
                            <span class="current-price">${UI.formatPKR(product.price)}</span>
                            ${product.oldPrice ? `<span class="old-price">${UI.formatPKR(product.oldPrice)}</span>` : ''}
                        </div>
                        <div class="stock-tag ${product.stock < 10 ? 'low' : ''}">
                            ${product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock') : 'Sold Out'}
                        </div>
                    </div>
                </div>

                <div class="product-card-footer">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); UI.handleAddToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-buy-now" onclick="event.stopPropagation(); UI.handleInstantBuy('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                        Buy Now
                    </button>
                </div>
            </div>
        `;
    },

    // Render Product Grids for Home Sections
    renderGrid(containerId, products, emptyMsg = 'No products found.') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-box-open empty-icon"></i>
                    <p class="empty-text">${emptyMsg}</p>
                    <button class="btn-secondary" onclick="store.resetFilters();">Reset All Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(p => UI.createProductCard(p)).join('');
    },

    // Render Categories
    renderCategories() {
        const grid = document.getElementById('categories-grid');
        const navDropdown = document.getElementById('nav-categories-list');
        const filterSelect = document.getElementById('filter-category-select');

        if (grid) {
            grid.innerHTML = store.categories.map(cat => `
                <div class="category-item" onclick="UI.filterByCategory('${cat.id}')">
                    <div class="category-icon-box">
                        <i class="fa-solid ${cat.icon}"></i>
                    </div>
                    <span class="category-name">${cat.name}</span>
                </div>
            `).join('');
        }

        if (navDropdown) {
            navDropdown.innerHTML = `
                <li><a href="javascript:void(0)" onclick="UI.filterByCategory('all')"><i class="fa-solid fa-grid-2"></i> All Categories</a></li>
                ${store.categories.map(cat => `
                    <li><a href="javascript:void(0)" onclick="UI.filterByCategory('${cat.id}')"><i class="fa-solid ${cat.icon}"></i> ${cat.name}</a></li>
                `).join('')}
            `;
        }

        if (filterSelect) {
            filterSelect.innerHTML = `
                <option value="all">All Categories</option>
                ${store.categories.map(cat => `
                    <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    },

    // Filter by Category Helper
    filterByCategory(categoryId) {
        store.setFilter('category', categoryId);
        const browseSection = document.getElementById('all-products-section');
        if (browseSection) {
            browseSection.scrollIntoView({ behavior: 'smooth' });
        }
        UI.showToast(`Browsing ${categoryId === 'all' ? 'All Categories' : categoryId}`, 'info');
    },

    // Product Modal Detail View
    openProductModal(productId) {
        const product = store.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        const modalBody = document.getElementById('product-modal-content');
        if (!modal || !modalBody) return;

        const isWishlisted = store.isInWishlist(product.id);
        const images = [product.imageUrl, ...(product.additionalImages || [])];
        const colors = product.colors && product.colors.length > 0 ? product.colors : ['Default'];

        let specsHtml = '';
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            specsHtml = `
                <div class="specs-table-wrap">
                    <h4 class="specs-title">Key Specifications</h4>
                    <table class="specs-table">
                        <tbody>
                            ${Object.entries(product.specifications).map(([k, v]) => `
                                <tr>
                                    <td class="spec-label">${k}</td>
                                    <td class="spec-value">${v}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal-product-layout">
                <!-- Left: Gallery -->
                <div class="modal-gallery">
                    <div class="main-image-container">
                        <img id="modal-active-img" src="${product.imageUrl}" alt="${product.title}" class="modal-main-image">
                    </div>
                    ${images.length > 1 ? `
                        <div class="thumbnail-row">
                            ${images.map((img, idx) => `
                                <img src="${img}" alt="Thumbnail ${idx+1}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="UI.switchModalImage('${img}', this)">
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="pakistan-guarantee-box">
                        <div class="guarantee-item">
                            <i class="fa-solid fa-shield-halved text-emerald-600"></i>
                            <div>
                                <strong>100% Authentic Product</strong>
                                <span>Verified Pakistani Seller Warranty</span>
                            </div>
                        </div>
                        <div class="guarantee-item">
                            <i class="fa-solid fa-rotate-left text-blue-600"></i>
                            <div>
                                <strong>7 Days Easy Return</strong>
                                <span>Hassle-free direct in-app returns</span>
                            </div>
                        </div>
                        <div class="guarantee-item">
                            <i class="fa-solid fa-truck-fast text-orange-500"></i>
                            <div>
                                <strong>Express Shipping</strong>
                                <span>Delivery to ${store.selectedCity.name} in ${store.selectedCity.deliveryDays}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Product Information -->
                <div class="modal-details">
                    <div class="modal-category-badge">
                        <span>${product.category.toUpperCase().replace(/-/g, ' ')}</span> • <span>Brand: <strong>${product.brand || 'Original'}</strong></span>
                    </div>

                    <h2 class="modal-product-title">${product.title}</h2>

                    <div class="modal-rating-row">
                        <div class="stars">${UI.renderStars(product.rating || 4.9)}</div>
                        <span class="rating-num">${(product.rating || 4.9).toFixed(1)}</span>
                        <span class="separator">|</span>
                        <span class="reviews-link">${product.reviewsCount || 35} Customer Ratings</span>
                        <span class="separator">|</span>
                        <span class="stock-status in-stock"><i class="fa-solid fa-circle-check"></i> ${product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}</span>
                    </div>

                    <div class="modal-price-box">
                        <div class="modal-current-price">${UI.formatPKR(product.price)}</div>
                        ${product.oldPrice ? `
                            <div class="modal-old-price">${UI.formatPKR(product.oldPrice)}</div>
                            <div class="modal-discount-tag">Save ${product.discount}% OFF</div>
                        ` : ''}
                    </div>

                    <!-- Security Alert -->
                    <div class="daraz-safety-alert">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <span>${CONFIG.SECURITY_NOTICE}</span>
                    </div>

                    <!-- Seller Card -->
                    <div class="modal-seller-card">
                        <div class="seller-avatar">
                            <i class="fa-solid fa-store"></i>
                        </div>
                        <div class="seller-info-content">
                            <div class="seller-title-row">
                                <span class="seller-shop-name">${product.sellerName || 'Verified Merchant'}</span>
                                <span class="verified-badge"><i class="fa-solid fa-check"></i> Mini Daraz Verified</span>
                            </div>
                            <div class="seller-metrics">
                                <span><i class="fa-solid fa-location-dot"></i> ${product.sellerCity || 'Karachi'}, Pakistan</span>
                                <span>• 98% Positive Seller Rating</span>
                            </div>
                        </div>
                    </div>

                    <!-- Color / Variant Picker -->
                    <div class="variant-section">
                        <label class="variant-label">Color / Edition:</label>
                        <div class="variant-options" id="modal-color-options">
                            ${colors.map((c, i) => `
                                <button type="button" class="variant-pill ${i === 0 ? 'selected' : ''}" onclick="UI.selectVariantColor(this, '${c}')">${c}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Quantity Picker -->
                    <div class="quantity-section">
                        <label class="variant-label">Quantity:</label>
                        <div class="quantity-stepper">
                            <button type="button" onclick="UI.stepModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
                            <input type="number" id="modal-qty-input" value="1" min="1" max="${product.stock}" readonly>
                            <button type="button" onclick="UI.stepModalQty(1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="modal-action-row">
                        <button class="modal-btn-cart" onclick="UI.handleModalAddToCart('${product.id}')">
                            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                        </button>
                        <button class="modal-btn-buy" onclick="UI.handleModalBuyNow('${product.id}')">
                            <i class="fa-solid fa-bolt"></i> Buy Now
                        </button>
                        <button class="modal-btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="UI.handleWishlistToggle('${product.id}', this)" title="Wishlist">
                            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                    </div>

                    <!-- Description -->
                    <div class="product-description-wrap">
                        <h4 class="description-title">Product Description</h4>
                        <p class="description-text">${product.description}</p>
                    </div>

                    <!-- Specs -->
                    ${specsHtml}
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    switchModalImage(imgSrc, thumbElement) {
        const activeImg = document.getElementById('modal-active-img');
        if (activeImg) activeImg.src = imgSrc;

        document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
        if (thumbElement) thumbElement.classList.add('active');
    },

    selectVariantColor(button, color) {
        document.querySelectorAll('#modal-color-options .variant-pill').forEach(b => b.classList.remove('selected'));
        button.classList.add('selected');
    },

    stepModalQty(delta) {
        const input = document.getElementById('modal-qty-input');
        if (!input) return;
        let val = parseInt(input.value) + delta;
        const max = parseInt(input.getAttribute('max')) || 99;
        if (val < 1) val = 1;
        if (val > max) val = max;
        input.value = val;
    },

    // Add to cart from card
    handleAddToCart(productId) {
        const product = store.getProductById(productId);
        if (product) {
            store.addToCart(product, 1);
            UI.showToast(`Added "${product.title.substring(0, 28)}..." to Cart!`, 'success');
            UI.animateCartIcon();
        }
    },

    // Instant buy from card
    handleInstantBuy(productId) {
        const product = store.getProductById(productId);
        if (product) {
            store.addToCart(product, 1);
            UI.closeProductModal();
            Checkout.openCheckout();
        }
    },

    // Add to cart from modal
    handleModalAddToCart(productId) {
        const product = store.getProductById(productId);
        if (!product) return;

        const qtyInput = document.getElementById('modal-qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) : 1;
        const selectedColorBtn = document.querySelector('#modal-color-options .variant-pill.selected');
        const color = selectedColorBtn ? selectedColorBtn.innerText : null;

        store.addToCart(product, qty, color);
        UI.showToast(`Added ${qty} item(s) to Cart!`, 'success');
        UI.animateCartIcon();
        UI.closeProductModal();
    },

    // Buy now from modal
    handleModalBuyNow(productId) {
        const product = store.getProductById(productId);
        if (!product) return;

        const qtyInput = document.getElementById('modal-qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) : 1;
        const selectedColorBtn = document.querySelector('#modal-color-options .variant-pill.selected');
        const color = selectedColorBtn ? selectedColorBtn.innerText : null;

        store.addToCart(product, qty, color);
        UI.closeProductModal();
        Checkout.openCheckout();
    },

    // Wishlist Toggle
    handleWishlistToggle(productId, button) {
        const product = store.getProductById(productId);
        if (!product) return;

        const added = store.toggleWishlist(product);
        if (button) {
            button.classList.toggle('active', added);
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
        }
        UI.showToast(added ? 'Saved to your Wishlist!' : 'Removed from Wishlist', added ? 'success' : 'info');
        UI.renderWishlistDrawer();
    },

    // Toast Notification System
    showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-circle-check text-emerald-500',
            error: 'fa-circle-xmark text-red-500',
            warning: 'fa-triangle-exclamation text-amber-500',
            info: 'fa-circle-info text-blue-500'
        };

        const toast = document.createElement('div');
        toast.className = `toast-card toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info}"></i>
            <span class="toast-text">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // Animate Cart Icon in Header
    animateCartIcon() {
        const icon = document.querySelector('.cart-nav-btn');
        if (icon) {
            icon.classList.add('pulse-anim');
            setTimeout(() => icon.classList.remove('pulse-anim'), 600);
        }
    },

    // Update Header Badges
    updateCounters() {
        const cartBadge = document.getElementById('cart-count-badge');
        const wishlistBadge = document.getElementById('wishlist-count-badge');
        const cartCount = store.getCartCount();
        const wishlistCount = store.wishlist.length;

        if (cartBadge) {
            cartBadge.innerText = cartCount;
            cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
        }
        if (wishlistBadge) {
            wishlistBadge.innerText = wishlistCount;
            wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
        }

        const cityLabel = document.getElementById('current-city-label');
        if (cityLabel && store.selectedCity) {
            cityLabel.innerText = `Deliver to: ${store.selectedCity.name}`;
        }
    },

    // Render Cart Drawer
    renderCartDrawer() {
        const drawer = document.getElementById('cart-drawer-items');
        const subtotalEl = document.getElementById('cart-subtotal-val');
        const deliveryEl = document.getElementById('cart-delivery-val');
        const discountEl = document.getElementById('cart-discount-val');
        const totalEl = document.getElementById('cart-total-val');
        const checkoutBtn = document.getElementById('cart-checkout-btn');

        if (!drawer) return;

        if (store.cart.length === 0) {
            drawer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-cart-shopping empty-cart-icon"></i>
                    <p>Your Mini Daraz cart is currently empty.</p>
                    <button class="btn-primary" onclick="UI.closeCartDrawer();">Start Shopping Now</button>
                </div>
            `;
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (subtotalEl) subtotalEl.innerText = '₨ 0';
            if (deliveryEl) deliveryEl.innerText = '₨ 0';
            if (discountEl) discountEl.innerText = '₨ 0';
            if (totalEl) totalEl.innerText = '₨ 0';
            return;
        }

        if (checkoutBtn) checkoutBtn.disabled = false;

        drawer.innerHTML = store.cart.map(item => `
            <div class="cart-drawer-item">
                <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-thumb">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    ${item.selectedColor ? `<span class="cart-item-variant">Variant: ${item.selectedColor}</span>` : ''}
                    <div class="cart-item-price-row">
                        <span class="cart-item-price">${UI.formatPKR(item.price)}</span>
                        <div class="cart-item-stepper">
                            <button onclick="store.updateCartQuantity('${item.id}', '${item.selectedColor}', -1)"><i class="fa-solid fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="store.updateCartQuantity('${item.id}', '${item.selectedColor}', 1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="store.removeFromCart('${item.id}', '${item.selectedColor}')" title="Remove item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');

        const subtotal = store.getCartSubtotal();
        const deliveryFee = store.getCityDeliveryFee();
        const discount = store.getCartDiscount();
        const total = store.getCartTotal();

        if (subtotalEl) subtotalEl.innerText = UI.formatPKR(subtotal);
        if (deliveryEl) deliveryEl.innerText = deliveryFee === 0 ? 'FREE' : UI.formatPKR(deliveryFee);
        if (discountEl) discountEl.innerText = discount > 0 ? `-${UI.formatPKR(discount)}` : '₨ 0';
        if (totalEl) totalEl.innerText = UI.formatPKR(total);
    },

    // Cart Drawer Open/Close
    openCartDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
            UI.renderCartDrawer();
            drawer.classList.add('open');
            document.body.classList.add('drawer-open');
        }
    },

    closeCartDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
            drawer.classList.remove('open');
            document.body.classList.remove('drawer-open');
        }
    },

    // Wishlist Drawer / Modal
    renderWishlistDrawer() {
        const container = document.getElementById('wishlist-items-container');
        if (!container) return;

        if (store.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-heart empty-icon"></i>
                    <p class="empty-text">Your Wishlist is empty. Explore products and tap the heart icon to save them.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = store.wishlist.map(item => `
            <div class="wishlist-item-row">
                <img src="${item.imageUrl}" alt="${item.title}" class="wishlist-item-thumb">
                <div class="wishlist-item-info">
                    <h4>${item.title}</h4>
                    <div class="price">${UI.formatPKR(item.price)}</div>
                    <span class="seller">${item.sellerName || 'Verified Store'}</span>
                </div>
                <div class="wishlist-item-actions">
                    <button class="btn-primary-sm" onclick="store.addToCart(store.getProductById('${item.id}'), 1); UI.showToast('Moved to Cart!', 'success');">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-icon-danger" onclick="store.toggleWishlist(store.getProductById('${item.id}')); UI.renderWishlistDrawer();">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    openWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) {
            UI.renderWishlistDrawer();
            modal.classList.add('active');
        }
    },

    closeWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) modal.classList.remove('active');
    },

    // City Selector Modal
    openCityModal() {
        const modal = document.getElementById('city-modal');
        const list = document.getElementById('city-selector-list');
        if (!modal || !list) return;

        list.innerHTML = CONFIG.PAKISTAN_CITIES.map(c => `
            <div class="city-option-card ${store.selectedCity.name === c.name ? 'selected' : ''}" onclick="UI.selectCity('${c.name}')">
                <div class="city-name-box">
                    <span class="city-title">${c.name}</span>
                    <span class="city-province">${c.province}</span>
                </div>
                <div class="city-rate-box">
                    <span class="delivery-time"><i class="fa-solid fa-truck"></i> ${c.deliveryDays}</span>
                    <span class="delivery-rate">Fee: ₨ ${c.deliveryFee}</span>
                </div>
            </div>
        `).join('');

        modal.classList.add('active');
    },

    selectCity(cityName) {
        store.setSelectedCity(cityName);
        UI.closeCityModal();
        UI.showToast(`Delivery location set to ${cityName}`, 'success');
    },

    closeCityModal() {
        const modal = document.getElementById('city-modal');
        if (modal) modal.classList.remove('active');
    },

    // Flash Sale Live Countdown Timer
    startFlashSaleCountdown() {
        const timerContainer = document.getElementById('flash-sale-timer');
        if (!timerContainer) return;

        // Target: Midnight tonight
        function updateTimer() {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            const diff = tomorrow - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            const pad = (n) => String(n).padStart(2, '0');

            timerContainer.innerHTML = `
                <div class="timer-unit"><span>${pad(hours)}</span><label>Hours</label></div>
                <span class="timer-colon">:</span>
                <div class="timer-unit"><span>${pad(minutes)}</span><label>Mins</label></div>
                <span class="timer-colon">:</span>
                <div class="timer-unit"><span>${pad(seconds)}</span><label>Secs</label></div>
            `;
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    }
};
