import { useState, useEffect } from "react";
import "./login.css";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:5000/api'; // Unified API URL

export default function Login({ switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  // Get job details from localStorage on mount
  useEffect(() => {
    const jobString = localStorage.getItem("selectedJob");
    if (jobString) {
      try {
        setSelectedJob(JSON.parse(jobString));
      } catch (e) {
        setSelectedJob(null);
      }
    }
    // Google login setup...
    window.google.accounts.id.initialize({
      client_id: "169492076098-sch0jg8ua4bn8qr2pjth6hndsh6a91ei.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large" }
    );
  }, []);

  async function handleCredentialResponse(response) {
    try {
      // Verify Google token
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.credential}`);
      const user = await res.json();
  
      // Send email to backend
      const loginResponse = await fetch(`${API_URL}/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email,jobDetails: selectedJob }),
      });
  
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        if (errorData.message === "User not found") {
          toast.info("User not found. Redirecting to Sign Up.");
          return switchToSignup();
        }
        throw new Error(errorData.message || "Google login failed");
      }
  
      const data = await loginResponse.json();
      toast.success(`Welcome back, ${data.username}!`);
      console.log("Logged in as:", data.username);
  

      localStorage.setItem("email", data.email);
      localStorage.setItem("username", data.username);
      // Clear any stored job info
      localStorage.removeItem("selectedJob");
      navigate("/fill"); // Navigate to the "fill" page

    } catch (err) {
      console.error("Google Login Failed:", err);
      toast.error(err.message || "Google login failed");
    }
  }
  
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, jobDetails: selectedJob }),
      });
    
      if (!response.ok) throw new Error("Invalid credentials");
    
      const data = await response.json();
      toast.success(data.message || "Login successful!");
      
      // Optional: Do something with returned username
      console.log("Logged in as:", data.username);

      localStorage.setItem("email", data.email);
      localStorage.setItem("username", data.username);

      localStorage.removeItem("selectedJob");
      navigate("/fill"); // Navigate to the "fill" page

    
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed");
    }
    

      // Submit application if job is selected
      // if (selectedJob) {
      //   const applicationResponse = await fetch(`${API_URL}/storeApplication`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       userCredentials: data,
      //       jobDetails: selectedJob,
      //     }),
      //   });
      //   if (!applicationResponse.ok) {
      //     const applicationErrorData = await applicationResponse.json();
      //     throw new Error(applicationErrorData.message || "Failed to store application");
      //   }
      //   toast.success("Application submitted successfully!");
      //   localStorage.removeItem("selectedJob");
      // }
    // } catch (error) {
    //   toast.error(error.message || "Failed to login");
    // }
  };

  return (
    <>
      {/* <h1>Login</h1> */}
      <form>
        <div className="block">
          <div className="input_info">
            <label>Email ID</label>
            <input 
              type="text"
              placeholder="Your email address" 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input_info">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Your password" 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="submit_login" onClick={handleLogin}>Continue</button>
          <div className="or-line"><span>OR</span></div>
          <div id="google-login"></div>
        </div>
      </form>
    </>
  );
}
