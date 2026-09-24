/**
 * MINI DARAZ - Supabase Configuration & Data Service Layer
 * Supabase Project URL: https://coyzukuucgqkzaywyvx.supabase.co
 */

const SUPABASE_URL = 'https://coyzukuucgqkzaywyvx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveXp1a3VldWNncWt6YXl3eXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjk1MjYsImV4cCI6MjEwNTg0NTUyNn0.ZK1wHUzEJt_4fXvHBfkQHQ8GlA4VdIuVhR2KZav7hQk';

// Initialize Supabase Client if SDK is loaded
let supabaseClient = null;

if (window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase client initialized successfully.");
    } catch (e) {
        console.warn("⚠️ Supabase init warning:", e);
    }
}

// Global DB Data Service with LocalStorage Backup Fallback
const DatabaseService = {
    // PRODUCTS
    async getProducts() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    console.log(`📦 Loaded ${data.length} products from Supabase DB.`);
                    // Cache locally
                    localStorage.setItem('mini_daraz_db_products', JSON.stringify(data));
                    return data;
                }
            } catch (err) {
                console.warn("Falling back to local product cache:", err);
            }
        }
        
        // Fallback to local storage or initial seed dataset
        const localData = localStorage.getItem('mini_daraz_db_products');
        if (localData) {
            return JSON.parse(localData);
        }
        return window.INITIAL_PRODUCTS || [];
    },

    async addProduct(productData) {
        const newProduct = {
            id: productData.id || ('prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
            title: productData.title,
            description: productData.description || '',
            price: parseFloat(productData.price),
            original_price: parseFloat(productData.original_price || productData.price * 1.25),
            discount_percent: parseInt(productData.discount_percent || Math.round((1 - productData.price/(productData.original_price||productData.price*1.25))*100)),
            category: productData.category,
            image_url: productData.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            rating: parseFloat(productData.rating || 4.5),
            reviews_count: parseInt(productData.reviews_count || 1),
            stock: parseInt(productData.stock || 20),
            is_flash_sale: !!productData.is_flash_sale,
            is_featured: !!productData.is_featured,
            created_at: new Date().toISOString()
        };

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .insert([newProduct])
                    .select();
                
                if (!error && data && data.length > 0) {
                    console.log("✅ Added product to Supabase DB:", data[0]);
                    await this.syncLocalProducts();
                    return { success: true, data: data[0] };
                }
            } catch (err) {
                console.warn("Supabase insert error, saving locally:", err);
            }
        }

        // Local Storage fallback save
        const existing = await this.getProducts();
        existing.unshift(newProduct);
        localStorage.setItem('mini_daraz_db_products', JSON.stringify(existing));
        return { success: true, data: newProduct };
    },

    async updateProduct(id, updatedFields) {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .update(updatedFields)
                    .eq('id', id)
                    .select();

                if (!error && data) {
                    console.log("✅ Updated product in Supabase:", data);
                    await this.syncLocalProducts();
                    return { success: true, data: data[0] };
                }
            } catch (err) {
                console.warn("Supabase update error, updating locally:", err);
            }
        }

        const existing = await this.getProducts();
        const index = existing.findIndex(p => p.id === id);
        if (index !== -1) {
            existing[index] = { ...existing[index], ...updatedFields };
            localStorage.setItem('mini_daraz_db_products', JSON.stringify(existing));
            return { success: true, data: existing[index] };
        }
        return { success: false, error: 'Product not found' };
    },

    async deleteProduct(id) {
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (!error) {
                    console.log("✅ Deleted product from Supabase:", id);
                }
            } catch (err) {
                console.warn("Supabase delete error:", err);
            }
        }

        let existing = await this.getProducts();
        existing = existing.filter(p => p.id !== id);
        localStorage.setItem('mini_daraz_db_products', JSON.stringify(existing));
        return { success: true };
    },

    // ORDERS
    async createOrder(orderPayload) {
        const orderData = {
            id: 'ord_' + Date.now(),
            order_number: 'MD-' + Math.floor(100000 + Math.random() * 900000),
            customer_name: orderPayload.customer_name,
            customer_email: orderPayload.customer_email,
            customer_phone: orderPayload.customer_phone,
            shipping_address: orderPayload.shipping_address,
            city: orderPayload.city,
            payment_method: orderPayload.payment_method || 'Cash on Delivery',
            total_amount: parseFloat(orderPayload.total_amount),
            discount_amount: parseFloat(orderPayload.discount_amount || 0),
            final_amount: parseFloat(orderPayload.final_amount),
            status: 'Pending',
            items: orderPayload.items,
            created_at: new Date().toISOString()
        };

        let savedOrder = orderData;

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .insert([{
                        order_number: orderData.order_number,
                        customer_name: orderData.customer_name,
                        customer_email: orderData.customer_email,
                        customer_phone: orderData.customer_phone,
                        shipping_address: orderData.shipping_address,
                        city: orderData.city,
                        payment_method: orderData.payment_method,
                        total_amount: orderData.total_amount,
                        discount_amount: orderData.discount_amount,
                        final_amount: orderData.final_amount,
                        status: orderData.status,
                        items: orderData.items
                    }])
                    .select();

                if (!error && data && data.length > 0) {
                    console.log("✅ Saved Order to Supabase DB:", data[0]);
                    savedOrder = data[0];
                } else if (error) {
                    console.warn("Supabase order insert notice:", error.message);
                }
            } catch (err) {
                console.warn("Supabase order creation exception:", err);
            }
        }

        // Always ensure order is recorded in local memory / storage so Admin can immediately view it
        const localOrders = JSON.parse(localStorage.getItem('mini_daraz_orders') || '[]');
        localOrders.unshift(savedOrder);
        localStorage.setItem('mini_daraz_orders', JSON.stringify(localOrders));

        return { success: true, order: savedOrder };
    },

    async getOrders() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    localStorage.setItem('mini_daraz_orders', JSON.stringify(data));
                    return data;
                }
            } catch (err) {
                console.warn("Supabase load orders error:", err);
            }
        }

        return JSON.parse(localStorage.getItem('mini_daraz_orders') || '[]');
    },

    async updateOrderStatus(orderId, newStatus) {
        if (supabaseClient) {
            try {
                await supabaseClient
                    .from('orders')
                    .update({ status: newStatus })
                    .or(`id.eq.${orderId},order_number.eq.${orderId}`);
            } catch (err) {
                console.warn("Supabase status update error:", err);
            }
        }

        const orders = JSON.parse(localStorage.getItem('mini_daraz_orders') || '[]');
        const target = orders.find(o => o.id === orderId || o.order_number === orderId);
        if (target) {
            target.status = newStatus;
            localStorage.setItem('mini_daraz_orders', JSON.stringify(orders));
        }
        return { success: true };
    },

    async syncLocalProducts() {
        if (supabaseClient) {
            try {
                const { data } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
                if (data && data.length > 0) {
                    localStorage.setItem('mini_daraz_db_products', JSON.stringify(data));
                }
            } catch (e) {
                console.warn("Sync error:", e);
            }
        }
    }
};

window.DatabaseService = DatabaseService;
