const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecret123";
const IS_DEV = process.env.NODE_ENV !== "production";

// ─── Protect Middleware ────────────────────────────────────────────────────────
// Validates JWT, caches decoded user on req.user.
// Applied PER-ROUTE only — never globally.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Provide: Authorization: Bearer <token>"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cache decoded user on request object — no DB call needed
    req.user = decoded;

    if (IS_DEV) {
      console.log(`[AUTH] ${req.method} ${req.originalUrl} | role: ${decoded.role} | id: ${decoded.id}`);
    }

    next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: isExpired
        ? "Session expired. Please login again."
        : "Invalid token. Please login again."
    });
  }
};

// ─── Admin Only Middleware ─────────────────────────────────────────────────────
// Must be used AFTER protect middleware.
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admins only."
  });
};

module.exports = { protect, adminOnly };
