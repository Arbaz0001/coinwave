export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "admin" && req.user.role != "superadmin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
