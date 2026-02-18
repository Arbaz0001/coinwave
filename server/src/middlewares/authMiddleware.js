import jwt from "jsonwebtoken";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers["x-access-token"] || "";
  const tokenFromHeader = authHeader ? authHeader.split(" ")[1] || authHeader : null;

  const rawToken =
    tokenFromHeader || req.cookies?.token || req.body?.token || req.query?.token || "";

  if (!rawToken || typeof rawToken !== "string") return "";

  let normalizedToken = rawToken
    .trim()
    .replace(/^bearer\s+/i, "")
    .replace(/^bearer\s+/i, "");

  if (normalizedToken.startsWith('"')) {
    normalizedToken = normalizedToken.slice(1);
  }
  if (normalizedToken.endsWith('"')) {
    normalizedToken = normalizedToken.slice(0, -1);
  }

  return normalizedToken;
};

const verifyWithAvailableSecrets = (token) => {
  const possibleSecrets = [
    process.env.JWT_SECRET,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_TOKEN_SECRET,
  ];
  const secrets = possibleSecrets.filter(Boolean);

  if (!secrets.length) {
    throw new Error("JWT secret is not configured");
  }

  let lastError = null;

  for (const secret of new Set(secrets)) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Invalid token");
};

/**
 * Verify raw JWT token (named export verifyJWT)
 * - keeps same behaviour as authMiddleware but exported with this name
 * - useful when some routes import verifyJWT specifically
 */
export const verifyJWT = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    console.log("🔍 [verifyJWT] Authorization header:", req.headers.authorization ? `${req.headers.authorization.substring(0, 50)}...` : "MISSING");
    console.log("🔍 [verifyJWT] Extracted token:", token ? `${token.substring(0, 30)}...` : "NULL");

    if (!token) {
      console.log("🔴 [verifyJWT] No token found - sending 401");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyWithAvailableSecrets(token);
    console.log("✅ [verifyJWT] Token verified successfully:", { role: decoded.role, id: decoded._id || decoded.id });
    req.user = decoded; // contains id, email/phoneNumber, role, etc.
    return next();
  } catch (err) {
    console.error("🔴 [verifyJWT] JWT verify error:", err?.message || err);
    const message = err?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};

/**
 * General auth middleware (async-friendly)
 * Keeps logging for debugging and a consistent req.user shape
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-access-token"] || "";
    const token = getTokenFromRequest(req);

    console.log("🔍 Auth token raw sources -> header:", authHeader ? "[present]" : "[none]", " cookie:", req.cookies ? "[present]" : "[none]");

    if (!token) {
      console.log("🔴 authMiddleware: No token provided from header/cookie/body/query");
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const payload = verifyWithAvailableSecrets(token);
    console.log("✅ Decoded token payload:", payload);

    req.user = {
      _id: payload._id || payload.id || null,
      id: payload._id || payload.id || null,
      identifier: payload.email || payload.phoneNumber || payload.identifier || null,
      role: payload.role || "user",
    };

    next();
  } catch (err) {
    console.error("Auth middleware JWT verify error:", err?.message || err);
    const message = err?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Admin role check
 */
export const isAdmin = (req, res, next) => {
  console.log("🔐 [isAdmin] req.user:", req.user);
  console.log("🔐 [isAdmin] req.user.role:", req.user?.role);
  
  if (!req.user) {
    console.log("🔴 [isAdmin] FAILED - req.user is missing");
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    console.log("🔴 [isAdmin] FAILED - role is not admin/superadmin:", req.user.role);
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  
  console.log("✅ [isAdmin] User authorized");
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
