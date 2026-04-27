import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    token: null,
    user: null,
    organization: null,
    isAuthed: false,
  });

  const [loading, setLoading] = useState(true);

  // ✅ RESTORE LOGIN ON REFRESH
  useEffect(() => {
    const token = localStorage.getItem("hr_token");

    if (token) {
      setAuthToken(token);

      setState((prev) => ({
        ...prev,
        token,
        isAuthed: true,
      }));
    }

    setLoading(false);
  }, []);

  // ✅ LOGIN FUNCTION (FIXED)
  function login(token, user, organization) {
    // 🔴 IMPORTANT: save token
    localStorage.setItem("hr_token", token);

    // 🔴 attach token to axios
    setAuthToken(token);

    // update state
    setState({
      token,
      user,
      organization,
      isAuthed: true,
    });
  }

  // ✅ LOGOUT FUNCTION
  function logout() {
  localStorage.removeItem("hr_token");
  setAuthToken(null);

  setState({
    token: null,
    user: null,
    organization: null,
    isAuthed: false,
  });
}
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ custom hook
export function useAuth() {
  return useContext(AuthContext);
}