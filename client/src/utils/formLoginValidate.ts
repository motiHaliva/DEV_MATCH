type LoginForm = {
  email: string;
  password: string;
};

export const validateLoginForm = (
  formData: LoginForm,
  setError: (msg: string) => void
): boolean => {
  if (!formData.email) {
    setError("Email is required");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setError("Please enter a valid email address");
    return false;
  }

  if (!formData.password) {
    setError("Password is required");
    return false;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters");
    return false;
  }

  return true;
};
