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
import bankAccountRoutes from "./routes/bankAccountRoutes.js";
import adminBankAccountRoutes from "./routes/adminBankAccountRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import exchangeRateRoutes from "./routes/exchangeRateRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ----------------- ROUTES -----------------

// ✅ USDT / Rates
app.use("/api/rates", usdtRoutes);

// ✅ Exchange Rates (Binance, Wazirx, INR Bonus)
app.use("/api/exchange-rates", exchangeRateRoutes);

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

// ✅ Bank Accounts
app.use("/api/bank-accounts", bankAccountRoutes);

// ✅ Admin Bank Accounts
app.use("/api/admin/bank-accounts", adminBankAccountRoutes);

// ✅ Settings
app.use("/api/settings", settingsRoutes);

// ✅ Investment module
app.use("/api", investmentRoutes);

// ----------------- ROOT -----------------
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

export default app;
