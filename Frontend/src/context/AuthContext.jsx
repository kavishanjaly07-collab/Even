import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    authApi.getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function setSession({ token, user: authenticatedUser }) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setAuthError("");
  }

  function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function updateUser(updatedUser) {
    const nextUser = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = useMemo(
    () => ({ user, loading, authError, setSession, clearSession, updateUser }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
