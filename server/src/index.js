import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import leaveRoutes from "./routes/leaves.js";
import payrollRoutes from "./routes/payroll.js";
import reviewRoutes from "./routes/reviews.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Reflect browser origin when CLIENT_ORIGIN is unset (localhost + LAN + phone).
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.trim() || true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error("Set JWT_SECRET in .env");
    process.exit(1);
  }
  await connectDb();
  const host = "0.0.0.0";
  app.listen(PORT, host, () => {
    console.log(`API listening on http://localhost:${PORT} (all interfaces — use your PC IP from phone)`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
