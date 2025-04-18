const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema({
  username: String,
  email: String,
  jobTitle: String,
  company: String,
  location: String,
  domain: String,
  jobType: String,
  description: String,
  salary: String,
}, { collection: 'jobapplications' });

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
