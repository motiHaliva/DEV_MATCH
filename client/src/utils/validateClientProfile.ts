import type { ClientProfileData } from "../features/profiles/type";

export const validateClientProfile = (
  data: ClientProfileData,
  setError: (msg: string) => void
): boolean => {
  const { firstname, lastname, email } = data;

  if (!firstname || firstname.length < 2 || firstname.length > 30 || !/^[A-Za-zא-ת\s'-]+$/.test(firstname)) {
    setError("First name must be 2-30 letters and contain only letters, spaces, - or '");
    return false;
  }

  if (!lastname || lastname.length < 2 || lastname.length > 30 || !/^[A-Za-zא-ת\s'-]+$/.test(lastname)) {
    setError("Last name must be 2-30 letters and contain only letters, spaces, - or '");
    return false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Please enter a valid email address");
    return false;
  }

  return true;
};
