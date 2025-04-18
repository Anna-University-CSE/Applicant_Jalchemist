import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5000/api/chat", { message: input });
      const botReply = { role: "bot", content: response.data.response };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      const botReply = { role: "bot", content: "Sorry, I couldn't process your request." };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="chatbot-container">
      <h2>Chat with AI</h2>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "user-message" : "bot-message"}>
            {msg.content}
          </div>
        ))}
        {isLoading && <p>Bot is typing...</p>}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;
