const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// Fetch all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find(); // Fetch all jobs from the database

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
});

// Search jobs with filters and related domains
router.get("/search", async (req, res) => {
  const { domain, jobType, location, company } = req.query;

  try {
    const query = {};

    // Build a text search query dynamically based on user inputs
    const searchTerms = [];
    if (domain) searchTerms.push(domain);
    if (jobType) searchTerms.push(jobType);
    if (location) searchTerms.push(location);
    if (company) searchTerms.push(company);

    if (searchTerms.length > 0) {
      query.$text = { $search: searchTerms.join(" ") }; // Combine all terms into a single text query
    }

    const jobs = await Job.find(query);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No matching jobs found" });
    }

    res.json(jobs);
  } catch (err) {
    console.error("Error searching jobs:", err);
    res.status(500).json({ error: "Server error while searching jobs" });
  }
});


module.exports = router;
