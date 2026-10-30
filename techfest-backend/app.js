const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const logger = require("./middleware/logger");
const errors = require("./middleware/errorHandler");
const csrfGuard = require("./middleware/csrf");
const allowedOrigins = require("./config/origins");

const app = express();

// Render sits behind a proxy - needed for secure cookies and rate limiting by IP
app.set("trust proxy", 1);

// Security Headers with Helmet
// Mitigates XSS by enforcing strict Content Security Policy, prevents clickjacking and MIME sniffing
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Gzip responses
app.use(compression());

// Cross-Origin Resource Sharing: only our own frontend may call the API with cookies
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10kb" }));

// Cookie parsing for secure authentication cookies
app.use(cookieParser());

// NoSQL Injection Prevention
// Recursively sanitizes user-supplied data to remove keys beginning with '$' or containing '.'
// Compatible with Express 5 (which has a read-only req.query getter)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Block state-changing requests coming from other websites (CSRF)
app.use(csrfGuard);

// Log every request
if (process.env.NODE_ENV !== "test") {
  app.use(logger);
}

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

module.exports = app;
