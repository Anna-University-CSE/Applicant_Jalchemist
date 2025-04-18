const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai"); // Import OpenAI class
require("dotenv").config(); // Load environment variables

// Initialize OpenAI API with the secret key from .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Load API key from .env file
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message not provided" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in chatbot:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch response from OpenAI" });
  }
});

module.exports = router;
