// Adds the TechFest events to an empty database: npm run seed
require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("./models/Event");

const events = [
  { name: "Hackathon 2026", category: "Technical", fee: 200, seats: 50, date: "2026-11-15" },
  { name: "Robotics Challenge", category: "Robotics", fee: 150, seats: 40, date: "2026-11-16" },
  { name: "Gaming Tournament", category: "Gaming", fee: 100, seats: 60, date: "2026-11-17" },
  { name: "AI Workshop", category: "Workshop", fee: 50, seats: 80, date: "2026-11-18" }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  if ((await Event.countDocuments()) > 0) {
    console.log("Events already exist - nothing added");
  } else {
    await Event.insertMany(events);
    console.log("Added " + events.length + " events");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.log("Seed error:", err.message);
  process.exit(1);
});
