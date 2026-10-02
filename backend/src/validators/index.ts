/**
 * Akshar Mandir - Backend Validation Utilities
 * Centralized, rigorous input validators and sanitizers.
 */

export const isValidEmail = (email: unknown): boolean => {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // RFC 5322 compliant standard email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
};

export const isValidPhone = (phone: unknown): boolean => {
  if (typeof phone !== 'string') return false;
  // Strip non-digits and optional leading '+'
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  // Accepts standard Indian (10 digits, or +91 followed by 10 digits) and international numbers (7-15 digits)
  const phoneRegex = /^(\+?\d{1,4})?[6-9]\d{9}$|^(\+?\d{7,15})$/;
  return phoneRegex.test(cleaned);
};

export const isValidPincode = (pincode: unknown): boolean => {
  if (typeof pincode !== 'string') return false;
  const cleaned = pincode.trim();
  // Standard Indian 6-digit pincode or international 3-10 postal code
  const pincodeRegex = /^[1-9][0-9]{5}$|^[a-zA-Z0-9\s\-]{3,10}$/;
  return pincodeRegex.test(cleaned);
};

export const isValidPassword = (password: unknown): { valid: boolean; message?: string } => {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a text string.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password cannot exceed 128 characters.' };
  }
  return { valid: true };
};

export const isPositiveNumber = (val: unknown): boolean => {
  if (val === null || val === undefined) return false;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return !isNaN(num) && isFinite(num) && num > 0;
};

export const isNonNegativeNumber = (val: unknown): boolean => {
  if (val === null || val === undefined) return false;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return !isNaN(num) && isFinite(num) && num >= 0;
};

export const isNonEmptyString = (str: unknown, minLen = 1, maxLen = 500): boolean => {
  if (typeof str !== 'string') return false;
  const len = str.trim().length;
  return len >= minLen && len <= maxLen;
};
