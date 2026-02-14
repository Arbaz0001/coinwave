import jwt from "jsonwebtoken";

/**
 * Verify raw JWT token (named export verifyJWT)
 * - keeps same behaviour as authMiddleware but exported with this name
 * - useful when some routes import verifyJWT specifically
 */
export const verifyJWT = (req, res, next) => {
  try {
    // Accept token from Authorization header, cookies, body, or query param
    const authHeader = req.headers.authorization || req.headers["x-access-token"] || "";
    const tokenFromHeader = authHeader ? authHeader.split(" ")[1] || authHeader : null;

    const token = tokenFromHeader || req.cookies?.token || req.body?.token || req.query?.token || "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id, email/phoneNumber, role, etc.
    return next();
  } catch (err) {
    console.error("JWT verify error:", err && err.message ? err.message : err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * General auth middleware (async-friendly)
 * Keeps logging for debugging and a consistent req.user shape
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Accept token from multiple sources to be tolerant
    const authHeader = req.headers.authorization || req.headers["x-access-token"] || "";
    const tokenFromHeader = authHeader ? authHeader.split(" ")[1] || authHeader : null;

    // Check cookies, body, query as fallback
    const token =
      tokenFromHeader || req.cookies?.token || req.body?.token || req.query?.token || "";

    console.log("🔍 Auth token raw sources -> header:", authHeader ? "[present]" : "[none]", " cookie:", req.cookies ? "[present]" : "[none]");

    if (!token) {
      console.log("🔴 authMiddleware: No token provided from header/cookie/body/query");
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token payload:", payload);

    req.user = {
      _id: payload._id || payload.id || null,
      id: payload._id || payload.id || null,
      identifier: payload.email || payload.phoneNumber || payload.identifier || null,
      role: payload.role || "user",
    };

    next();
  } catch (err) {
    console.error("Auth middleware JWT verify error:", err && err.message ? err.message : err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Admin role check
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

/**
 * Superadmin check
 */
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role === "superadmin") {
    return next();
  }

  return res
    .status(403)
    .json({ success: false, message: "Forbidden: Superadmins only" });
};
