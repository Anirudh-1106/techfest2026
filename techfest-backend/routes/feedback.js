const express = require("express");
const { body, validationResult } = require("express-validator");
const Feedback = require("../models/Feedback");

const router = express.Router();

// GET /api/feedback - Retrieve all feedbacks
router.get("/", async (req, res, next) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/feedback - Submit feedback with validation and sanitization
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required").escape(),
    body("comment").isString().trim().notEmpty().withMessage("Feedback comment is required")
      .isLength({ max: 500 }).withMessage("Feedback must be under 500 characters")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, comment } = req.body;
      const feedback = await Feedback.create({
        name,
        comment
      });

      res.status(201).json(feedback);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
