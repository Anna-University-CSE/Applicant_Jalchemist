// components/Account.js
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './Account.css'; // Import the CSS file (create this file)

const Account = () => {
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage (or session)
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (username && email) {
      setUser({ username, email });
      fetchAppliedJobs(email);
    } else {
      // Consider using useNavigate hook for redirection instead of window.location
      // const navigate = useNavigate(); navigate('/authentication');
      toast.warn("Please log in to view your account.");
      // You might want to navigate away using React Router instead of hard redirect
      // For now, keeping the existing logic but it might cause full page reload
      window.location.href = '/authentication';
    }
  }, []);

  const fetchAppliedJobs = async (email) => {
    setLoading(true); // Ensure loading is true at the start
    try {
      const response = await fetch(`http://localhost:5000/api/appliedJobs?email=${encodeURIComponent(email)}`); // Ensure email is encoded
      const data = await response.json();

      if (response.ok && data.appliedJobs) { // Check if appliedJobs array exists
         // Process jobs only if data.appliedJobs is an array
         const jobsWithDate = Array.isArray(data.appliedJobs)
           ? data.appliedJobs.map((job) => {
               let appliedOn = "Date unavailable"; // Default text
               // Attempt to parse the date ONLY if job._id exists and is a valid ObjectId string
               // MongoDB ObjectId timestamp extraction logic:
               if (job._id && typeof job._id === 'string' && job._id.length === 24) {
                 try {
                   const timestamp = parseInt(job._id.substring(0, 8), 16);
                   appliedOn = new Date(timestamp * 1000).toLocaleDateString();
                 } catch (e) {
                    console.error("Error parsing date from ObjectId:", job._id, e);
                 }
               } else if (job.appliedDate) { // Fallback to an 'appliedDate' field if it exists
                   try {
                      appliedOn = new Date(job.appliedDate).toLocaleDateString();
                   } catch(e) {
                       console.error("Error parsing date from appliedDate field:", job.appliedDate, e);
                   }
               }
               return { ...job, appliedOn };
             })
           : []; // Default to empty array if data.appliedJobs is not an array

        setAppliedJobs(jobsWithDate);
      } else {
         setAppliedJobs([]); // Set to empty array on failure or if no jobs found
         // Use a more specific message if possible
         toast.error(data.message || "Could not fetch applied jobs or no jobs found.");
      }
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
      toast.error("Network error or server issue fetching applied jobs.");
       setAppliedJobs([]); // Ensure it's an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Display loading state more centrally
  if (loading) {
      return (
          <div className="account-page loading-container">
              <p>Loading Account Details...</p>
          </div>
      );
  }

  // Handle case where user data might still be missing after initial check (edge case)
  if (!user) {
     return (
          <div className="account-page error-container">
              <p>User data not found. Please try logging in again.</p>
              {/* Optional: Add a button to go to login */}
          </div>
      );
  }


  return (
    // Add className to the main container
    <div className="account-page">
      <h1>My Account</h1>

      {/* Wrap user info in a div for potential styling */}
      <div className="user-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {user.username}</p>
      </div>

      <h2>Applied Jobs</h2>
      {appliedJobs.length === 0 ? (
        // Add className to the 'no jobs' message
        <p className="no-jobs-message">You haven't applied to any jobs yet.</p>
      ) : (
        // Add className to the list container
        <ol className="applied-jobs-list">
          {appliedJobs.map((job, index) => (
            // Add className to each list item (job card)
            <li key={job._id || index} className="applied-job-item"> {/* Use job._id if available and unique */}
              <h3>{job.jobTitle || "No Title Provided"}</h3> {/* Provide default */}
              <p><strong>Company:</strong> {job.company || "N/A"}</p>
              <p><small><strong>Location:</strong> {job.location || "N/A"}</small></p>
              <p><small><strong>Domain:</strong> {job.domain || "N/A"}</small></p>
              <p><small><strong>Salary:</strong> {job.salary || "N/A"}</small></p>
              <p><small><strong>Applied on:</strong> {job.appliedOn}</small></p>
               {/* Removed redundant <br/> tags as <p> and <small> with display block/styling will handle spacing */}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Account;