import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCurrentUser } from "../../api/userApi"
import type { CurrentUser } from "../../api/typs"

type AuthContextType = {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const emptyCurrent: CurrentUser = {
  id: 0,
  role: "client", 
  firstname: "",
  lastname: "",
  email: "",
  created_at: "",
  profile_image: "",
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(emptyCurrent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(emptyCurrent))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};