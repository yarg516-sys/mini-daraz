# Mini Daraz - Pakistan’s Premier E-Commerce Marketplace

**Mini Daraz** is a modern, high-performance, competition-ready Pakistani e-commerce marketplace web application designed for customers and sellers across **Pakistan**. Built with modern HTML5, CSS3, ES6+ JavaScript, and integrated with **Supabase Cloud Backend** with offline-resilient local sync.

---

## 🌟 Key Features

### 1. 🇵🇰 Pakistan-Focused E-Commerce Experience
- **Currency**: Formatted in Pakistani Rupees (**₨ / PKR**).
- **Nationwide Delivery Network**: 20+ Pakistani cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad, Sukkur, Bahawalpur, etc.) with real delivery day estimates and accurate city fee calculations.
- **Pakistani Couriers**: TCS Express Pakistan, Leopards Courier, Call Courier, and Mini Daraz Express.
- **Strict In-App Security**: Complete in-platform order management and live parcel tracking (**Zero WhatsApp redirection**).

### 2. 🛍️ 32+ Pre-Loaded Realistic Products Across 15 Categories
- Mobile Phones (PTA Approved Samsung Galaxy S24 Ultra, Xiaomi Redmi Note 13 Pro, iPhone 15, Infinix Note 40 Pro)
- Laptops & Computers (Apple MacBook Air M2, HP Victus RTX 3050, Dell UltraSharp 4K)
- Audio & Headphones (Audionic Airbud 550, Sony WH-1000XM5, Soundpeats Free2, JBL Flip 6)
- Smart Watches (Dany Rex Pro, Amazfit GTR 4)
- Gaming & Electronics (Sony PS5 Slim, Logitech G502 HERO, Haier 55" 4K Smart TV, T-Dagger Keyboard)
- Fashion, Shoes & Bags (J. Junaid Jamshed Kurta, Alkaram Studio 3-Piece Lawn, Servis Loafers, Stylo Bag)
- Beauty, Home & Sports (Saeed Ghani Rosemary Serum, Dawlance Air Fryer, CA Plus 15000 Sialkot Cricket Bat)
- Books & Accessories (Peer-e-Kamil Hardcover, Baseus 65W GaN Charger, Remax 30,000mAh Power Bank)

### 3. 💳 In-App Pakistani Payment Gateways (Simulated / Demo Ready)
- **Cash on Delivery (COD)** with exact amount instructions.
- **JazzCash Mobile Account** with simulated 11-digit phone entry and MPIN prompt.
- **Easypaisa Mobile Wallet** with simulated push OTP authorization.
- **Debit / Credit Card** (Visa, MasterCard, PayPak, UnionPay).
- **Direct Bank Transfer / Raast** (Meezan Bank, HBL, UBL, Raast ID).

### 4. 🛒 Complete End-to-End Shopping Flow
```
Homepage → Product Detail Modal (HD Gallery & Specs) → Add to Cart → Cart Drawer → In-App Checkout (City & Payment Selection) → Place Order → Order Confirmation (Tracking ID & Timeline) → My Orders Tracking
```

### 5. 🧑‍💼 Seller Center & Admin Dashboard (`admin.html` or in-app switch)
- **Revenue Overview**: Total Revenue (₨), Total Orders, Active Catalog Items, Average Order Value.
- **Product Inventory Manager**: Add new products (with real image preview, Pakistani city selector, specs), Edit products, and Delete items.
- **Customer Orders Fulfillment**: View incoming orders, inspect customer phone & address, and update status (`Processing` → `Shipped` → `Delivered`).

### 6. 🎟️ Discount Vouchers
- `DARAZ10`: 10% OFF on orders over Rs. 1,500
- `AZADI50`: 20% OFF on orders over Rs. 3,000
- `FIRSTBUY`: Flat Rs. 300 OFF on orders over Rs. 2,000
- `FREESHIP`: Free Express Delivery anywhere in Pakistan

---

## 🚀 How to Run Mini Daraz

1. Open `index.html` in any web browser (Chrome, Edge, Firefox, Safari) or serve with Live Server / HTTP server.
2. Open `admin.html` to access the dedicated Seller & Merchant Center (or click "Seller Center" in the top navigation).

### 🗄️ Supabase Cloud Setup (Optional)
The project comes pre-configured with the provided Supabase project (`coyzukueucgqkzywyvx`). If you want to create or reset tables directly on Supabase Cloud:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard/project/coyzukueucgqkzywyvx).
2. Go to **SQL Editor**.
3. Copy and run the contents of [`supabase_schema.sql`](supabase_schema.sql).
4. The application also includes an **automatic local fallback engine** so it functions 100% smoothly offline and during live evaluations even if internet connectivity drops!
