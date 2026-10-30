const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Support both httpOnly cookie and Bearer header
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Please login first (Missing authentication token)"
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admins only"
    });
  }

  next();
}

module.exports = { auth, adminOnly };