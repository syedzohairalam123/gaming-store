/**
 * ORDER VALIDATION AGENT
 * Specialized agent for validating order data before processing.
 * Ensures all required fields are present and properly formatted.
 */

function validateOrder({ customerName, customerEmail, customerPhone, productName }) {
  const errors = [];

  if (!customerName || customerName.trim().length < 2) {
    errors.push('Valid customer name is required (minimum 2 characters).');
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    errors.push('Valid email address is required.');
  }

  if (!customerPhone || customerPhone.trim().length < 7) {
    errors.push('Valid phone number is required.');
  }

  if (!productName || productName.trim().length < 2) {
    errors.push('Product name is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateOrder };
