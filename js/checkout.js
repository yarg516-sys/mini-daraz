// Mini Daraz In-App Pakistani Checkout & Order Confirmation Engine

const Checkout = {
    selectedPaymentMethod: 'cod',
    selectedCourier: 'Mini Daraz Express',

    // Open Checkout Modal
    openCheckout() {
        if (store.cart.length === 0) {
            UI.showToast('Your cart is empty. Add products before checking out.', 'warning');
            return;
        }

        UI.closeCartDrawer();
        const modal = document.getElementById('checkout-modal');
        if (!modal) return;

        Checkout.renderOrderSummary();
        Checkout.populateCitySelect();
        Checkout.renderPaymentInputs('cod');

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeCheckout() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Populate City Select in Checkout
    populateCitySelect() {
        const citySelect = document.getElementById('checkout-city');
        const provinceInput = document.getElementById('checkout-province');
        const postalInput = document.getElementById('checkout-postal');

        if (!citySelect) return;

        citySelect.innerHTML = CONFIG.PAKISTAN_CITIES.map(c => `
            <option value="${c.name}" ${store.selectedCity.name === c.name ? 'selected' : ''}>
                ${c.name} (${c.province}) - ₨ ${c.deliveryFee}
            </option>
        `).join('');

        if (provinceInput) provinceInput.value = store.selectedCity.province;
        if (postalInput) postalInput.value = store.selectedCity.postalCode;

        citySelect.onchange = (e) => {
            const cityName = e.target.value;
            const city = CONFIG.PAKISTAN_CITIES.find(c => c.name === cityName);
            if (city) {
                store.setSelectedCity(cityName);
                if (provinceInput) provinceInput.value = city.province;
                if (postalInput) postalInput.value = city.postalCode;
                Checkout.renderOrderSummary();
            }
        };
    },

    // Render Order Summary Breakdown
    renderOrderSummary() {
        const itemsList = document.getElementById('checkout-items-list');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const deliveryEl = document.getElementById('checkout-delivery');
        const discountEl = document.getElementById('checkout-discount');
        const totalEl = document.getElementById('checkout-total');

        if (itemsList) {
            itemsList.innerHTML = store.cart.map(item => `
                <div class="checkout-item-preview">
                    <img src="${item.imageUrl}" alt="${item.title}" class="checkout-item-img">
                    <div class="checkout-item-meta">
                        <div class="checkout-item-name">${item.title}</div>
                        <div class="checkout-item-sub">
                            <span>Qty: ${item.quantity}</span>
                            ${item.selectedColor ? `<span>• ${item.selectedColor}</span>` : ''}
                        </div>
                    </div>
                    <div class="checkout-item-total">${UI.formatPKR(item.price * item.quantity)}</div>
                </div>
            `).join('');
        }

        const subtotal = store.getCartSubtotal();
        const delivery = store.getCityDeliveryFee();
        const discount = store.getCartDiscount();
        const total = store.getCartTotal();

        if (subtotalEl) subtotalEl.innerText = UI.formatPKR(subtotal);
        if (deliveryEl) deliveryEl.innerText = delivery === 0 ? 'FREE' : UI.formatPKR(delivery);
        if (discountEl) discountEl.innerText = discount > 0 ? `-${UI.formatPKR(discount)}` : '₨ 0';
        if (totalEl) totalEl.innerText = UI.formatPKR(total);
    },

    // Switch Payment Method
    selectPaymentMethod(methodId) {
        Checkout.selectedPaymentMethod = methodId;
        document.querySelectorAll('.payment-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.method === methodId);
        });
        Checkout.renderPaymentInputs(methodId);
    },

    // Render Dynamic Form Inputs based on Payment Method
    renderPaymentInputs(method) {
        const container = document.getElementById('payment-inputs-container');
        if (!container) return;

        let html = '';
        switch (method) {
            case 'cod':
                html = `
                    <div class="payment-instruction-box">
                        <div class="instruction-header">
                            <i class="fa-solid fa-money-bill-wave text-emerald-600"></i>
                            <strong>Cash on Delivery (COD)</strong>
                        </div>
                        <p>Pay with exact cash in Pakistani Rupees (₨) to our delivery rider at your doorstep. Please keep the exact amount ready upon delivery.</p>
                        <div class="cod-pill"><i class="fa-solid fa-check"></i> Available for all Pakistani cities</div>
                    </div>
                `;
                break;

            case 'jazzcash':
                html = `
                    <div class="payment-form-card">
                        <div class="payment-brand-header">
                            <span class="jazzcash-tag">JazzCash Mobile Account</span>
                        </div>
                        <p class="payment-help-text">Enter your JazzCash registered mobile number. A prompt will be sent to your phone to approve the transaction via MPIN.</p>
                        <div class="form-group">
                            <label>JazzCash Mobile Number (11 digits)</label>
                            <div class="input-with-icon">
                                <i class="fa-solid fa-phone"></i>
                                <input type="tel" id="jazzcash-phone" placeholder="03001234567" maxlength="11" value="03001234567" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CNIC Last 6 Digits (Optional)</label>
                            <input type="text" id="jazzcash-cnic" placeholder="123456" maxlength="6">
                        </div>
                    </div>
                `;
                break;

            case 'easypaisa':
                html = `
                    <div class="payment-form-card">
                        <div class="payment-brand-header">
                            <span class="easypaisa-tag">Easypaisa Mobile Wallet</span>
                        </div>
                        <p class="payment-help-text">Enter your Easypaisa registered phone number. You will receive an instant push notification or SMS OTP to complete payment.</p>
                        <div class="form-group">
                            <label>Easypaisa Account Number</label>
                            <div class="input-with-icon">
                                <i class="fa-solid fa-wallet"></i>
                                <input type="tel" id="easypaisa-phone" placeholder="03451234567" maxlength="11" value="03451234567" required>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'card':
                html = `
                    <div class="payment-form-card">
                        <div class="payment-brand-header">
                            <span>Debit / Credit Card (Visa, MasterCard, PayPak)</span>
                        </div>
                        <div class="form-group">
                            <label>Cardholder Name</label>
                            <input type="text" id="card-name" placeholder="Muhammad Ali" value="Muhammad Shafeeq" required>
                        </div>
                        <div class="form-group">
                            <label>Card Number</label>
                            <div class="input-with-icon">
                                <i class="fa-regular fa-credit-card"></i>
                                <input type="text" id="card-number" placeholder="4214 5500 0000 1234" maxlength="19" value="4214 5500 0000 1234" required>
                            </div>
                        </div>
                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" id="card-exp" placeholder="MM/YY" maxlength="5" value="12/28" required>
                            </div>
                            <div class="form-group">
                                <label>CVV / CVC</label>
                                <input type="password" id="card-cvv" placeholder="•••" maxlength="4" value="888" required>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'bank_transfer':
                html = `
                    <div class="payment-form-card">
                        <div class="payment-brand-header">
                            <span>Direct Bank Transfer / Raast Instant Payment</span>
                        </div>
                        <div class="bank-details-box">
                            <div><strong>Bank Name:</strong> Meezan Bank Ltd / Raast</div>
                            <div><strong>Account Title:</strong> Mini Daraz Marketplace Pvt Ltd</div>
                            <div><strong>IBAN:</strong> PK89 MEZN 0001 2345 6789 0101</div>
                            <div><strong>Raast ID:</strong> 03001234567</div>
                        </div>
                        <div class="form-group">
                            <label>Sender Bank Account / Reference Number</label>
                            <input type="text" id="bank-ref" placeholder="Enter transfer reference / Transaction ID" value="TXN-PK-994821">
                        </div>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
    },

    // Apply Coupon inside Checkout
    applyCheckoutCoupon() {
        const input = document.getElementById('checkout-coupon-input');
        if (!input) return;

        const code = input.value;
        const res = store.applyCoupon(code);
        if (res.success) {
            UI.showToast(res.message, 'success');
            Checkout.renderOrderSummary();
        } else {
            UI.showToast(res.message, 'error');
        }
    },

    // Place Order Action
    async handlePlaceOrder(event) {
        if (event) event.preventDefault();

        // Retrieve form fields
        const nameInput = document.getElementById('checkout-name');
        const phoneInput = document.getElementById('checkout-phone');
        const emailInput = document.getElementById('checkout-email');
        const addressInput = document.getElementById('checkout-address');
        const citySelect = document.getElementById('checkout-city');
        const provinceInput = document.getElementById('checkout-province');
        const postalInput = document.getElementById('checkout-postal');

        if (!nameInput || !phoneInput || !addressInput) {
            UI.showToast('Please fill in all mandatory delivery details.', 'error');
            return;
        }

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput ? emailInput.value.trim() : '';
        const address = addressInput.value.trim();
        const city = citySelect ? citySelect.value : store.selectedCity.name;
        const province = provinceInput ? provinceInput.value : store.selectedCity.province;
        const postalCode = postalInput ? postalInput.value : store.selectedCity.postalCode;

        if (!name || !phone || !address) {
            UI.showToast('Please enter your Name, Phone Number, and Complete Address.', 'warning');
            return;
        }

        // Pakistani phone regex check (03XX-XXXXXXX or 03XXXXXXXXX)
        const phoneClean = phone.replace(/[^0-9]/g, '');
        if (phoneClean.length < 11) {
            UI.showToast('Please enter a valid 11-digit Pakistani phone number (e.g., 0300-1234567)', 'error');
            return;
        }

        const placeBtn = document.getElementById('btn-confirm-order');
        if (placeBtn) {
            placeBtn.disabled = true;
            placeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Order...`;
        }

        // Build complete order payload
        const orderPayload = {
            customerName: name,
            customerPhone: phone,
            customerEmail: email || `${phoneClean}@customer.minidaraz.pk`,
            deliveryAddress: address,
            city: city,
            province: province,
            postalCode: postalCode,
            items: [...store.cart],
            subtotal: store.getCartSubtotal(),
            deliveryFee: store.getCityDeliveryFee(),
            discountAmount: store.getCartDiscount(),
            totalAmount: store.getCartTotal(),
            paymentMethod: Checkout.selectedPaymentMethod,
            courier: Checkout.selectedCourier
        };

        try {
            const placedOrder = await store.placeOrder(orderPayload);
            Checkout.closeCheckout();
            Checkout.showOrderConfirmation(placedOrder);
            UI.showToast(`Order #${placedOrder.orderNumber} successfully placed!`, 'success');
        } catch (err) {
            console.error(err);
            UI.showToast('Failed to place order. Please try again.', 'error');
        } finally {
            if (placeBtn) {
                placeBtn.disabled = false;
                placeBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Place Secure Order`;
            }
        }
    },

    // Show Order Confirmation Screen
    showOrderConfirmation(order) {
        const modal = document.getElementById('order-confirmation-modal');
        const container = document.getElementById('confirmation-details');
        if (!modal || !container) return;

        const paymentNames = {
            cod: 'Cash on Delivery (COD)',
            jazzcash: 'JazzCash Mobile Account',
            easypaisa: 'Easypaisa Mobile Wallet',
            card: 'Debit/Credit Card',
            bank_transfer: 'Bank Transfer / Raast'
        };

        container.innerHTML = `
            <div class="confirmation-success-hero">
                <div class="success-icon-circle">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h2>Shukriya! Your Order is Confirmed</h2>
                <p>Order ID: <strong class="order-id-highlight">${order.orderNumber}</strong></p>
                <div class="tracking-pill">
                    <span>Tracking Number: <strong>${order.trackingNumber}</strong></span>
                    <span>• Courier: <strong>${order.courier}</strong></span>
                </div>
            </div>

            <!-- Order Tracking Stepper -->
            <div class="order-tracking-timeline">
                <div class="step-node active">
                    <div class="node-dot"><i class="fa-solid fa-check"></i></div>
                    <div class="node-label">Order Placed</div>
                </div>
                <div class="step-line active"></div>
                <div class="step-node active">
                    <div class="node-dot"><i class="fa-solid fa-box"></i></div>
                    <div class="node-label">Processing</div>
                </div>
                <div class="step-line"></div>
                <div class="step-node">
                    <div class="node-dot"><i class="fa-solid fa-truck-fast"></i></div>
                    <div class="node-label">Shipped</div>
                </div>
                <div class="step-line"></div>
                <div class="step-node">
                    <div class="node-dot"><i class="fa-solid fa-house-chimney"></i></div>
                    <div class="node-label">Delivered</div>
                </div>
            </div>

            <div class="confirmation-grid">
                <!-- Delivery Info -->
                <div class="conf-card">
                    <h4><i class="fa-solid fa-location-dot"></i> Delivery Details</h4>
                    <p><strong>Recipient:</strong> ${order.customerName}</p>
                    <p><strong>Phone:</strong> ${order.customerPhone}</p>
                    <p><strong>Address:</strong> ${order.deliveryAddress}, ${order.city}, ${order.province}</p>
                    <p><strong>Est. Delivery:</strong> 1-3 Business Days</p>
                </div>

                <!-- Payment Info -->
                <div class="conf-card">
                    <h4><i class="fa-solid fa-credit-card"></i> Payment Summary</h4>
                    <p><strong>Method:</strong> ${paymentNames[order.paymentMethod] || order.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> <span class="status-badge ${order.paymentStatus.includes('Paid') ? 'paid' : 'pending'}">${order.paymentStatus}</span></p>
                    <p><strong>Subtotal:</strong> ${UI.formatPKR(order.subtotal)}</p>
                    <p><strong>Delivery Fee:</strong> ${UI.formatPKR(order.deliveryFee)}</p>
                    ${order.discountAmount > 0 ? `<p><strong>Voucher Savings:</strong> -${UI.formatPKR(order.discountAmount)}</p>` : ''}
                    <p class="conf-total-row"><strong>Total Amount:</strong> <span class="text-orange-600">${UI.formatPKR(order.totalAmount)}</span></p>
                </div>
            </div>

            <!-- Ordered Items List -->
            <div class="conf-items-section">
                <h4>Ordered Items (${order.items.length})</h4>
                <div class="conf-items-table">
                    ${order.items.map(item => `
                        <div class="conf-item-row">
                            <img src="${item.imageUrl}" alt="${item.title}" class="conf-item-img">
                            <div class="conf-item-title-box">
                                <div>${item.title}</div>
                                ${item.selectedColor ? `<small>Variant: ${item.selectedColor}</small>` : ''}
                            </div>
                            <div class="conf-item-qty">Qty: ${item.quantity}</div>
                            <div class="conf-item-price">${UI.formatPKR(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="conf-action-buttons">
                <button class="btn-primary" onclick="Checkout.closeConfirmation(); UI.openOrdersView();">
                    <i class="fa-solid fa-receipt"></i> View in My Orders
                </button>
                <button class="btn-secondary" onclick="window.print();">
                    <i class="fa-solid fa-print"></i> Print Invoice Receipt
                </button>
                <button class="btn-outline" onclick="Checkout.closeConfirmation();">
                    Continue Shopping
                </button>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeConfirmation() {
        const modal = document.getElementById('order-confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};
