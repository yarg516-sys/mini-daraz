// Supabase Client Wrapper with Resilient Offline-First Synchronization

class SupabaseService {
    constructor() {
        this.client = null;
        this.isSupabaseConnected = false;
        this.init();
    }

    init() {
        try {
            if (typeof window.supabase !== 'undefined' && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
                this.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                this.isSupabaseConnected = true;
                console.log('⚡ Mini Daraz: Supabase client successfully initialized.');
            } else {
                console.warn('⚠️ Mini Daraz: Supabase SDK not found or keys missing. Running in Resilient LocalDB Mode.');
                this.isSupabaseConnected = false;
            }
        } catch (err) {
            console.error('Mini Daraz: Supabase initialization error, falling back to LocalDB:', err);
            this.isSupabaseConnected = false;
        }
    }

    // Fetch Products (Supabase with Local Fallback)
    async getProducts() {
        if (this.isSupabaseConnected && this.client) {
            try {
                const { data, error } = await this.client
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    console.log(`📦 Loaded ${data.length} products directly from Supabase Cloud.`);
                    return this.mapSupabaseProducts(data);
                }
            } catch (err) {
                console.warn('Supabase fetch returned empty/error. Using resilient local catalog.', err);
            }
        }

        // Fallback to local storage or initial dataset
        return this.getLocalProducts();
    }

    // Save New Product (Seller Action)
    async addProduct(product) {
        let savedProduct = { ...product };
        if (!savedProduct.id) {
            savedProduct.id = 'prod-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }

        // 1. Try Supabase
        if (this.isSupabaseConnected && this.client) {
            try {
                const sbPayload = {
                    title: savedProduct.title,
                    category: savedProduct.category,
                    brand: savedProduct.brand || 'Mini Daraz Verified',
                    price: parseFloat(savedProduct.price),
                    old_price: savedProduct.oldPrice ? parseFloat(savedProduct.oldPrice) : null,
                    discount: savedProduct.discount || 0,
                    rating: savedProduct.rating || 5.0,
                    reviews_count: savedProduct.reviewsCount || 0,
                    stock: parseInt(savedProduct.stock) || 10,
                    seller_name: savedProduct.sellerName || 'Verified Pakistani Merchant',
                    seller_city: savedProduct.sellerCity || 'Karachi',
                    image_url: savedProduct.imageUrl,
                    description: savedProduct.description || '',
                    specifications: savedProduct.specifications || {},
                    is_flash_sale: !!savedProduct.isFlashSale,
                    is_trending: !!savedProduct.isTrending,
                    is_recommended: true
                };

                const { data, error } = await this.client.from('products').insert([sbPayload]).select();
                if (!error && data && data[0]) {
                    console.log('✅ Product synced to Supabase Cloud:', data[0]);
                }
            } catch (err) {
                console.warn('Supabase sync skipped, storing locally:', err);
            }
        }

        // 2. Save locally
        this.saveProductLocal(savedProduct);
        return savedProduct;
    }

    // Update Product
    async updateProduct(productId, updates) {
        if (this.isSupabaseConnected && this.client) {
            try {
                await this.client.from('products').update(updates).eq('id', productId);
            } catch (err) {
                console.warn('Supabase update failed:', err);
            }
        }
        return this.updateProductLocal(productId, updates);
    }

    // Delete Product
    async deleteProduct(productId) {
        if (this.isSupabaseConnected && this.client) {
            try {
                await this.client.from('products').delete().eq('id', productId);
            } catch (err) {
                console.warn('Supabase delete failed:', err);
            }
        }
        return this.deleteProductLocal(productId);
    }

    // Save Customer Order
    async createOrder(orderData) {
        const orderId = 'PK-MD-' + Math.floor(100000 + Math.random() * 900000);
        const completeOrder = {
            ...orderData,
            id: orderId,
            orderNumber: orderId,
            trackingNumber: 'TCS-' + Math.floor(10000000 + Math.random() * 90000000),
            courier: orderData.courier || 'Mini Daraz Express',
            orderStatus: 'Processing',
            createdAt: new Date().toISOString()
        };

        // Try Supabase Order Insertion
        if (this.isSupabaseConnected && this.client) {
            try {
                const sbOrderPayload = {
                    order_number: completeOrder.orderNumber,
                    customer_name: completeOrder.customerName,
                    customer_phone: completeOrder.customerPhone,
                    customer_email: completeOrder.customerEmail || '',
                    delivery_address: completeOrder.deliveryAddress,
                    city: completeOrder.city,
                    province: completeOrder.province || 'Pakistan',
                    postal_code: completeOrder.postalCode || '',
                    items: completeOrder.items,
                    subtotal: completeOrder.subtotal,
                    delivery_fee: completeOrder.deliveryFee,
                    discount_amount: completeOrder.discountAmount || 0,
                    total_amount: completeOrder.totalAmount,
                    payment_method: completeOrder.paymentMethod,
                    payment_status: completeOrder.paymentMethod === 'cod' ? 'Pending COD' : 'Verified Paid',
                    order_status: 'Processing',
                    tracking_number: completeOrder.trackingNumber,
                    courier: completeOrder.courier
                };

                const { data, error } = await this.client.from('orders').insert([sbOrderPayload]).select();
                if (!error) {
                    console.log('✅ Order synced to Supabase Cloud:', data);
                }
            } catch (err) {
                console.warn('Order saved to local store (Supabase offline/unreachable):', err);
            }
        }

        // Save to Local Orders
        const localOrders = this.getLocalOrders();
        localOrders.unshift(completeOrder);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(localOrders));

        return completeOrder;
    }

    // Fetch Orders
    async getOrders() {
        if (this.isSupabaseConnected && this.client) {
            try {
                const { data, error } = await this.client.from('orders').select('*').order('created_at', { ascending: false });
                if (!error && data && data.length > 0) {
                    return this.mapSupabaseOrders(data);
                }
            } catch (err) {
                console.warn('Fetching local orders fallback.');
            }
        }
        return this.getLocalOrders();
    }

    // Update Order Status (Seller / Admin)
    async updateOrderStatus(orderId, newStatus) {
        if (this.isSupabaseConnected && this.client) {
            try {
                await this.client.from('orders').update({ order_status: newStatus }).eq('order_number', orderId);
            } catch (err) {
                console.warn('Supabase status update failed:', err);
            }
        }

        const orders = this.getLocalOrders();
        const target = orders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (target) {
            target.orderStatus = newStatus;
            localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        }
        return target;
    }

    // Local Storage Helpers
    getLocalProducts() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error(e);
            }
        }
        // Save initial 30+ products to local storage for instant offline resilience
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return [...INITIAL_PRODUCTS];
    }

    saveProductLocal(product) {
        const products = this.getLocalProducts();
        products.unshift(product);
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    updateProductLocal(productId, updates) {
        const products = this.getLocalProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProductLocal(productId) {
        let products = this.getLocalProducts();
        products = products.filter(p => p.id !== productId);
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return true;
    }

    getLocalOrders() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {}
        }
        // Provide sample initial delivered / processing orders for instant demo credibility
        const demoOrders = [
            {
                id: 'PK-MD-782194',
                orderNumber: 'PK-MD-782194',
                customerName: 'Muhammad Shafeeq',
                customerPhone: '0300-1234567',
                customerEmail: 'shafeeq@example.pk',
                deliveryAddress: 'House 42-B, Block 6, PECHS, Near Nursery',
                city: 'Karachi',
                province: 'Sindh',
                postalCode: '74200',
                items: [
                    {
                        id: 'prod-007',
                        title: 'Audionic Airbud 550 Wireless TWS Earbuds',
                        price: 4299,
                        quantity: 1,
                        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
                        color: 'Classic White'
                    }
                ],
                subtotal: 4299,
                deliveryFee: 150,
                discountAmount: 0,
                totalAmount: 4449,
                paymentMethod: 'easypaisa',
                paymentStatus: 'Verified Paid',
                orderStatus: 'Delivered',
                trackingNumber: 'TCS-99482103',
                courier: 'TCS Express Pakistan',
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
        ];
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(demoOrders));
        return demoOrders;
    }

    mapSupabaseProducts(data) {
        return data.map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: item.category,
            brand: item.brand,
            price: Number(item.price),
            oldPrice: item.old_price ? Number(item.old_price) : null,
            discount: item.discount,
            rating: Number(item.rating || 4.8),
            reviewsCount: item.reviews_count || 0,
            stock: item.stock || 20,
            sellerName: item.seller_name,
            sellerCity: item.seller_city || 'Lahore',
            imageUrl: item.image_url,
            additionalImages: item.additional_images || [],
            description: item.description,
            specifications: item.specifications || {},
            colors: item.colors || [],
            isFlashSale: !!item.is_flash_sale,
            isTrending: !!item.is_trending,
            isRecommended: !!item.is_recommended,
            reviews: []
        }));
    }

    mapSupabaseOrders(data) {
        return data.map(item => ({
            id: item.order_number,
            orderNumber: item.order_number,
            customerName: item.customer_name,
            customerPhone: item.customer_phone,
            customerEmail: item.customer_email,
            deliveryAddress: item.delivery_address,
            city: item.city,
            province: item.province,
            postalCode: item.postal_code,
            items: item.items,
            subtotal: Number(item.subtotal),
            deliveryFee: Number(item.delivery_fee),
            discountAmount: Number(item.discount_amount || 0),
            totalAmount: Number(item.total_amount),
            paymentMethod: item.payment_method,
            paymentStatus: item.payment_status,
            orderStatus: item.order_status,
            trackingNumber: item.tracking_number,
            courier: item.courier,
            createdAt: item.created_at
        }));
    }
}

// Global service instance
const supabaseService = new SupabaseService();
