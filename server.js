require('dotenv').config();
const express = require('express');

const cors    = require('cors');
const path    = require('path');
const { connectDB, seedProducts } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/contact',  require('./routes/contactRoutes'));

app.get('/',          (req,res) => res.sendFile(path.join(__dirname,'public','index.html')));
app.get('/admin',     (req,res) => res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('/login',     (req,res) => res.sendFile(path.join(__dirname,'public','login.html')));
app.get('/signup',    (req,res) => res.sendFile(path.join(__dirname,'public','signup.html')));
app.get('/my-orders', (req,res) => res.sendFile(path.join(__dirname,'public','my-orders.html')));

// Database connect karein, bina Vercel ko block kiye
connectDB()
  .then(() => seedProducts())
  .catch(err => console.error('DB connection failed:', err));

// Sirf aapke laptop (localhost) pe chalane ke liye, Vercel khud server handle karta hai
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Gaming Store LIVE: http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel:       http://localhost:${PORT}/admin`);
  });
}

// Yeh sabse zaroori line hai Vercel ko batane ke liye
module.exports = app;