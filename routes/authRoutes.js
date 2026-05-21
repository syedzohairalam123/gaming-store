const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const { connectDB, User } = require('../database');

const SECRET = process.env.JWT_SECRET || 'gaming_store_jwt_2025';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'All fields required.' });
    if (password.length < 6) return res.status(400).json({ success:false, message:'Password must be 6+ characters.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, message:'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone: phone||'' });
    const token = jwt.sign({ id:user._id, name:user.name, email:user.email, role:'customer' }, SECRET, { expiresIn:'7d' });
    return res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email } });
  } catch(e) { console.error(e); return res.status(500).json({ success:false, message:'Server error.' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success:false, message:'Email not found.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success:false, message:'Wrong password.' });

    const token = jwt.sign({ id:user._id, name:user.name, email:user.email, role:'customer' }, SECRET, { expiresIn:'7d' });
    return res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email } });
  } catch(e) { console.error(e); return res.status(500).json({ success:false, message:'Server error.' }); }
});

// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password !== (process.env.ADMIN_PASSWORD || 'admin123')) return res.status(401).json({ success:false, message:'Wrong password.' });
  const token = jwt.sign({ role:'admin', name:'Admin' }, SECRET, { expiresIn:'1d' });
  return res.json({ success:true, token });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success:false, message:'Token required.' });
    
    const decoded = jwt.verify(token, SECRET);
    
    // Agar Admin hai toh simple response dein
    if (decoded.role === 'admin') {
        return res.json({ success:true, user: { name: 'Admin', role: 'admin' } });
    }

    // Agar User hai toh DB se search karein
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'User not found.' });
    return res.json({ success:true, user });
  } catch { return res.status(401).json({ success:false, message:'Invalid token.' }); }
});
module.exports = router;
