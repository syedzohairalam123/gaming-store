/**
 * ORDER VALIDATION AGENT
 * Specialized agent for validating order data before processing.
 */

function validateOrder({ customerName, customerEmail, customerPhone, items, productName }) {
  const errors = [];

  if (!customerName || customerName.trim().length < 2) {
    errors.push('Valid customer name is required.');
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    errors.push('Valid email address is required.');
  }

  if (!customerPhone || customerPhone.trim().length < 7) {
    errors.push('Valid phone number is required.');
  }

  // Check for either a Cart array (items) OR a direct Buy Now string (productName)
  const hasCartItems = items && Array.isArray(items) && items.length > 0;
  const hasSingleProduct = productName && productName.trim().length >= 2;

  if (!hasCartItems && !hasSingleProduct) {
    errors.push('Order must contain at least one product.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateOrder };