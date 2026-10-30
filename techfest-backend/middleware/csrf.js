const allowedOrigins = require("../config/origins");

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

// A forged request from another website carries that website's Origin header.
// Reject any state-changing request whose Origin is not our frontend.
function csrfGuard(req, res, next) {
  const origin = req.headers.origin;

  if (SAFE_METHODS.includes(req.method) || !origin || allowedOrigins.includes(origin)) {
    return next();
  }

  res.status(403).json({
    message: "Cross-site request blocked"
  });
}

module.exports = csrfGuard;
