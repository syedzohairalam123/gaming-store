const express = require('express');
const router = express.Router();
const { validateOrder } = require('../agents/validationAgent');
const { sendCustomerConfirmation, sendAdminNotification } = require('../agents/emailAgent');

router.post('/place', async (req, res) => {
  const { customerName, customerEmail, customerPhone, items, productName } = req.body;

  // Cart (items array) aur purana single product dono support karta hai
  const orderItems = (items && items.length > 0)
    ? items
    : [{ name: productName || 'Unknown Product', qty: 1 }];

  // Validation
  const validation = validateOrder({
    customerName,
    customerEmail,
    customerPhone,
    productName: orderItems[0].name
  });

  if (!validation.isValid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  // Emails bhejo
  try {
    await Promise.all([
      sendCustomerConfirmation({ customerName, customerEmail, customerPhone, items: orderItems }),
      sendAdminNotification({ customerName, customerEmail, customerPhone, items: orderItems }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Order placed! Confirmation sent to ${customerEmail}.`,
    });
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Order received but email could not be sent. Please contact support.',
    });
  }
});

module.exports = router;
