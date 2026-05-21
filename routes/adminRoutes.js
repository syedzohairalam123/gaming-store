const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { connectDB, User, Product, Order } = require('../database');

const SECRET = process.env.JWT_SECRET || 'gaming_store_jwt_2025';

function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({success:false, message:'Admin access required.'});
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({success:false, message:'Admins only.'});
    req.user = decoded; next();
  } catch { return res.status(401).json({success:false, message:'Invalid token.'}); }
}

router.get('/stats', adminAuth, async (req, res) => {
  await connectDB();
  const orders = await Order.find({});
  const users  = await User.countDocuments();
  return res.json({ success:true, stats: {
    total:     orders.length,
    pending:   orders.filter(o=>o.status==='pending').length,
    delivered: orders.filter(o=>o.status==='delivered').length,
    cancelled: orders.filter(o=>o.status==='cancelled').length,
    revenue:   orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.totalAmount||0),0),
    users
  }});
});

router.get('/orders', adminAuth, async (req, res) => {
  await connectDB();
  const { status='', search='' } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) { const q=new RegExp(search,'i'); query.$or=[{customerName:q},{customerEmail:q}]; }
  const orders = await Order.find(query).sort({ createdAt:-1 });
  return res.json({ success:true, orders });
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
  await connectDB();
  const { status } = req.body;
  const valid = ['pending','processing','shipped','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({success:false, message:'Invalid status.'});
  
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) {
    return res.status(400).json({success:false, message:'Invalid Order ID format.'});
  }

  await Order.findOneAndUpdate({ orderId: orderId }, { status });
  return res.json({ success:true, message:`Order #${orderId} → ${status}` });
});

router.get('/products', adminAuth, async (req, res) => {
  await connectDB();
  const products = await Product.find({}).sort({ pid:1 });
  return res.json({ success:true, products });
});

router.put('/products/:id', adminAuth, async (req, res) => {
  await connectDB();
  const { price, stock } = req.body;

  const pid = parseInt(req.params.id);
  if (isNaN(pid)) {
    return res.status(400).json({success:false, message:'Invalid Product ID format.'});
  }

  await Product.findOneAndUpdate({ pid: pid }, { price:parseInt(price)||0, stock:parseInt(stock)||0 });
  return res.json({ success:true, message:'Updated.' });
});

router.get('/users', adminAuth, async (req, res) => {
  await connectDB();
  const users = await User.find({}).select('-password').sort({ createdAt:-1 });
  return res.json({ success:true, users });
});

module.exports = router;