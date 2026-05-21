const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gaming_store_secret_2025';

// Customer auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Login required.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
}

// Admin auth middleware
function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Admin access required.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized.' });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin session.' });
  }
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
