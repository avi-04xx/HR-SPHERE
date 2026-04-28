import axios from "axios";

console.log("VITE_API_URL from env:", import.meta.env.VITE_API_URL); // ← For debugging

// Use Vercel environment variable
const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

console.log("Using backend URL:", BACKEND_URL); // ← For debugging

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Set auth token
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

// Error handler
export function apiErr(err, fallback = "Request failed") {
  console.error("API Error details:", err);
  if (!err?.response) {
    return "Server not reachable. Check backend.";
  }
  return err.response.data?.message || fallback;
}

export default api;