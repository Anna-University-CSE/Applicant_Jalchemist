import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './SearchJobs.css';

const SearchJobs = () => {
  const [platform, setPlatform] = useState("");
  const [searchType, setSearchType] = useState("database");
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch initial job listings from the database on component mount
  useEffect(() => {
    const fetchInitialJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/jobs"); // Use full URL
        setResults(response.data);
      } catch (err) {
        console.error("Error fetching initial jobs:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialJobs();
  }, []);

  // Handle Apply button click
  // Modify the API endpoint to match the one you set up in the backend
const handleApply = async (job) => {
  try {

    if (searchType === "platform" && job.platformUrl) {
      // Redirect to external platform job link
      window.open(job.platformUrl, "_blank");
      return;
    }

    // Check if the user is logged in
    const currentUser = localStorage.getItem("username");
    const currentemail = localStorage.getItem("email");

    if (currentUser) {

      localStorage.setItem("jobDetails", JSON.stringify(job));  // Storing job details
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");


            // Prepare the data to be sent in the POST request
      const jobData = {
        username:currentUser,
        email:currentemail,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        domain: job.domain,
        jobType: job.jobType,
        description: job.description,
        salary: job.salary,
      };

      // Make the POST request to your backend API
      const response = await fetch("http://localhost:5000/api/jobapplications", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, jobDetails: job }),
      });    
        console.log("Job application submitted:", response.data);
      navigate("/fill"); // Navigate to the "fill" page
    } else {

      localStorage.setItem("jobDetails", JSON.stringify(job));  // Storing job details

      navigate("/authentication"); // Navigate to login/signup if not logged in
    }
  } catch (err) {
    console.error("Error applying for the job:", err);
    alert("Error applying for the job: " + err.message); // Inform the user about the error
  }
};

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;

     if (searchType === "platform" && platform) {
  switch (platform) {
    case "Arbeitnow":
      response = await axios.get("https://www.arbeitnow.com/api/job-board-api", {
        params: {
          title: query,
          location: location,
        },
      });
      // The API returns { data: [ ...jobs ] }
      setResults(Array.isArray(response.data.data) ? response.data.data : []);
      break;
    // ... other platforms
    default:
      throw new Error("Invalid platform selected");
  }
  setIsLoading(false);
  return;
}
 else {
        // Database search
        response = await axios.get("http://localhost:5000/api/jobs/search", {
          params: { domain, jobType, location, company },
        });
      }

      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-jobs-page">
      <header className="page-header">
        <div className="search-type-selector">
          <label>
            <input
              type="radio"
              value="database"
              checked={searchType === "database"}
              onChange={() => setSearchType("database")}
            />
            Jalchemist Search
          </label>
          <label>
            <input
              type="radio"
              value="platform"
              checked={searchType === "platform"}
              onChange={() => setSearchType("platform")}
            />
            Platform Search
          </label>
        </div>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        {searchType === "platform" ? (
          <>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
            >
              <option value="">Select Platform</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Adzuna">Adzuna</option>
            </select>
            <input
              type="text"
              placeholder="Search jobs (e.g., Software Engineer)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </>
        ) : (
          <div id='cent'>
            <input
              type="text"
              placeholder="Domain (e.g., Software)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">Job Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}
        <button type="submit">Search</button>
      </form>

      {isLoading ? (
        <p>Loading...</p>
      ) : Array.isArray(results) && results.length > 0 ? (
        results.map((job) => (
          <div key={job.id || job._id} className="job-card">
            <h3>{job.title}</h3>
            <p>Company: {job.company}</p>
            <p>Location: {job.location}</p>
            <p>Domain: {job.domain}</p>
            <p>Job Type: {job.jobType}</p>
            <p>Description: {job.description}</p>
            <p>Salary: {job.salary}</p>
            <div id='cen'>
              <button className='apply-button' onClick={() => handleApply(job)}>Apply</button>
            </div>
          </div>
        ))
      ) : (
        <p>No jobs found!</p>
      )}
    </div>
  );
};

export default SearchJobs;
