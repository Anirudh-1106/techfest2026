require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const logger = require("./middleware/logger");
const errors = require("./middleware/errorHandler");

const app = express();

// Security Headers with Helmet
// Mitigates XSS by enforcing strict Content Security Policy, prevents clickjacking and MIME sniffing
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// NoSQL Injection Prevention
// Recursively sanitizes user-supplied data to remove keys beginning with '$' or containing '.'
// Compatible with Express 5 (which has a read-only req.query getter)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Cookie parsing for secure authentication cookies
app.use(cookieParser());

// Cross-Origin Resource Sharing with credentials support
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or origin check
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Log every request
app.use(logger);

// Health check endpoint (for deployment monitoring and CI/CD)
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/feedback", require("./routes/feedback"));

// 404 handler
app.use(errors.notFound);

// Error handler
app.use(errors.errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/techfest";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully to " + MONGO_URI))
  .catch((err) => console.log("DB error:", err.message));

app.listen(PORT, () => {
  console.log("Server running securely on port " + PORT);
});

module.exports = app; // Export for automated testing (Supertest / CI)