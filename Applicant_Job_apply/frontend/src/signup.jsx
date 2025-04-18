import { useEffect, useState } from "react";
import "./signup.css";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:5000/api'; // Unified API URL

export default function Signup() {
  const [username, setUsername] = useState("");
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

    // Google Sign-In setup
    window.google.accounts.id.initialize({
      client_id: "169492076098-sch0jg8ua4bn8qr2pjth6hndsh6a91ei.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(document.getElementById("google-login"), {
      theme: "outline",
      size: "large",
      text: "signup_with",
    });
  }, []);

  function handleCredentialResponse(response) {
    fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.credential}`)
      .then((res) => res.json())
      .then((user) => {
        fetch(`${API_URL}/signup/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: user.name, email: user.email ,jobDetails:selectedJob}),
        })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => Promise.reject(data));
          }
          return res.json();
        })
        .then(async (data) => {
          toast.success(data.message || "Signed up successfully!");

          // const applicationResponse = await fetch(`${API_URL}/storeApplication`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     userCredentials: data, // assuming it returns name/email/id
          //     jobDetails: selectedJob,
          //   }),
          // });

          // if (!applicationResponse.ok) {
          //   const applicationErrorData = await applicationResponse.json();
          //   throw new Error(applicationErrorData.message || "Failed to store application");
          // }
          localStorage.setItem("email", data.email);
          localStorage.setItem("username", data.username);
          toast.success("Details stored in db!");
          localStorage.removeItem("selectedJob");
          navigate("/fill"); // Navigate to the "fill" page

        })
        .catch(err => {
          toast.error(err.message || "Failed to register with Google");
          console.error("Failed to register user", err);
        });
      })
      .catch((err) => {
        toast.error("Failed to verify Google token");
        console.error("Failed to verify token", err);
      });
  }

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (username.length < 3 || /[^a-zA-Z0-9 ]/.test(username)) {
      toast.error("Username must be at least 3 characters long and contain only letters, numbers and spaces");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password,jobDetails:selectedJob }),
      });
      if (!response.ok) throw new Error("Failed to register");
      const data = await response.json();
      localStorage.setItem("email", data.email);
      localStorage.setItem("username", data.username);
      localStorage.removeItem("selectedJob");

      toast.success(data.message || "Signup successful!");
      navigate("/fill"); // Navigate to the "fill" page

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
    } catch (error) {
      toast.error(error.message || "Failed to register");
    }
  };

  return (
    <>
      {/* <h1>Sign Up</h1> */}
      <form>
        <div className="block">
          <div className="input_info">
            <label>Username</label>
            <input
              type="text"
              placeholder="Your Name (min. 3 characters)"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
              placeholder="Create a password (min. 6 characters)"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="submit_login" onClick={handleSignup}>
            Create an Account
          </button>
          <div className="or-line">
            <span>or</span>
          </div>
          <div id="google-login"></div>
        </div>
      </form>
    </>
  );
}
