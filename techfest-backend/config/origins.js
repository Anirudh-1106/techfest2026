// Frontends that are allowed to call the API
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL
].filter(Boolean);

module.exports = allowedOrigins;
