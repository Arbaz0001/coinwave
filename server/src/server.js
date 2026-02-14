// src/server.js
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import fs from "fs";
import http from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken"; // optional: for verifying socket tokens

// ✅ Import Routes
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import withdrawRoutes from "./routes/withdrawRoutes.js";
import adminAuthRoutes from "./routes/adminRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import depositRoutes from "./routes/depositRoutes.js";
import qrCodeRoutes from "./routes/qrCodeRoutes.js";
import qrcodeCryptoRoutes from "./routes/qrcodeCryptoRoutes.js";
import notificationRoutes from "./routes/notification.routes.js"; // if you create it
import supportRoutes from "./routes/supportRoutes.js";

dotenv.config();
const app = express();
process.setMaxListeners(20);

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create uploads folder if not exists
// Use a consistent uploads folder (project root /uploads)
const uploadDir = path.join(__dirname, "../uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Uploads folder created at: ${uploadDir}`);
  } else {
    console.log(`✅ Uploads folder already exists at: ${uploadDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create uploads folder at ${uploadDir}:`, err.message);
  console.error(`   Issue: Check folder permissions or disk space`);
  throw err; // fail fast - don't start server if uploads folder can't be created
}

// ✅ Serve uploaded images (accessible via /api/uploads/:filename)
app.get("/api/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  console.log("🟩 Serving file:", filePath);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Image not found:", err.message);
      res.status(404).json({ success: false, message: "Image not found" });
    }
  });
});

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://admin.coinpay0.com","https://api.coinpay0.com","https://coinpay0.com"], // user + admin frontends
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Env Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coinwave247_new";
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",");

// ✅ Root test route
app.get("/api", (req, res) => {
  res.send("🚀 CoinWave247 API Running Successfully!");
});

// ✅ ROUTES SETUP
app.use("/api/admin", adminAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/withdraws", withdrawRoutes); // ✅ Keep this above 404 handler!
app.use("/api/qrcode", qrCodeRoutes);
app.use("/api/crypto-qrcode", qrcodeCryptoRoutes);

// if you create notification routes, mount them:
app.use("/api/notification", notificationRoutes);
app.use("/api/support", supportRoutes);

// ✅ Static file serving for uploads: /uploads/filename
// This allows frontend to load images like /uploads/qr-1234567.png
app.use("/uploads", express.static(uploadDir));

// Alternative: serve via /api/uploads/filename
app.use("/api/uploads", express.static(uploadDir));

// -------------------- Socket.IO setup --------------------
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: CLIENT_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"],
  },
  // path: '/socket.io' // default
});

// make io available in controllers: req.app.get('io')
app.set("io", io);

// Optional: verify JWT token for sockets if you use JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // allow anonymous sockets if you want; otherwise reject:
    // return next(new Error("Authentication error"));
    return next(); // proceed without user info
  }

  try {
    const decoded = jwt.verify(token.replace(/^Bearer\s+/i, ""), process.env.JWT_SECRET || "your_jwt_secret");
    // attach user info to socket (if your token contains user id)
    socket.user = decoded;
    if (decoded && decoded._id) {
      // join room for this user so server can target specific users later
      socket.join(String(decoded._id));
    }
    return next();
  } catch (err) {
    console.warn("Socket auth failed:", err.message);
    // allow connection but without user info; or reject:
    // return next(new Error("Socket authentication failed"));
    return next();
  }
});

io.on("connection", (socket) => {
  console.log("🟦 Socket connected:", socket.id, "user:", socket.user ? socket.user._id : "anon");

  // example: client can join custom rooms
  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔶 Socket disconnected:", socket.id, reason);
  });
});
// -------------------- end Socket.IO setup --------------------

// ✅ SINGLE 404 HANDLER (only once, at end)
// ✅ Global error handler: catches multer and thrown errors
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.message || err);
  
  // Don't re-send if headers already sent
  if (res.headersSent) return next(err);
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ✅ 404 handler (only once, must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ✅ Database Connection + Server start
console.log("📦 Connecting to Database:", MONGO_URI);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    server.listen(PORT, () => console.log(`🚀 Server running at: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
