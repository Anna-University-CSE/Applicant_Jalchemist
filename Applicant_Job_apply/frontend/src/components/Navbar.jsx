import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Update logged-in status when component mounts or after logout
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedUsername = localStorage.getItem("username");

    if (storedEmail && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogin = () => {
    navigate("/authentication");
  };

  const handleAccount = () => {
    navigate("/account");
  };

  const handleLogout = async () => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      try {
        await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error("Failed to log out:", err);
      }
    }

    // Remove items from localStorage
    localStorage.removeItem("email");
    localStorage.removeItem("username");

    // Update the UI to reflect the logged-out state
    setIsLoggedIn(false);
    setUsername("");
    navigate("/"); // Redirect to home page after logout
  };

  return (
    <header className="navbar">
      {/* Dropdown button */}
      <button className="dropdown-button" onClick={toggleDropdown}>
        {isDropdownOpen ? "✖" : "☰"}
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <button         id='close'   onClick={()=>{setIsDropdownOpen(false)}}  >✖</button>
          <Link to="/" onClick={toggleDropdown}>Home</Link>
          {/* <Link to="/search" onClick={toggleDropdown}>Search Jobs</Link> */}
          <Link to="/chatbot" onClick={toggleDropdown}>AI Chatbot</Link>
         { !isLoggedIn ?'' :
          <button onClick={handleLogout} className="logout-button">Logout</button>
         }
        </div>
      )}

      {/* Branding */}
      <div className="navbar-brand">
        <h1>Jalchemist</h1>
      </div>

      {/* Account/Login Section */}
      <div className="navbar-login">
        {!isLoggedIn ? (
          <button onClick={handleLogin} className="login-button">Log In</button>
        ) : (
          <div>
            <button   class='nav' onClick={handleAccount} className="login-button">My Account</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
