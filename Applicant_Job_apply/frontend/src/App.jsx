import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchJobs from "./components/SearchJobs";
import Chatbot from "./components/Chatbot";
import Navbar from "./components/Navbar";
import Auth from "./Auth"; // Adjust this path if necessary
import Account from "./components/Account"; // Import your Account component
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./toast.css"; // Optional: your custom styles

const App = () => {
  return (
    <Router>
      <div className="whole">
        {/* Global Navbar */}
        <Navbar />

        {/* Main App Routes */}
        <main>
          <Routes>
            <Route path="/" element={<SearchJobs />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/authentication" element={<Auth />} />
            <Route path="/account" element={<Account />} /> {/* Add /account route */}
          </Routes>
        </main>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

export default App;
