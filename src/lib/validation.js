export const validateRegistration = (data) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return 'All fields are required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return null;
};
