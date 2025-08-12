import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCurrentUser } from "../../api/userApi"
import type { CurrentUser } from "../../api/typs"

type AuthContextType = {
  currentUser: CurrentUser | null; // שינוי: יכול להיות null
  setCurrentUser: (user: CurrentUser | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const emptyCurrent: CurrentUser = {
//   id: 0,
//   role: "client", 
//   firstname: "",
//   lastname: "",
//   email: "",
//   created_at: "",
//   profile_image: "",
// };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null); // התחל עם null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        console.log("User loaded from API:", user); // דיבאג
        setCurrentUser(user);
      })
      .catch((error) => {
        console.log("Failed to get user:", error); // דיבאג
        setCurrentUser(null); // null במקום emptyCurrent
      })
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