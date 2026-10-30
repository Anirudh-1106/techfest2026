const express = require("express");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { auth } = require("../middleware/auth");

const router = express.Router();

// POST /api/registrations
router.post("/", auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    if (event.seats < 1) {
      return res.status(400).json({
        message: "No seats left"
      });
    }

    const already = await Registration.findOne({
      user: req.user.id,
      event: event._id
    });

    if (already) {
      return res.status(400).json({
        message: "Already registered"
      });
    }

    await Registration.create({
      user: req.user.id,
      event: event._id
    });

    event.seats = event.seats - 1;

    await event.save();

    res.status(201).json({
      message: "Registered successfully"
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registrations/my
router.get("/my", auth, async (req, res, next) => {
  try {
    const list = await Registration.find({
      user: req.user.id
    }).populate("event");

    res.json(list.filter((r) => r.event !== null));
  } catch (err) {
    next(err);
  }
});

module.exports = router;