const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  jobType: { type: String, enum: ["Full-Time", "Part-Time"], required: true },
  location: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, default: "No description provided" }, // Default value for description
  salary: { type: String, default: "Not specified" }, // Optional salary field
});

// Add text index for fuzzy search across multiple fields
jobSchema.index({ title: "text", domain: "text", jobType: "text", location: "text", company: "text" });

module.exports = mongoose.model("Job", jobSchema); // Automatically maps to the 'jobs' collection in MongoDB
