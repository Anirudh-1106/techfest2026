const express = require("express");
const Event = require("../models/Event");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/events
// Get all events
router.get("/", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id
// Get one event
router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// POST /api/events
// Add an event
router.post("/", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id
// Edit an event
router.put("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!event) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id
// Delete an event
router.delete("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;