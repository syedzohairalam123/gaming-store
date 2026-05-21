const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { connectDB, Product, Order, getNextId } = require('../database');
const { sendCustomerConfirmation, sendAdminNotification } = require('../agents/emailAgent');

const SECRET = process.env.JWT_SECRET || 'gaming_store_jwt_2025';

router.post('/place', async (req, res) => {
  try {
    await connectDB();
    const { customerName, customerEmail, customerPhone, items, productName, paymentMethod='cod', transactionId='' } = req.body;
    const orderItems = (items && Array.isArray(items) && items.length > 0) ? items : [{ name: productName||'Unknown', qty:1, price:0 }];

    if (!customerName||customerName.trim().length<2) return res.status(400).json({success:false,errors:['Valid name required.']});
    if (!customerEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return res.status(400).json({success:false,errors:['Valid email required.']});
    if (!customerPhone||customerPhone.trim().length<7) return res.status(400).json({success:false,errors:['Valid phone required.']});
    if (['jazzcash','easypaisa'].includes(paymentMethod)&&!transactionId.trim()) return res.status(400).json({success:false,errors:['Transaction ID required.']});

    const products = await Product.find({});
    let totalAmount = 0;
    const enrichedItems = orderItems.map(item => {
      const product = products.find(p => p.name === item.name);
      const price   = product ? product.price : (item.price||0);
      totalAmount  += price * (item.qty||1);
      return { name:item.name, qty:item.qty||1, price };
    });

    const orderId = await getNextId('orderId');
    await Order.create({ orderId, customerName, customerEmail, customerPhone, items:enrichedItems, paymentMethod, transactionId:transactionId.trim(), status:'pending', totalAmount });

    await Promise.all([
      sendCustomerConfirmation({ customerName, customerEmail, customerPhone, items:enrichedItems, paymentMethod, transactionId, orderId, totalAmount }),
      sendAdminNotification({ customerName, customerEmail, customerPhone, items:enrichedItems, paymentMethod, transactionId, orderId, totalAmount }),
    ]);

    return res.json({ success:true, message:`Order #${orderId} placed!`, orderId });
  } catch(err) {
    console.error('Order error:', err.message);
    return res.status(500).json({ success:false, message:'Order saved but email failed. Contact support.' });
  }
});

router.get('/my', async (req, res) => {
  try {
    await connectDB();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({success:false, message:'Login required.'});
    const user  = jwt.verify(token, SECRET);
    const orders = await Order.find({ customerEmail: user.email }).sort({ createdAt:-1 });
    return res.json({ success:true, orders });
  } catch { return res.status(401).json({success:false, message:'Invalid token.'}); }
});

module.exports = router;
