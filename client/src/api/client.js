import axios from "axios";

// ✅ Use VITE_API_URL from Vercel (or fallback for local dev)
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,   // increased a bit
});

// ✅ Set token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("hr_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("hr_token");
  }
}

// Load saved token
const saved = localStorage.getItem("hr_token");
if (saved) {
  api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}

// ✅ Better error handler
export function apiErr(err, fallback = "Request failed") {
  console.error("API Error:", err);   // ← Helpful for debugging
  if (!err?.response) {
    return "Server not reachable. Check backend.";
  }
  return err.response.data?.message || fallback;
}

export default api;