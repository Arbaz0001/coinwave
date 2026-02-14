export const permit = (...allowedRoles) => {
  return (req, res, next) => {
    const { user } = req;
    console.log("🔐 Permit middleware - allowedRoles:", allowedRoles, "user:", user);
    
    if (!user) {
      console.error("❌ Permit: No user found");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("🔐 Checking user.role:", user.role, "against allowedRoles:", allowedRoles);
    
    if (allowedRoles.includes(user.role) || (user.role === "admin" && allowedRoles.includes("childAdmin") && user.parentAdmin)) {
      console.log("✅ Permit: User authorized");
      return next();
    }
    
    console.error("❌ Permit: User not authorized - role:", user.role);
    return res.status(403).json({ message: "Forbidden: insufficient rights" });
  };
};
