const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
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
  (req, res, next) => {
    // Check if fields are strings before validator runs
    if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
      return res.status(400).json({
        message: "Invalid input types: email and password must be strings"
      });
    }
    next();
  },
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

      // Secure Cookie Configuration
      // httpOnly: true prevents client-side JS (XSS) from accessing the cookie
      // secure: true ensures transmission solely over HTTPS in production
      // sameSite: "lax" defends against Cross-Site Request Forgery (CSRF)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;