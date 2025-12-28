// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

// 🔹 Routes
import usdtRoutes from "./routes/usdt.routes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ----------------- ROUTES -----------------

// ✅ USDT / Rates
app.use("/api/rates", usdtRoutes);

// ✅ Authentication
app.use("/api/auth", authRoutes);

// ✅ Users (Admin)
app.use("/api/v1/users", userRoutes);

// ✅ Transactions
app.use("/api/v1/transactions", transactionRoutes);

// ✅ Pending Payments
app.use("/api/v1/pending-payments", paymentRoutes);

// ✅ Balance Management
app.use("/api/v1/balance", balanceRoutes);

// ----------------- ROOT -----------------
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

export default app;
