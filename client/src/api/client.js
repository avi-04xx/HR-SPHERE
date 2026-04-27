import axios from "axios";

// ✅ Local backend
const BACKEND_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
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

// ✅ Load token on refresh
const saved = localStorage.getItem("hr_token");
if (saved) {
  api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}

// ✅ Error handler
export function apiErr(err, fallback = "Request failed") {
  if (!err?.response) {
    return "Server not reachable. Check backend.";
  }
  return err.response.data?.message || fallback;
}

export default api;