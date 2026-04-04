import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setOrganization(res.data.organization);
      })
      .catch(() => {
        setAuthToken(null);
        setUser(null);
        setOrganization(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData, orgData) {
    setAuthToken(token);
    setUser(userData);
    setOrganization(orgData);
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
    setOrganization(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, organization, loading, login, logout, isAuthed: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
