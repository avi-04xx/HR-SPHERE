import axios from "axios";

function baseURL() {
  const u = import.meta.env.VITE_API_URL;
  if (u && String(u).trim()) {
    return String(u).replace(/\/$/, "") + "/api";
  }
  return "/api";
}

const api = axios.create({
  baseURL: baseURL(),
  headers: { "Content-Type": "application/json" },
  timeout: 25000,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("hr_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("hr_token");
  }
}

const saved = localStorage.getItem("hr_token");
if (saved) {
  api.defaults.headers.common.Authorization = `Bearer ${saved}`;
}

export function apiErr(err, fallback = "Request failed") {
  if (!err?.response) {
    return "No API response — run `npm run dev` from project root and open http://localhost:5173 (MongoDB must run).";
  }
  const m = err.response.data?.message;
  return typeof m === "string" && m.trim() ? m : fallback;
}

export default api;
