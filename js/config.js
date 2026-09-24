// Mini Daraz Configuration & Pakistani Localization Constants

const CONFIG = {
    APP_NAME: 'Mini Daraz',
    TAGLINE: 'Pakistan’s Trusted Online Marketplace',
    VERSION: '2.0.0',
    CURRENCY_SYMBOL: '₨',
    CURRENCY_CODE: 'PKR',
    
    // Supabase Configuration
    SUPABASE_URL: 'https://coyzukueucgqkzywyvx.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveXp1a3VldWNncWt6YXl3eXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjk1MjYsImV4cCI6MjEwNTg0NTUyNn0.ZK1wHUzEJt_4fXvHBfkQHQ8GlA4VdIuVhR2KZav7hQk',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_yTaeE4BuEiGWuOGjRjed9g_xnJnNhld',

    // Local Storage Keys
    STORAGE_KEYS: {
        PRODUCTS: 'minidaraz_products_v2',
        CART: 'minidaraz_cart_v2',
        WISHLIST: 'minidaraz_wishlist_v2',
        ORDERS: 'minidaraz_orders_v2',
        USER: 'minidaraz_user_v2',
        SELECTED_CITY: 'minidaraz_selected_city_v2',
        CUSTOM_PRODUCTS: 'minidaraz_custom_products_v2'
    },

    // Pakistani Cities & Base Delivery Rates (in PKR)
    PAKISTAN_CITIES: [
        { name: 'Karachi', province: 'Sindh', deliveryDays: '1-2 Days', deliveryFee: 150, postalCode: '74200' },
        { name: 'Lahore', province: 'Punjab', deliveryDays: '1-2 Days', deliveryFee: 150, postalCode: '54000' },
        { name: 'Islamabad', province: 'Federal Capital', deliveryDays: '1-2 Days', deliveryFee: 160, postalCode: '44000' },
        { name: 'Rawalpindi', province: 'Punjab', deliveryDays: '1-2 Days', deliveryFee: 160, postalCode: '46000' },
        { name: 'Faisalabad', province: 'Punjab', deliveryDays: '2-3 Days', deliveryFee: 180, postalCode: '38000' },
        { name: 'Multan', province: 'Punjab', deliveryDays: '2-3 Days', deliveryFee: 180, postalCode: '60000' },
        { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', deliveryDays: '2-3 Days', deliveryFee: 200, postalCode: '25000' },
        { name: 'Quetta', province: 'Balochistan', deliveryDays: '3-4 Days', deliveryFee: 250, postalCode: '87300' },
        { name: 'Gujranwala', province: 'Punjab', deliveryDays: '2-3 Days', deliveryFee: 180, postalCode: '52250' },
        { name: 'Sialkot', province: 'Punjab', deliveryDays: '2-3 Days', deliveryFee: 180, postalCode: '51310' },
        { name: 'Hyderabad', province: 'Sindh', deliveryDays: '2-3 Days', deliveryFee: 180, postalCode: '71000' },
        { name: 'Sukkur', province: 'Sindh', deliveryDays: '3-4 Days', deliveryFee: 200, postalCode: '65200' },
        { name: 'Bahawalpur', province: 'Punjab', deliveryDays: '3-4 Days', deliveryFee: 200, postalCode: '63100' },
        { name: 'Sargodha', province: 'Punjab', deliveryDays: '2-3 Days', deliveryFee: 190, postalCode: '40100' },
        { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', deliveryDays: '3-4 Days', deliveryFee: 220, postalCode: '22010' },
        { name: 'Mardan', province: 'Khyber Pakhtunkhwa', deliveryDays: '3-4 Days', deliveryFee: 220, postalCode: '23200' },
        { name: 'Mirpur', province: 'Azad Kashmir', deliveryDays: '3-4 Days', deliveryFee: 240, postalCode: '10250' },
        { name: 'Muzaffarabad', province: 'Azad Kashmir', deliveryDays: '3-4 Days', deliveryFee: 240, postalCode: '13100' },
        { name: 'Gwadar', province: 'Balochistan', deliveryDays: '4-5 Days', deliveryFee: 290, postalCode: '91200' },
        { name: 'Gilgit', province: 'Gilgit-Baltistan', deliveryDays: '4-5 Days', deliveryFee: 290, postalCode: '15100' }
    ],

    // Pakistani Delivery Couriers
    COURIERS: [
        { id: 'daraz_express', name: 'Mini Daraz Express (Fastest)', time: '1-2 Working Days', logo: '🚀' },
        { id: 'tcs', name: 'TCS Express Pakistan', time: '2-3 Working Days', logo: '📦' },
        { id: 'leopards', name: 'Leopards Courier Service', time: '2-3 Working Days', logo: '🐆' },
        { id: 'call_courier', name: 'Call Courier Service', time: '3-4 Working Days', logo: '🚚' }
    ],

    // Supported Payment Methods
    PAYMENT_METHODS: [
        { id: 'cod', name: 'Cash on Delivery (COD)', desc: 'Pay with cash upon delivery at your doorstep across Pakistan.', icon: 'fa-money-bill-wave', popular: true },
        { id: 'jazzcash', name: 'JazzCash Mobile Account', desc: 'Instant & secure checkout via JazzCash wallet/voucher.', icon: 'fa-mobile-screen-button', popular: true },
        { id: 'easypaisa', name: 'Easypaisa Wallet', desc: 'Pay instantly with your Easypaisa Mobile Account balance or OTP.', icon: 'fa-wallet', popular: true },
        { id: 'card', name: 'Debit / Credit Card', desc: 'Pay with Visa, MasterCard, UnionPay or PayPak.', icon: 'fa-credit-card', popular: false },
        { id: 'bank_transfer', name: 'Direct Bank Transfer / Raast', desc: 'Transfer via Meezan, HBL, UBL, Bank Alfalah or Raast ID.', icon: 'fa-building-columns', popular: false }
    ],

    // Active Promo Voucher Codes
    COUPONS: {
        'DARAZ10': { discountPercent: 10, minSpend: 1500, maxDiscount: 1000, description: '10% OFF on orders over Rs. 1,500' },
        'AZADI50': { discountPercent: 20, minSpend: 3000, maxDiscount: 2500, description: 'Mega 20% Discount for Pakistani Shoppers' },
        'FIRSTBUY': { discountFixed: 300, minSpend: 2000, description: 'Flat Rs. 300 OFF on your first purchase' },
        'FREESHIP': { freeShipping: true, minSpend: 2500, description: 'Free Express Shipping anywhere in Pakistan' }
    },

    // Trust & Security Notice (Strict internal buying/selling policy)
    SECURITY_NOTICE: 'All buying and selling must be completed securely through Mini Daraz. For buyer protection and live parcel tracking, transactions outside Mini Daraz (such as WhatsApp) are strictly prohibited.'
};

// Freeze config to prevent modifications
if (typeof Object.freeze === 'function') {
    Object.freeze(CONFIG);
}
