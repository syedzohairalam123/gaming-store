/**
 * DATABASE — MongoDB Atlas
 * Works on both localhost AND Vercel
 * Set MONGODB_URI in .env and Vercel environment variables
 */
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ MongoDB Connected');
}

// ── Schemas ────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  pid:         { type: Number, required: true, unique: true },
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  price:       { type: Number, required: true },
  stock:       { type: Number, default: 50 },
  featured:    { type: Boolean, default: false },
  image:       { type: String, default: '' },
  description: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
  orderId:       { type: Number, required: true, unique: true },
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items:         { type: Array,  required: true },
  paymentMethod: { type: String, default: 'cod' },
  transactionId: { type: String, default: '' },
  status:        { type: String, default: 'pending' },
  totalAmount:   { type: Number, default: 0 },
  createdAt:     { type: Date,   default: Date.now }
});

const CounterSchema = new mongoose.Schema({
  name:  { type: String, required: true, unique: true },
  value: { type: Number, default: 1 }
});

const User    = mongoose.models.User    || mongoose.model('User',    UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order   = mongoose.models.Order   || mongoose.model('Order',   OrderSchema);
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

// ── Auto-increment helper ──────────────────────────────────
async function getNextId(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

// ── Seed products if empty ─────────────────────────────────
async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const products = [
    { pid:1,  name:'Gaming Keyboards',   category:'keyboards',   price:4500,  stock:50, featured:true,  image:'https://media.istockphoto.com/id/1356366044/photo/black-mechanical-keyboard-on-white-background-blue-neon-light.jpg?s=612x612&w=0&k=20&c=GhpZsK36fsuoSP-4-pR7ma9UeIApatkBq6M-bnXFf1c=',       description:'Experience precision and speed with our top-quality gaming keyboards.' },
    { pid:2,  name:'Gaming Mice',        category:'mice',        price:2800,  stock:45, featured:true,  image:'https://media.istockphoto.com/id/1197265704/photo/green-gaming-mouse-on-stone-texture-table.jpg?s=612x612&w=0&k=20&c=ePityE1dOXLc2-ANcDYakN7qJQkIHA9vV8rFP_5E1ss=',                             description:'Enhance your accuracy with our ergonomic gaming mice.' },
    { pid:3,  name:'Gaming Headsets',    category:'headsets',    price:3500,  stock:60, featured:true,  image:'https://media.istockphoto.com/id/1306073552/vector/black-realistic-headphones-gaming-headset-listening-audio-electronic-device-3d-stereo-earbuds.jpg?s=612x612&w=0&k=20&c=daYW6kyFW9w1aIDs30DboVRsbedL2mR8zXpsrjRq_94=', description:'Immerse yourself in the game with crystal-clear audio.' },
    { pid:4,  name:'Gaming Controllers', category:'controllers', price:5500,  stock:40, featured:true,  image:'https://media.istockphoto.com/id/1560833158/photo/game-controller-with-purple-lit-keyboard-amidst-various-wireless-devices.jpg?s=612x612&w=0&k=20&c=eOYotPVhXSiFkrSLHsDjpUENG3ev7bnbt-iK6RS6KAM=',       description:'Take control with our versatile gaming controllers.' },
    { pid:5,  name:'Gaming Monitors',    category:'monitors',    price:45000, stock:20, featured:true,  image:'https://media.istockphoto.com/id/1195376803/photo/gamer-focused-on-his-game.webp?a=1&b=1&s=612x612&w=0&k=20&c=lC_JEmBAsjdhG5liwuY_ZUorDUFxjDzALeNeodj21pY=',                                    description:'Enjoy stunning visuals and smooth gameplay.' },
    { pid:6,  name:'Gaming Chairs',      category:'chairs',      price:18000, stock:30, featured:true,  image:'https://media.istockphoto.com/id/1305168473/photo/all-angels-view-of-black-and-yellow-office-chair-isolated-on-white.webp?a=1&b=1&s=612x612&w=0&k=20&c=WfLoC5TDJSRiDtvZH8o8U90WP84pw5euOsPtq0xUTsE=',      description:'Maximize your comfort during long gaming sessions.' },
    { pid:7,  name:'Gaming Consoles',    category:'consoles',    price:95000, stock:15, featured:true,  image:'https://images.unsplash.com/photo-1526509706191-c268f28e9ecb?w=500&auto=format&fit=crop&q=60',                                                                                                                description:'Unlock next-level gaming with our consoles.' },
    { pid:8,  name:'Gaming Microphones', category:'microphones', price:8500,  stock:35, featured:true,  image:'https://media.istockphoto.com/id/1648300438/photo/studio-microphone-with-headphones-and-neon-lighting.webp?a=1&b=1&s=612x612&w=0&k=20&c=wbUfqHv_w0MkQle0NSD-rnqv7PH2SZ22ynNMcgQT3hw=',              description:'Crystal-clear communication and professional-grade audio.' },
    { pid:9,  name:'Gaming VR Headsets', category:'vr',          price:35000, stock:10, featured:false, image:'https://media.istockphoto.com/id/1358696742/photo/generic-virtual-reality-headset-with-left-and-right-hand-controllers.jpg?s=612x612&w=0&k=20&c=Px_l_82SHMGB7e5vSTvgrkTGbnUyMFm6k_4NeFnDmRY=',          description:'Immerse yourself in stunning virtual worlds.' },
    { pid:10, name:'Gaming Mouse Pads',  category:'accessories', price:1200,  stock:100,featured:false, image:'https://media.istockphoto.com/id/1560831922/photo/digital-tablet-amidst-various-wireless-devices.jpg?s=612x612&w=0&k=20&c=90aN2csvW7uzwXvD-RlQKUu23nbH_vYb8yqXHDbhh0k=',                              description:'Enhance precision with our high-performance mouse pads.' },
    { pid:11, name:'Graphics Card',      category:'pc-parts',    price:75000, stock:8,  featured:false, image:'https://media.istockphoto.com/id/1336070398/photo/video-card-with-fan-gaming-graphics-card-for-video-games-and-cryptocurrency-mining-game-video.jpg?s=612x612&w=0&k=20&c=4WwYhSFvcuSV2Ga7VefUnPD8_RINpR8q0AGMco8AUOQ=', description:'Powerful graphics cards for high-resolution visuals.' },
    { pid:12, name:'Cooling System',     category:'pc-parts',    price:12000, stock:25, featured:false, image:'https://media.istockphoto.com/id/2060019100/photo/close-up-inside-hi-performance-custom-computer-desktop.jpg?s=612x612&w=0&k=20&c=lKv8pwk_PBVSqkH7NN0oXj7GfCp6NxSBnf0QU72GV3w=',                     description:'Keep your gaming rig cool.' },
    { pid:13, name:'RGB Lights Kits',    category:'accessories', price:3500,  stock:80, featured:false, image:'https://media.istockphoto.com/id/1147017859/photo/battle-station-gaming-rig-with-multiple-monitors-for-gamers-coders-miners-designers-renderers.jpg?s=612x612&w=0&k=20&c=NyFzSmlVNu-LVsf47hQe7sbgF6mrHcIdijd0td0Prmg=', description:'Customize your setup with vibrant RGB lighting.' },
    { pid:14, name:'Streaming Gears',    category:'streaming',   price:22000, stock:20, featured:false, image:'https://media.istockphoto.com/id/1397022068/photo/cybersport-gamer-have-live-stream.jpg?s=612x612&w=0&k=20&c=kOu05H4HyADDOfhQKMd78cW6S40_8tlyunw9NbdT0as=',                                          description:'Top-tier streaming gear for professional broadcasts.' },
    { pid:15, name:'Anti-Fatigue Mats',  category:'accessories', price:2500,  stock:60, featured:false, image:'https://media.istockphoto.com/id/1302611020/photo/telecommuting-remote-work-working-late-concepts.jpg?s=612x612&w=0&k=20&c=Mj351iowHho5z7BgoHUxhGs4JQB6_kvcYlhYhWvyapQ=',                            description:'Reduce strain with our ergonomic anti-fatigue mats.' },
    { pid:16, name:'Monitor Stands',     category:'accessories', price:4500,  stock:40, featured:false, image:'https://media.istockphoto.com/id/1400969523/photo/gaming-desk.jpg?s=612x612&w=0&k=20&c=fHl6jHp3Ck5ukXJp37QqTRNKlNo60gBlQ_Y1FKPrhXk=',                                                                  description:'Elevate your setup with durable monitor stands.' },
  ];
  await Product.insertMany(products);
  console.log('✅ Products seeded to MongoDB');
}

module.exports = { connectDB, User, Product, Order, Counter, getNextId, seedProducts };
