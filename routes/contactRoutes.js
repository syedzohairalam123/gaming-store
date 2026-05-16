/**
 * CONTACT ROUTES
 * Handles: POST /api/contact/send
 * Sends contact form message to admin email
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Gaming Store Contact" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 Contact Form: ${subject} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #1e1e2d; padding: 25px; text-align: center;">
            <h1 style="color: #ff4747; margin: 0;">New Contact Message</h1>
          </div>
          <div style="padding: 30px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #ff4747;">
              ${message}
            </div>
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Gaming Store" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: '✅ We received your message!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <div style="background-color: #1e1e2d; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ff4747; margin: 0;">Gaming Store</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hi ${name}!</h2>
            <p>Thanks for reaching out. We received your message and will get back to you within 24 hours.</p>
            <p style="color: #888;">— Gaming Store Team</p>
          </div>
          <div style="background-color: #1e1e2d; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #888; margin: 0; font-size: 13px;">© 2025 Gaming Accessories. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send message. Try again.' });
  }
});

module.exports = router;
