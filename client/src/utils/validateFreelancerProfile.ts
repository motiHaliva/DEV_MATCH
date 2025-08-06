import type { FreelancerProfileData } from "../features/profiles/type";

export const validateFreelancerProfile = (
  profile: FreelancerProfileData,
  setError: (msg: string) => void
): boolean => {
  const { firstname, lastname, email, headline, experience_years, location } = profile;

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

  if (headline && headline.length > 100) {
    setError("Professional Title must be less than 100 characters");
    return false;
  }

  if (experience_years !== undefined) {
    if (isNaN(experience_years) || experience_years < 0 || experience_years > 100) {
      setError("Years of Experience must be a valid number between 0 and 100");
      return false;
    }
  }

  if (location && (location.length < 2 || location.length > 100 || !/^[A-Za-zא-ת\s'-]+$/.test(location))) {
    setError("Location must be 2-100 letters and can only contain letters, spaces, - or '");
    return false;
  }

  return true;
};
