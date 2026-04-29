const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ 
      success: false, 
      message: "Authorization required. Please provide Bearer token in headers" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret123");
    console.log("✅ Authenticated user:", decoded.role);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token. Please login again." 
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }
};

module.exports = { protect, adminOnly };
