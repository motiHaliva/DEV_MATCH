import type { SignUpProps } from "../api/typs";


export const validateSignUpForm = (
  formData: SignUpProps,
  setError: (msg: string) => void
): boolean => {
  const { firstname, lastname, email, password, phone, role } = formData;

  if (!firstname || firstname.length < 2 || firstname.length > 30 || !/^[A-Za-zא-ת\s'-]+$/.test(firstname)) {
    setError("First name must be 2-30 letters and can only contain letters, spaces, - or '");
    return false;
  }

  if (!lastname || lastname.length < 2 || lastname.length > 30 || !/^[A-Za-zא-ת\s'-]+$/.test(lastname)) {
    setError("Last name must be 2-30 letters and can only contain letters, spaces, - or '");
    return false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Please enter a valid email address");
    return false;
  }

if (! phone || phone.trim() === "") {
  setError("Phone number is required");
  return false;
}

  if (role === null || !["freelancer", "client", "admin"].includes(role)) {
    setError("Role must be one of: freelancer, client, admin");
    return false;
  }

  if (!password || password.length < 6 || password.length > 30 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    setError("Password must be 6-30 characters and include uppercase, lowercase, and a number");
    return false;
  }

  return true;
};
