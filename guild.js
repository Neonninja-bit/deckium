// scripts/resetSlots.js
require('dotenv').config();

const mongoose = require("mongoose");
const UserProfile = require("./schemas/Userprofile.js"); // adjust path to your model file

const MONGO = process.env.MONGODB_URI; // or rely on your .env

(async () => {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    // Reset all docs' slots back to 10
    const res = await UserProfile.updateMany({}, { $set: { slots: 10 } });
    console.log("Matched:", res.matchedCount, "Modified:", res.modifiedCount);

    // Optional: list users who had >10 before (if you want to log)
    // const users = await UserProfile.find({ slots: { $gt: 10 } }, "userId slots");
    // console.log(users);

    await mongoose.disconnect();
    console.log("Done, disconnected");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
