import { useState } from "react";
import Login from "./login";
import Signup from "./signup";
import "./Auth.css"; // For styling

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login"); // Default is login

  // Function to switch between Login and Sign Up
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="auth-container">
      {/* Tab Navigation */}
      <div className="auth-tabs">
        <button
          className={activeTab === "login" ? "active" : ""}
          onClick={() => handleTabChange("login")}
        >
          Login
        </button>
        <button
          className={activeTab === "signup" ? "active" : ""}
          onClick={() => handleTabChange("signup")}
        >
          Sign Up
        </button>
      </div>

      {/* Content */}
      <div className="auth-content">
        {activeTab === "login" ? <Login switchToSignup={() => handleTabChange("signup")} /> : <Signup />}
      </div>
    </div>
  );
}
