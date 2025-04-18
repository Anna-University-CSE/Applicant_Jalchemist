const mongoose = require("mongoose");

const ActiveSessionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  jobApplications: [
    {
      jobId: String,
      jobTitle: String,
      company: String,
      location: String,
      appliedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("ActiveSession", ActiveSessionSchema);
