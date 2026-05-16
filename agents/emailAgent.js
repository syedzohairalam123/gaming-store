const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Cart items ko email table mein convert karta hai
function itemRows(items) {
  return items.map(i => `
    <tr>
      <td style="padding:11px 16px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${i.name}</td>
      <td style="padding:11px 16px;border-bottom:1px solid #eee;color:#ff4747;font-weight:700;text-align:center;">x${i.qty}</td>
    </tr>`).join('');
}

// Customer ko confirmation email
async function sendCustomerConfirmation({ customerName, customerEmail, customerPhone, items }) {
  const transporter = createTransport();
  const total = items.reduce((s, i) => s + i.qty, 0);

  await transporter.sendMail({
    from: `"Gaming Store" <${process.env.ADMIN_EMAIL}>`,
    to: customerEmail,
    subject: '✅ Your Order Has Been Placed Successfully!',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
      <div style="background:#1e1e2d;padding:30px;text-align:center;">
        <h1 style="color:#ff4747;margin:0;">🎮 Gaming Store</h1>
        <p style="color:#ccc;margin:5px 0 0;">Order Confirmation</p>
      </div>
      <div style="padding:30px;background:#f9f9f9;">
        <h2 style="color:#333;">Hi ${customerName}, your order is confirmed! 🎉</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Thank you for shopping with Gaming Store! We've received your order and it's being processed.
        </p>

        <div style="background:#1e1e2d;border-radius:8px;overflow:hidden;margin:20px 0;">
          <div style="padding:12px 18px;border-bottom:1px solid #333;">
            <strong style="color:#ff4747;">🛒 ORDER ITEMS (${total} item${total!==1?'s':''})</strong>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:10px 16px;text-align:left;color:#666;font-size:12px;">PRODUCT</th>
                <th style="padding:10px 16px;text-align:center;color:#666;font-size:12px;">QTY</th>
              </tr>
            </thead>
            <tbody>${itemRows(items)}</tbody>
          </table>
        </div>

        <div style="background:#1e1e2d;color:white;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#ff4747;margin-top:0;">👤 Your Details</h3>
          <p style="margin:5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin:5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
          <p style="margin:5px 0;"><strong>Email:</strong> ${customerEmail}</p>
        </div>

        <div style="background:#fff3f3;border-left:4px solid #ff4747;padding:15px;border-radius:5px;">
          <p style="margin:0;color:#333;font-size:15px;">
            📦 <strong>Estimated Delivery:</strong> 1–2 Business Days<br/>
            📞 <strong>Support:</strong> +123-234-1234<br/>
            📧 <strong>Email:</strong> abc@gmail.com
          </p>
        </div>
        <p style="color:#888;font-size:13px;margin-top:20px;">
          Our team will contact you to confirm delivery. Thank you for choosing Gaming Store!
        </p>
      </div>
      <div style="background:#1e1e2d;padding:15px;text-align:center;">
        <p style="color:#888;margin:0;font-size:12px;">© 2025 Gaming Accessories. All rights reserved.</p>
      </div>
    </div>`
  });
  console.log(`📧 Customer confirmation sent to: ${customerEmail}`);
}

// Admin ko order notification
async function sendAdminNotification({ customerName, customerEmail, customerPhone, items }) {
  const transporter = createTransport();
  const total = items.reduce((s, i) => s + i.qty, 0);

  await transporter.sendMail({
    from: `"Gaming Store System" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛒 New Order (${total} item${total!==1?'s':''}) — ${customerName}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
      <div style="background:#ff4747;padding:25px;text-align:center;">
        <h1 style="color:white;margin:0;">🛒 New Order Received!</h1>
        <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;">${total} item${total!==1?'s':''} ordered</p>
      </div>
      <div style="padding:30px;background:#f9f9f9;">

        <div style="background:#fff;border-radius:8px;overflow:hidden;margin-bottom:20px;border:1px solid #ddd;">
          <div style="padding:12px 18px;background:#1e1e2d;border-bottom:1px solid #333;">
            <strong style="color:#ff4747;">ORDER ITEMS</strong>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:10px 16px;text-align:left;color:#666;font-size:12px;">PRODUCT</th>
                <th style="padding:10px 16px;text-align:center;color:#666;font-size:12px;">QTY</th>
              </tr>
            </thead>
            <tbody>${itemRows(items)}</tbody>
          </table>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:15px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd;">
          <tr style="background:#1e1e2d;color:white;">
            <th style="padding:12px;text-align:left;">Field</th>
            <th style="padding:12px;text-align:left;">Info</th>
          </tr>
          <tr><td style="padding:12px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:12px;border-bottom:1px solid #eee;">${customerName}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:12px;border-bottom:1px solid #eee;">${customerEmail}</td></tr>
          <tr><td style="padding:12px;"><strong>Phone</strong></td><td style="padding:12px;">${customerPhone}</td></tr>
        </table>

        <p style="margin-top:20px;color:#555;">Please process this order and contact the customer to confirm delivery.</p>
      </div>
      <div style="background:#1e1e2d;padding:15px;text-align:center;">
        <p style="color:#888;margin:0;font-size:12px;">Gaming Store Admin Panel — Automated Notification</p>
      </div>
    </div>`
  });
  console.log(`📨 Admin notification sent to: ${process.env.ADMIN_EMAIL}`);
}

module.exports = { sendCustomerConfirmation, sendAdminNotification };
