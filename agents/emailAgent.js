const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.ADMIN_EMAIL, pass: process.env.EMAIL_PASS } });
}

const PAY_LABELS = { jazzcash: '📱 JazzCash', easypaisa: '📱 EasyPaisa', cod: '💵 Cash on Delivery' };
const STATUS_COLORS = { jazzcash: '#2ecc71', easypaisa: '#9b59b6', cod: '#e67e22' };

function itemRows(items) {
  return items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#333;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;color:#555;">x${i.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;color:#ff4747;font-weight:600;">Rs. ${(i.price*i.qty).toLocaleString()}</td>
    </tr>`).join('');
}

async function sendCustomerConfirmation({ customerName, customerEmail, customerPhone, items, paymentMethod, transactionId, orderId, totalAmount }) {
  const transporter = createTransport();
  const total = items.reduce((s,i) => s+i.qty, 0);
  const payLabel = PAY_LABELS[paymentMethod] || paymentMethod;
  const payColor = STATUS_COLORS[paymentMethod] || '#888';

  await transporter.sendMail({
    from: `"Gaming Store" <${process.env.ADMIN_EMAIL}>`,
    to: customerEmail,
    subject: `✅ Order #${orderId} Confirmed — Gaming Store`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#0d0d1a;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1a1a2e,#0d0d1a);padding:32px;text-align:center;border-bottom:3px solid #ff4747;">
        <h1 style="color:#ff4747;margin:0;font-size:1.9rem;">🎮 GAMING STORE</h1>
        <p style="color:#888;margin:6px 0 0;font-size:0.85rem;">ORDER CONFIRMED</p>
      </div>
      <div style="padding:30px;">
        <h2 style="color:#fff;margin:0 0 6px;">Hi ${customerName}! 🎉</h2>
        <p style="color:#aaa;line-height:1.7;margin-bottom:22px;">Your order <strong style="color:#ff4747;">#${orderId}</strong> has been received and is being processed.</p>

        <div style="background:#12121f;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #2a2a3e;">
          <div style="padding:12px 16px;background:#1a1a2e;display:flex;justify-content:space-between;">
            <strong style="color:#ff4747;">🛒 ORDER ITEMS (${total} item${total!==1?'s':''})</strong>
            <strong style="color:#ff4747;">Total: Rs. ${totalAmount.toLocaleString()}</strong>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <thead><tr style="background:#f5f5f5;">
              <th style="padding:10px 14px;text-align:left;color:#666;font-size:12px;">PRODUCT</th>
              <th style="padding:10px 14px;text-align:center;color:#666;font-size:12px;">QTY</th>
              <th style="padding:10px 14px;text-align:right;color:#666;font-size:12px;">PRICE</th>
            </tr></thead>
            <tbody>${itemRows(items)}</tbody>
            <tfoot><tr style="background:#fff3f3;">
              <td colspan="2" style="padding:12px 14px;font-weight:700;color:#333;">Total Amount</td>
              <td style="padding:12px 14px;text-align:right;font-weight:700;color:#ff4747;font-size:1.1rem;">Rs. ${totalAmount.toLocaleString()}</td>
            </tr></tfoot>
          </table>
        </div>

        <div style="background:#12121f;border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid #2a2a3e;">
          <strong style="color:#ff4747;font-size:0.85rem;display:block;margin-bottom:10px;">💳 PAYMENT INFO</strong>
          <p style="margin:5px 0;color:#ccc;"><b style="color:#fff;">Method:</b> <span style="color:${payColor};font-weight:600;">${payLabel}</span></p>
          ${transactionId ? `<p style="margin:5px 0;color:#ccc;"><b style="color:#fff;">Transaction ID:</b> <span style="color:#2ecc71;">${transactionId}</span></p>` : ''}
          <p style="margin:5px 0;color:#ccc;"><b style="color:#fff;">Status:</b> <span style="color:#f39c12;">⏳ Pending Verification</span></p>
        </div>

        <div style="background:#12121f;border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid #2a2a3e;">
          <strong style="color:#ff4747;font-size:0.85rem;display:block;margin-bottom:10px;">👤 YOUR DETAILS</strong>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Name:</b> ${customerName}</p>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Phone:</b> ${customerPhone}</p>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Email:</b> ${customerEmail}</p>
        </div>

        <div style="background:linear-gradient(135deg,#1a0808,#2a0a0a);border-radius:10px;padding:16px;border-left:4px solid #ff4747;">
          <p style="margin:4px 0;color:#ccc;font-size:0.9rem;">📦 <b style="color:#fff;">Delivery:</b> 1–2 Business Days</p>
          <p style="margin:4px 0;color:#ccc;font-size:0.9rem;">📞 <b style="color:#fff;">Support:</b> +123-234-1234</p>
          <p style="margin:4px 0;color:#ccc;font-size:0.9rem;">📧 <b style="color:#fff;">Email:</b> abc@gmail.com</p>
        </div>
      </div>
      <div style="background:#12121f;padding:14px;text-align:center;border-top:1px solid #2a2a3e;">
        <p style="color:#444;margin:0;font-size:0.75rem;">© 2025 Gaming Accessories. All rights reserved.</p>
      </div>
    </div>`
  });
  console.log(`📧 Customer email → ${customerEmail}`);
}

async function sendAdminNotification({ customerName, customerEmail, customerPhone, items, paymentMethod, transactionId, orderId, totalAmount }) {
  const transporter = createTransport();
  const total = items.reduce((s,i) => s+i.qty, 0);
  const payLabel = PAY_LABELS[paymentMethod] || paymentMethod;
  const payColor = STATUS_COLORS[paymentMethod] || '#888';

  await transporter.sendMail({
    from: `"Gaming Store" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛒 New Order #${orderId} — ${customerName} — Rs. ${totalAmount.toLocaleString()}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#0d0d1a;border-radius:12px;overflow:hidden;">
      <div style="background:#ff4747;padding:22px;text-align:center;">
        <h1 style="color:#fff;margin:0;">🛒 NEW ORDER #${orderId}</h1>
        <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;">Rs. ${totalAmount.toLocaleString()} — ${total} item${total!==1?'s':''}</p>
      </div>
      <div style="padding:28px;">
        <div style="background:#12121f;border-radius:10px;overflow:hidden;margin-bottom:18px;border:1px solid #2a2a3e;">
          <div style="padding:12px 16px;background:#1a1a2e;"><strong style="color:#ff4747;">ORDER ITEMS</strong></div>
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <thead><tr style="background:#f5f5f5;">
              <th style="padding:10px 14px;text-align:left;color:#666;font-size:12px;">PRODUCT</th>
              <th style="padding:10px 14px;text-align:center;color:#666;font-size:12px;">QTY</th>
              <th style="padding:10px 14px;text-align:right;color:#666;font-size:12px;">PRICE</th>
            </tr></thead>
            <tbody>${itemRows(items)}</tbody>
            <tfoot><tr style="background:#fff3f3;">
              <td colspan="2" style="padding:12px 14px;font-weight:700;">Total</td>
              <td style="padding:12px 14px;text-align:right;font-weight:700;color:#ff4747;">Rs. ${totalAmount.toLocaleString()}</td>
            </tr></tfoot>
          </table>
        </div>
        <div style="background:#12121f;border-radius:10px;padding:16px;margin-bottom:18px;border:1px solid #2a2a3e;">
          <strong style="color:#ff4747;display:block;margin-bottom:10px;">💳 PAYMENT</strong>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Method:</b> <span style="color:${payColor};font-weight:600;">${payLabel}</span></p>
          ${transactionId ? `<p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Transaction ID:</b> <span style="color:#2ecc71;font-size:1.1rem;">${transactionId}</span></p>` : '<p style="margin:4px 0;color:#f39c12;">⚠️ Cash on Delivery — collect on delivery</p>'}
        </div>
        <div style="background:#12121f;border-radius:10px;padding:16px;border:1px solid #2a2a3e;">
          <strong style="color:#ff4747;display:block;margin-bottom:10px;">👤 CUSTOMER</strong>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Name:</b> ${customerName}</p>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Email:</b> <a href="mailto:${customerEmail}" style="color:#ff4747;">${customerEmail}</a></p>
          <p style="margin:4px 0;color:#ccc;"><b style="color:#fff;">Phone:</b> <a href="tel:${customerPhone}" style="color:#ff4747;">${customerPhone}</a></p>
        </div>
      </div>
      <div style="background:#12121f;padding:14px;text-align:center;border-top:1px solid #2a2a3e;">
        <p style="color:#444;margin:0;font-size:0.75rem;">Gaming Store Admin — Automated Notification</p>
      </div>
    </div>`
  });
  console.log(`📨 Admin email → ${process.env.ADMIN_EMAIL}`);
}

module.exports = { sendCustomerConfirmation, sendAdminNotification };
