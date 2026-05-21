const express = require('express');
const router  = express.Router();
const { connectDB, Product } = require('../database');

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { search='', category='' } = req.query;
    const query = {};
    if (search.trim())              query.name = { $regex: search, $options: 'i' };
    if (category && category!=='all') query.category = category;
    const products = await Product.find(query).sort({ pid: 1 });
    return res.json({ success:true, products });
  } catch(e) { return res.status(500).json({ success:false, message:'Error.' }); }
});

router.get('/featured', async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find({ featured:true }).sort({ pid:1 });
    return res.json({ success:true, products });
  } catch(e) { return res.status(500).json({ success:false, message:'Error.' }); }
});

router.get('/categories', async (req, res) => {
  try {
    await connectDB();
    const cats = await Product.distinct('category');
    return res.json({ success:true, categories: cats });
  } catch(e) { return res.status(500).json({ success:false, message:'Error.' }); }
});

module.exports = router;
