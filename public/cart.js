// ==========================================
// 1. CONSTANTS & STATE MANAGEMENT
// ==========================================
const ICONS = {
    'Gaming Keyboards': '⌨️',
    'Gaming Mice': '🖱️',
    'Gaming Mouse': '🖱️',
    'Gaming Headsets': '🎧',
    'Gaming Controllers': '🎮',
    'Gaming Monitors': '🖥️',
    'Gaming Chairs': '🪑',
    'Gaming Consoles': '🕹️',
    'Gaming Microphones': '🎙️',
    'Gaming VR Headsets': '🥽',
    'Gaming Mouse Pads': '🖱️',
    'Graphics Card': '💻',
    'Cooling System': '❄️',
    'RGB Lights Kits': '💡',
    'Streaming Gears': '📡',
    'Anti-Fatigue Mats': '🧘',
    'Monitor Stands': '🖥️'
};

const icon = n => ICONS[n] || '🎮';

let cart = JSON.parse(localStorage.getItem('gs_cart') || '[]');
let selectedPayment = 'cod'; // Payment method save karne ke liye
let directBuyProduct = null; // Agar Buy Now se click kiya ho

function save() {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
}

// ==========================================
// 2. CART OPERATIONS
// ==========================================
function addToCart(name, price = 0) { 
    const ex = cart.find(i => i.name === name);
    if (ex) {
        ex.qty++;
    } else {
        cart.push({ name, price: parseInt(price) || 0, qty: 1 });
    }
    save();
    updateUI();
    toast(name);
}

function removeItem(name) {
    cart = cart.filter(i => i.name !== name);
    save();
    updateUI();
}

function changeQty(name, d) {
    const it = cart.find(i => i.name === name);
    if (!it) return;
    
    it.qty += d;
    if (it.qty <= 0) {
        removeItem(name);
    } else {
        save();
        updateUI();
    }
}

function clearCart() {
    cart = [];
    save();
    updateUI();
}

function totalQty() {
    return cart.reduce((s, i) => s + i.qty, 0);
}

function totalAmt() { 
    return cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
}

// ==========================================
// 3. UI UPDATES
// ==========================================
function updateUI() {
    updateBadge();
    renderItems();
    syncSummary();
}

function updateBadge() {
    const t = totalQty();
    document.querySelectorAll('.cart-badge').forEach(b => {
        b.textContent = t;
        b.classList.toggle('hidden', t === 0);
    });
}

function renderItems() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;
    
    if (cart.length === 0) {
        list.innerHTML = `
            <div class="cart-empty">
                <div class="empty-icon">🛒</div>
                <p>Your cart is empty.<br>Add some gaming gear!</p>
            </div>`;
        return;
    }
    
    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-icon">${icon(item.name)}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-qty">Rs. ${(item.price || 0).toLocaleString()} x ${item.qty}</div>
            </div>
            <div class="cart-qty-controls">
                <button class="qty-btn" onclick="changeQty('${item.name}',-1)">−</button>
                <span class="qty-number">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty('${item.name}',1)">+</button>
            </div>
            <button class="cart-remove-btn" onclick="removeItem('${item.name}')">✕</button>
        </div>
    `).join('');
    
    const sc = document.getElementById('cartSummaryCount');
    if (sc) {
        sc.innerHTML = `${totalQty()} item${totalQty() !== 1 ? 's' : ''} <span style="float:right; color:#ff4747; font-weight:bold;">Total: Rs. ${totalAmt().toLocaleString()}</span>`;
    }
}

function syncSummary() {
    const c = document.getElementById('checkoutItemLines');
    if (!c) return;
    
    let amount = 0;
    
    if (directBuyProduct) {
        amount = directBuyProduct.price;
        c.innerHTML = `
            <div class="checkout-item-line" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${icon(directBuyProduct.name)} ${directBuyProduct.name} (x1)</span>
                <span>Rs. ${amount.toLocaleString()}</span>
            </div>
        `;
    } else {
        amount = totalAmt();
        c.innerHTML = cart.map(i => `
            <div class="checkout-item-line" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${icon(i.name)} ${i.name} (x${i.qty})</span>
                <span>Rs. ${((i.price || 0) * i.qty).toLocaleString()}</span>
            </div>
        `).join('');
    }

    // Total Amount display
    const totalContainer = document.getElementById('checkoutTotal');
    if (totalContainer) {
        totalContainer.textContent = `Rs. ${amount.toLocaleString()}`;
    }
    
    // Payment info section (if exists) update
    updatePaymentInfoText(selectedPayment, amount);
}

// ==========================================
// 4. TOAST NOTIFICATIONS
// ==========================================
function toast(name) {
    let t = document.getElementById('gsToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'gsToast';
        t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:#ff4747;color:#fff;padding:12px 24px;border-radius:50px;font-size:0.9rem;font-weight:600;z-index:99999;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 6px 25px rgba(255,71,71,0.5);pointer-events:none;white-space:nowrap;';
        document.body.appendChild(t);
    }
    
    t.textContent = `✅ ${name} added to cart!`;
    t.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(t._t);
    t._t = setTimeout(() => {
        t.style.transform = 'translateX(-50%) translateY(80px)';
    }, 2500);
}

// ==========================================
// 5. SIDEBAR, MODAL & PAYMENT CONTROLS
// ==========================================
function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderItems();
}

function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

function openCheckout(product = null) {
    directBuyProduct = product;
    if (cart.length === 0 && !directBuyProduct) return;
    
    syncSummary();
    closeCart();
    
    const m = document.getElementById('checkoutModal');
    if (m) {
        m.classList.add('active');
        document.getElementById('checkoutMsg').textContent = '';
        document.getElementById('checkoutName').value = '';
        document.getElementById('checkoutEmail').value = '';
        document.getElementById('checkoutPhone').value = '';
        if(document.getElementById('checkoutTxnId')) document.getElementById('checkoutTxnId').value = '';
        selectPayment('cod'); // Default payment selection
    }
}

function closeCheckout() {
    document.getElementById('checkoutModal')?.classList.remove('active');
    directBuyProduct = null;
}

function selectPayment(method) {
    selectedPayment = method;
    
    // Sabhi payment buttons reset
    document.querySelectorAll('.gs-pay-btn').forEach(b => {
        b.classList.remove('active');
        b.style.border = '1px solid #2a2a3e';
        b.style.background = 'transparent';
    });

    // Selected button highlight
    const activeBtn = document.querySelector(`.gs-pay-btn[data-method="${method}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.border = '2px solid #ff4747';
        activeBtn.style.background = 'rgba(255, 71, 71, 0.1)';
    }

    let amount = directBuyProduct ? directBuyProduct.price : totalAmt();
    updatePaymentInfoText(method, amount);
}

