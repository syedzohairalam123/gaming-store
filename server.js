require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server start karne ka sahi tarika (Radmin aur Vercel dono ke liye)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server is officially LIVE!`);
    console.log(`🏠 Local access: http://localhost:${PORT}`);
    
    // Yahan apni asli Radmin IP likh dein (Sirf dekhne ke liye)
    // Maslan agar aapki IP 26.100.20.30 hai toh niche wo likhein:
    console.log(`🌐 Radmin Network: http://26.xxx.xxx.xxx:${PORT}`); 
    
    console.log(`\n💡 Tip: Make sure your Radmin VPN is ON and Firewall is allowing Node.js\n`);
});