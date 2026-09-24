/**
 * MINI DARAZ - Default Product Seed Dataset
 */

window.INITIAL_PRODUCTS = [
    {
        id: 'prod_101',
        title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Industry-leading noise canceling with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather. Crystal clear hands-free calling.',
        price: 34999.00,
        original_price: 49999.00,
        discount_percent: 30,
        category: 'Electronics',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.9,
        reviews_count: 328,
        stock: 18,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
        id: 'prod_102',
        title: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
        description: 'Advanced health sensors, double tap gesture control, brighter Always-On Retina display, faster S9 SiP processor, IP6X dust resistant and swimproof.',
        price: 48999.00,
        original_price: 64999.00,
        discount_percent: 25,
        category: 'Electronics',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        reviews_count: 195,
        stock: 12,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
        id: 'prod_103',
        title: 'Classic Vintage Leather Biker Jacket for Men',
        description: 'Crafted from 100% genuine lambskin leather, features asymmetrical zip closure, quilted shoulder pads, and plush viscose lining for maximum warmth and style.',
        price: 8999.00,
        original_price: 13999.00,
        discount_percent: 36,
        category: 'Fashion',
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        reviews_count: 84,
        stock: 25,
        is_flash_sale: false,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
        id: 'prod_104',
        title: 'Minimalist Automatic Skeleton Dial Luxury Watch',
        description: 'Self-winding mechanical movement, sapphire glass crystal, stainless steel butterfly clasp, 50m water resistant casing with luminous dial hands.',
        price: 12499.00,
        original_price: 18999.00,
        discount_percent: 34,
        category: 'Fashion',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.9,
        reviews_count: 240,
        stock: 8,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: 'prod_105',
        title: 'Ergonomic Mesh Gaming & Executive Office Chair',
        description: 'Dynamic lumbar support, 3D armrests, breathable high-density mesh backrest, heavy-duty chrome base with 150kg weight capacity.',
        price: 15999.00,
        original_price: 22999.00,
        discount_percent: 30,
        category: 'Home & Living',
        image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.6,
        reviews_count: 112,
        stock: 14,
        is_flash_sale: false,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: 'prod_106',
        title: 'De\'Longhi Dedica Deluxe Pump Espresso Coffee Machine',
        description: 'Professional 15-bar Italian pump pressure, compact 6-inch slim stainless steel body, adjustable milk frother wand for lattes and cappuccinos.',
        price: 26999.00,
        original_price: 34999.00,
        discount_percent: 23,
        category: 'Home & Living',
        image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        reviews_count: 67,
        stock: 9,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 30).toISOString()
    },
    {
        id: 'prod_107',
        title: 'Advanced Anti-Aging Face Serum with Pure Vitamin C & Niacinamide',
        description: 'Dermatologist tested formula that fades dark spots, smooths fine lines, and hydrates skin deeply with triple hyaluronic acid blend.',
        price: 1850.00,
        original_price: 2800.00,
        discount_percent: 34,
        category: 'Beauty & Health',
        image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.9,
        reviews_count: 450,
        stock: 65,
        is_flash_sale: true,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
        id: 'prod_108',
        title: 'Premium Organic Earl Grey & Jasmine Green Tea Collection',
        description: '100 individually wrapped foil tea bags filled with whole leaf organic tea leaves harvested from high altitude gardens.',
        price: 950.00,
        original_price: 1400.00,
        discount_percent: 32,
        category: 'Groceries',
        image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        reviews_count: 210,
        stock: 100,
        is_flash_sale: false,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
        id: 'prod_109',
        title: 'Professional Anti-Burst Fitness Exercise & Yoga Ball (65cm)',
        description: 'Extra thick honeycomb PVC structure rated up to 300kg, includes quick inflation foot pump, perfect for core workouts and office desk seating.',
        price: 2100.00,
        original_price: 2999.00,
        discount_percent: 30,
        category: 'Sports & Fitness',
        image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.6,
        reviews_count: 88,
        stock: 35,
        is_flash_sale: false,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 50).toISOString()
    },
    {
        id: 'prod_110',
        title: 'Canon EOS M50 Mark II Mirrorless Digital Camera 4K',
        description: '24.1 Megapixel CMOS sensor, DIGIC 8 image processor, 4K UHD 24p video recording, Eye Detection AF, built-in Wi-Fi and Bluetooth.',
        price: 89999.00,
        original_price: 115000.00,
        discount_percent: 21,
        category: 'Electronics',
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.9,
        reviews_count: 54,
        stock: 5,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 60).toISOString()
    },
    {
        id: 'prod_111',
        title: 'Nike Air Max 270 Running Shoes for Men',
        description: 'Large Air Max unit delivers comfortable cushioning underfoot, stretchy inner sleeve creates a sock-like fit, breathable knit upper.',
        price: 14500.00,
        original_price: 19999.00,
        discount_percent: 27,
        category: 'Sports & Fitness',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        reviews_count: 310,
        stock: 22,
        is_flash_sale: true,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 70).toISOString()
    },
    {
        id: 'prod_112',
        title: 'Nordic Ceramic Dining Plates & Bowl Set (16 Pieces)',
        description: 'Matte glaze finish, microwave and dishwasher safe, lead-free non-toxic porcelain. Includes dinner plates, salad plates, cereal bowls, and mugs.',
        price: 9999.00,
        original_price: 14500.00,
        discount_percent: 31,
        category: 'Home & Living',
        image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        reviews_count: 42,
        stock: 16,
        is_flash_sale: false,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 80).toISOString()
    }
];

window.CATEGORIES_DATA = [
    { name: 'All Categories', slug: 'all', icon: 'grid' },
    { name: 'Electronics', slug: 'Electronics', icon: 'smartphone' },
    { name: 'Fashion', slug: 'Fashion', icon: 'shirt' },
    { name: 'Home & Living', slug: 'Home & Living', icon: 'home' },
    { name: 'Beauty & Health', slug: 'Beauty & Health', icon: 'sparkles' },
    { name: 'Groceries', slug: 'Groceries', icon: 'shopping-bag' },
    { name: 'Sports & Fitness', slug: 'Sports & Fitness', icon: 'activity' }
];

window.HERO_BANNERS = [
    {
        title: 'MEGA FLASH SALE',
        subtitle: 'Up to 70% OFF on Top Brand Tech & Fashion',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
        tag: 'LIMITED TIME ONLY',
        linkCategory: 'Electronics'
    },
    {
        title: 'FASHION WEEK 2026',
        subtitle: 'Trendy Apparel & Luxury Watches Collection',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        tag: 'NEW ARRIVALS',
        linkCategory: 'Fashion'
    },
    {
        title: 'SMART HOME ESSENTIALS',
        subtitle: 'Modern Furniture, Coffee Makers & Appliances',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        tag: 'BEST SELLERS',
        linkCategory: 'Home & Living'
    }
];
