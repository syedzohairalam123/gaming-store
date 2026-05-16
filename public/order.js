/**
 * ORDER MODAL SCRIPT
 * Handles Buy Now button click → shows modal → sends order to backend
 */

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('orderModal');
  const closeBtn = document.getElementById('closeModal');
  const confirmBtn = document.getElementById('confirmOrderBtn');
  const modalProductName = document.getElementById('modalProductName');
  const orderMsg = document.getElementById('orderMsg');
  const spinner = document.getElementById('orderSpinner');

  let selectedProduct = '';

  // Open modal on Buy Now click
  document.querySelectorAll('.buy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectedProduct = this.getAttribute('data-product');
      modalProductName.textContent = '🎮 Product: ' + selectedProduct;
      orderMsg.textContent = '';
      orderMsg.className = 'modal-msg';
      document.getElementById('orderName').value = '';
      document.getElementById('orderEmail').value = '';
      document.getElementById('orderPhone').value = '';
      modal.classList.add('active');
    });
  });

  // Close modal
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('active');
  });

  // Close on outside click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Confirm Order
  confirmBtn.addEventListener('click', async function () {
    const name = document.getElementById('orderName').value.trim();
    const email = document.getElementById('orderEmail').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();

    // Client-side validation
    if (!name || !email || !phone) {
      orderMsg.textContent = '⚠️ Please fill in all fields.';
      orderMsg.className = 'modal-msg error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      orderMsg.textContent = '⚠️ Please enter a valid email address.';
      orderMsg.className = 'modal-msg error';
      return;
    }

    // Show spinner
    confirmBtn.disabled = true;
    spinner.style.display = 'block';
    orderMsg.textContent = '';

    try {
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          productName: selectedProduct,
        }),
      });

      const data = await response.json();

      if (data.success) {
        orderMsg.textContent = '✅ Order placed! Check your email for confirmation.';
        orderMsg.className = 'modal-msg success';
        // Auto-close after 3 seconds
        setTimeout(function () {
          modal.classList.remove('active');
        }, 3000);
      } else {
        orderMsg.textContent = '❌ ' + (data.errors ? data.errors.join(', ') : data.message);
        orderMsg.className = 'modal-msg error';
      }
    } catch (err) {
      orderMsg.textContent = '❌ Something went wrong. Please try again.';
      orderMsg.className = 'modal-msg error';
    } finally {
      confirmBtn.disabled = false;
      spinner.style.display = 'none';
    }
  });
});
