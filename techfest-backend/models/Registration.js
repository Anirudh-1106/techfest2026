const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const regSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  },

  event: {
    type: ObjectId,
    ref: "Event",
    required: true
  },

  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Registration", regSchema);