function updatePaymentInfoText(method, amount) {
    const txSection = document.getElementById('txIdSection');
    const txHint = document.getElementById('txHint');
    const txLabel = document.getElementById('txLabel');
    
    if (method === 'easypaisa') {
        if(txSection) txSection.style.display = 'block';
        if(txHint) txHint.innerHTML = `<span style="color:#2ecc71;">Send <b>Rs. ${amount.toLocaleString()}</b> to EasyPaisa: <b style="font-size:1.1rem; color:#fff;">03190958709</b></span>`;
        if(txLabel) txLabel.textContent = '📱 EasyPaisa Transaction ID';
    } else if (method === 'jazzcash') {
        if(txSection) txSection.style.display = 'block';
        if(txHint) txHint.innerHTML = `<span style="color:#e67e22;">Send <b>Rs. ${amount.toLocaleString()}</b> to JazzCash: <b style="font-size:1.1rem; color:#fff;">03001234567</b></span>`;
        if(txLabel) txLabel.textContent = '📱 JazzCash Transaction ID';
    } else {
        if(txSection) txSection.style.display = 'none';
    }
}

// ==========================================
// 6. API CALL / CHECKOUT
// ==========================================
async function placeOrder() {
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const txnId = document.getElementById('checkoutTxnId')?.value.trim() || '';
    const msg = document.getElementById('checkoutMsg');
    const btn = document.getElementById('checkoutSubmitBtn');

    if (!name || !email || !phone) {
        msg.textContent = '⚠️ Fill all fields.';
        msg.className = 'checkout-msg error';
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = '⚠️ Valid email needed.';
        msg.className = 'checkout-msg error';
        return;
    }

    if ((selectedPayment === 'easypaisa' || selectedPayment === 'jazzcash') && !txnId) {
        msg.textContent = '⚠️ Transaction ID is required for EasyPaisa/JazzCash.';
        msg.className = 'checkout-msg error';
        return;
    }
    
    if (!cart.length && !directBuyProduct) return;
    
    btn.disabled = true;
    btn.textContent = '⏳ PLACING...';
    msg.textContent = '';
    
    let itemsToOrder = directBuyProduct ? [{ name: directBuyProduct.name, qty: 1, price: directBuyProduct.price }] : cart;
    
    try {
        const res = await fetch(`${window.location.origin}/api/orders/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                customerName: name, 
                customerEmail: email, 
                customerPhone: phone, 
                items: itemsToOrder,
                paymentMethod: selectedPayment,
                transactionId: txnId
            })
        });
        const data = await res.json();
        
        if (data.success) {
            msg.textContent = '✅ Order placed! Check your email for confirmation.';
            msg.className = 'checkout-msg success';
            if(!directBuyProduct) clearCart();
            setTimeout(closeCheckout, 3500);
        } else {
            msg.textContent = '❌ ' + (data.errors?.join(', ') || data.message);
            msg.className = 'checkout-msg error';
        }
    } catch {
        msg.textContent = '❌ Something went wrong. Please try again.';
        msg.className = 'checkout-msg error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'CONFIRM ORDER';
    }
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Add to Cart Buttons
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const price = this.dataset.price || this.getAttribute('data-price') || 0;
            addToCart(this.dataset.product, price);
            this.textContent = '✓ Added!';
            this.classList.add('added');
            
            setTimeout(() => {
                this.textContent = '+ Add to Cart';
                this.classList.remove('added');
            }, 1500);
        });
    });

    // Buy Now Buttons
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const product = this.dataset.product || this.getAttribute('data-product');
            const price = parseInt(this.dataset.price || this.getAttribute('data-price')) || 0;
            
            if (product) {
                openCheckout({ name: product, price: price });
            }
        });
    });

    // Payment Buttons click event binding
    document.querySelectorAll('.gs-pay-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectPayment(this.dataset.method || this.getAttribute('data-method'));
        });
    });

    // Cart Navigation
    document.getElementById('cartNavBtn')?.addEventListener('click', openCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
    
    // Checkout Process & Clear Cart
    document.getElementById('cartCheckoutBtn')?.addEventListener('click', () => openCheckout());
    document.getElementById('cartClearBtn')?.addEventListener('click', () => {
        if (confirm('Clear cart?')) clearCart();
    });
    
    // Modal Controls
    document.getElementById('checkoutCloseBtn')?.addEventListener('click', closeCheckout);
    document.getElementById('checkoutSubmitBtn')?.addEventListener('click', placeOrder);
    
    // Initial Load
    updateUI();
});