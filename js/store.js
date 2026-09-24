// Mini Daraz Central Reactive Store & State Manager

class Store {
    constructor() {
        this.products = [];
        this.categories = INITIAL_CATEGORIES;
        this.sellers = INITIAL_SELLERS;
        this.cart = this.loadCart();
        this.wishlist = this.loadWishlist();
        this.orders = [];
        this.selectedCity = this.loadSelectedCity();
        this.appliedCoupon = null;
        this.activeFilter = {
            category: 'all',
            searchQuery: '',
            minPrice: 0,
            maxPrice: 500000,
            minRating: 0,
            brand: 'all',
            inStockOnly: false,
            sortBy: 'popular'
        };
        this.listeners = {};
    }

    async init() {
        this.products = await supabaseService.getProducts();
        this.orders = await supabaseService.getOrders();
        this.notify('products_loaded', this.products);
        this.notify('cart_updated', this.cart);
        this.notify('wishlist_updated', this.wishlist);
        this.notify('orders_updated', this.orders);
        this.notify('city_changed', this.selectedCity);
    }

    // Event Subscription System
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    // City Selection & Delivery Fee
    loadSelectedCity() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_CITY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return CONFIG.PAKISTAN_CITIES[0]; // Default: Karachi
    }

    setSelectedCity(cityName) {
        const city = CONFIG.PAKISTAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        if (city) {
            this.selectedCity = city;
            localStorage.setItem(CONFIG.STORAGE_KEYS.SELECTED_CITY, JSON.stringify(city));
            this.notify('city_changed', this.selectedCity);
            this.notify('cart_updated', this.cart);
        }
    }

    getCityDeliveryFee() {
        if (this.appliedCoupon && this.appliedCoupon.freeShipping) {
            return 0;
        }
        return this.selectedCity ? this.selectedCity.deliveryFee : 150;
    }

    // Cart Operations
    loadCart() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return [];
    }

    saveCart() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.cart));
        this.notify('cart_updated', this.cart);
    }

    addToCart(product, quantity = 1, selectedColor = null) {
        const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
        const existingIndex = this.cart.findIndex(item => item.id === product.id && item.selectedColor === color);

        if (existingIndex > -1) {
            this.cart[existingIndex].quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                oldPrice: product.oldPrice,
                imageUrl: product.imageUrl,
                sellerName: product.sellerName,
                sellerCity: product.sellerCity,
                category: product.category,
                selectedColor: color,
                quantity: quantity,
                stock: product.stock
            });
        }

        this.saveCart();
        return true;
    }

    updateCartQuantity(productId, color, delta) {
        const item = this.cart.find(i => i.id === productId && i.selectedColor === color);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeFromCart(productId, color);
            } else {
                this.saveCart();
            }
        }
    }

    removeFromCart(productId, color) {
        this.cart = this.cart.filter(item => !(item.id === productId && item.selectedColor === color));
        this.saveCart();
    }

    clearCart() {
        this.cart = [];
        this.appliedCoupon = null;
        this.saveCart();
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartDiscount() {
        const subtotal = this.getCartSubtotal();
        if (!this.appliedCoupon) return 0;

        if (this.appliedCoupon.discountPercent) {
            let discount = (subtotal * this.appliedCoupon.discountPercent) / 100;
            if (this.appliedCoupon.maxDiscount && discount > this.appliedCoupon.maxDiscount) {
                discount = this.appliedCoupon.maxDiscount;
            }
            return Math.round(discount);
        } else if (this.appliedCoupon.discountFixed) {
            return Math.min(subtotal, this.appliedCoupon.discountFixed);
        }
        return 0;
    }

    getCartTotal() {
        const subtotal = this.getCartSubtotal();
        const discount = this.getCartDiscount();
        const deliveryFee = subtotal > 0 ? this.getCityDeliveryFee() : 0;
        return Math.max(0, subtotal - discount + deliveryFee);
    }

    applyCoupon(code) {
        const cleanCode = (code || '').trim().toUpperCase();
        const coupon = CONFIG.COUPONS[cleanCode];

        if (!coupon) {
            return { success: false, message: 'Invalid voucher code. Try DARAZ10 or AZADI50.' };
        }

        const subtotal = this.getCartSubtotal();
        if (coupon.minSpend && subtotal < coupon.minSpend) {
            return { success: false, message: `Minimum order amount of Rs. ${coupon.minSpend.toLocaleString()} required for this coupon.` };
        }

        this.appliedCoupon = { code: cleanCode, ...coupon };
        this.notify('cart_updated', this.cart);
        return { success: true, message: `Coupon '${cleanCode}' applied successfully!`, coupon: this.appliedCoupon };
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.notify('cart_updated', this.cart);
    }

    // Wishlist Operations
    loadWishlist() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.WISHLIST);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return [];
    }

    saveWishlist() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlist));
        this.notify('wishlist_updated', this.wishlist);
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    toggleWishlist(product) {
        const index = this.wishlist.findIndex(item => item.id === product.id);
        let added = false;
        if (index > -1) {
            this.wishlist.splice(index, 1);
        } else {
            this.wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                oldPrice: product.oldPrice,
                discount: product.discount,
                imageUrl: product.imageUrl,
                rating: product.rating,
                sellerName: product.sellerName
            });
            added = true;
        }
        this.saveWishlist();
        return added;
    }

    // Product Filter & Search Operations
    setFilter(key, value) {
        this.activeFilter[key] = value;
        this.notify('filter_changed', this.getFilteredProducts());
    }

    resetFilters() {
        this.activeFilter = {
            category: 'all',
            searchQuery: '',
            minPrice: 0,
            maxPrice: 500000,
            minRating: 0,
            brand: 'all',
            inStockOnly: false,
            sortBy: 'popular'
        };
        this.notify('filter_changed', this.getFilteredProducts());
    }

    getFilteredProducts() {
        let list = [...this.products];
        const f = this.activeFilter;

        // Search query
        if (f.searchQuery && f.searchQuery.trim() !== '') {
            const q = f.searchQuery.toLowerCase().trim();
            list = list.filter(p => 
                p.title.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
        }

        // Category filter
        if (f.category && f.category !== 'all') {
            list = list.filter(p => p.category === f.category);
        }

        // Brand filter
        if (f.brand && f.brand !== 'all') {
            list = list.filter(p => p.brand && p.brand.toLowerCase() === f.brand.toLowerCase());
        }

        // Price range
        list = list.filter(p => p.price >= f.minPrice && p.price <= f.maxPrice);

        // Rating filter
        if (f.minRating > 0) {
            list = list.filter(p => (p.rating || 0) >= f.minRating);
        }

        // In Stock only
        if (f.inStockOnly) {
            list = list.filter(p => (p.stock || 0) > 0);
        }

        // Sorting
        switch (f.sortBy) {
            case 'price_asc':
                list.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                list.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'discount':
                list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
                break;
            case 'newest':
                list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'popular':
            default:
                list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
                break;
        }

        return list;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getFlashSaleProducts() {
        return this.products.filter(p => p.isFlashSale);
    }

    getTrendingProducts() {
        return this.products.filter(p => p.isTrending);
    }

    getRecommendedProducts() {
        return this.products.filter(p => p.isRecommended);
    }

    // Orders Management
    async placeOrder(orderPayload) {
        const createdOrder = await supabaseService.createOrder(orderPayload);
        this.orders = await supabaseService.getOrders();
        this.clearCart();
        this.notify('orders_updated', this.orders);
        return createdOrder;
    }

    async updateOrderStatus(orderId, newStatus) {
        const updated = await supabaseService.updateOrderStatus(orderId, newStatus);
        this.orders = await supabaseService.getOrders();
        this.notify('orders_updated', this.orders);
        return updated;
    }

    // Seller Product Management
    async addNewProduct(productData) {
        const newProd = await supabaseService.addProduct(productData);
        this.products = await supabaseService.getProducts();
        this.notify('products_loaded', this.products);
        this.notify('filter_changed', this.getFilteredProducts());
        return newProd;
    }

    async updateProduct(id, updates) {
        const updated = await supabaseService.updateProduct(id, updates);
        this.products = await supabaseService.getProducts();
        this.notify('products_loaded', this.products);
        this.notify('filter_changed', this.getFilteredProducts());
        return updated;
    }

    async deleteProduct(id) {
        await supabaseService.deleteProduct(id);
        this.products = await supabaseService.getProducts();
        this.notify('products_loaded', this.products);
        this.notify('filter_changed', this.getFilteredProducts());
        return true;
    }
}

// Global Store Instance
const store = new Store();
