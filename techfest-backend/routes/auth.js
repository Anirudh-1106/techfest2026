const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const cookieOptions = require("../config/cookie");

const router = express.Router();

// Only strings are accepted - blocks objects like { "$gt": "" } (NoSQL injection)
function requireStrings(...fields) {
  return (req, res, next) => {
    for (const f of fields) {
      if (typeof req.body[f] !== "string") {
        return res.status(400).json({
          message: "Invalid input types: " + fields.join(" and ") + " must be strings"
        });
      }
    }
    next();
  };
}

// Slow down password guessing: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many login attempts, try again later" }
});

// POST /api/auth/register
router.post(
  "/register",
  requireStrings("name", "email", "password"),
  [
    body("name").trim().notEmpty().withMessage("Name is required").escape(),
    body("email").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      const exists = await User.findOne({ email });

      if (exists) {
        return res.status(400).json({
          message: "Email already used"
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashed
      });

      res.status(201).json({
        message: "Registered successfully"
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  requireStrings("email", "password"),
  [
    body("email").trim().isEmail().withMessage("Valid email address is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: "Invalid login"
        });
      }

      const ok = await bcrypt.compare(password, user.password);

      if (!ok) {
        return res.status(401).json({
          message: "Invalid login"
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h"
        }
      );

      // Secure cookie: httpOnly + secure + sameSite (see config/cookie.js)
      res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 3600000 // 1 hour
      });

      res.json({
        token,
        name: user.name,
        role: user.role,
        message: "Login successful with secure session cookie"
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me - restore the session from the httpOnly cookie
// Returns { user: null } when not logged in (no error for guests)
router.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    let payload = null;

    try {
      payload = token ? jwt.verify(token, process.env.JWT_SECRET) : null;
    } catch {
      payload = null;
    }

    if (!payload) {
      return res.json({ user: null });
    }

    const user = await User.findById(payload.id).select("name role");
    res.json({ user: user ? { name: user.name, role: user.role } : null });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
});

module.exports = router;