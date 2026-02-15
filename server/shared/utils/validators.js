function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain at least one lowercase letter");
  if (!/\d/.test(password)) errors.push("Must contain at least one number");
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    errors.push("Must contain at least one special character");
  return { isValid: errors.length === 0, errors };
}

module.exports = { validateEmail, validatePassword };
