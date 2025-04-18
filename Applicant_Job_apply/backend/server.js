const dotenv = require("dotenv");
dotenv.config(); // ✅ Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const User = require("./models/User");
const JobApplication = require("./models/JobApplication");

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI); // ✅ this now works
let activeSessionsCollection;

async function connectMongo() {
  try {
    await client.connect();
    const db = client.db("JobAppDB");
    activeSessionsCollection = db.collection("activeSessions");
    if(activeSessionsCollection)
    {
    console.log("MongoDB (native) connected");
    }
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

connectMongo();

// Update active session for the user
async function updateActiveSession({ email, username, jobDetails }) {
  if (!activeSessionsCollection) return;

  const sessionUpdate = {
    email,
    username,
    jobApplications: jobDetails ? [jobDetails] : [], // Always store as array
  };

  await activeSessionsCollection.updateOne(
    { email },
    { $set: sessionUpdate },
    { upsert: true }
  );
}

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Validate required environment variables
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.error("Error: MongoDB URI is not defined in .env file");
  process.exit(1);
}

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI.replace('<db_password>', process.env.DB_PASSWORD);

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import and use external routes
const chatRouter = require("./routes/chat");
const jobsRouter = require("./routes/jobs");
app.use("/api/chat", chatRouter);
app.use("/api/jobs", jobsRouter);

// --- SIGNUP (Normal) ---
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, jobDetails } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists!' });

    const user = new User({ username, email, password });
    await user.save();

    if (jobDetails) {
      const { _id, ...jobWithoutId } = jobDetails; // Safely handle job details

      // Create the job application for the user
      await JobApplication.create({
        username: username,
        email: email,
        ...jobWithoutId,
      });
    }

    await updateActiveSession({ email, username, jobDetails: jobDetails ? jobDetails : null });

    res.status(201).json({ message: 'Signup successful!' ,username: user.username,email:user.email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// --- SIGNUP (Google) ---
app.post('/api/signup/google', async (req, res) => {
  try {
    const { username, email, jobDetails } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists!' });
    // Create new Google user
       const user = new User({
         username: username,
         email,
         password: 'google-auth',
         isGoogleUser: true
       });
   
       await user.save();
    console.log(user);
    if (jobDetails) {
      const { _id, ...jobWithoutId } = jobDetails; // Safely destructure jobDetails

      await JobApplication.create({
        username: user.username,
        email: user.email,
        ...jobWithoutId,
      });
    } else {
      console.log("No job details found for user.");
    }

    // await updateActiveSession({ email, username: user.username, jobDetails: jobDetails ? jobDetails : null });

    return res.json({ message: 'Registered Successfully!', username: user.username,email:user.email });
  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Failed to Register with Google' });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, jobDetails } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isGoogleUser && user.password === 'google-auth') {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { password, isGoogleUser: false },
        { new: true }
      );

      if (updatedUser && jobDetails) {
        const { _id, ...jobWithoutId } = jobDetails; // Remove _id before creating the job application

        await JobApplication.create({
          username: updatedUser.username,
          email: updatedUser.email,
          ...jobWithoutId,
        });
      }

      return res.json({ message: 'Password set successfully!', username: updatedUser.username ,email:updatedUser.email });
    }

    // Regular login
    if (user.password === password) {
      if (jobDetails) {
        const { _id, ...jobWithoutId } = jobDetails; // Safely remove _id from job details
        console.log(jobDetails);
        const application = new JobApplication({
          username: user.username,
          email: user.email,
          ...jobWithoutId,
        });

        await application.save(); // Save job application in DB
      }
      
      await updateActiveSession({ email:user.email, username: user.username, jobDetails: jobDetails ? jobDetails : null });

      return res.json({ message: 'Login successful!', username: user.username,email:user.email });

    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// --- GOOGLE LOGIN ---
app.post('/api/login/google', async (req, res) => {
  try {
    const { email, jobDetails } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.email === email) {
      if (jobDetails) {
        console.log(jobDetails);
        const { _id, ...jobWithoutId } = jobDetails; // Safely destructure job details

        await JobApplication.create({
          username: user.username,
          email: user.email,
          ...jobWithoutId,
        });
      }

      await updateActiveSession({ email, username: user.username, jobDetails: jobDetails ? jobDetails : null });

      return res.json({ message: 'Login successful!', username: user.username ,email:user.email });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Failed to login with Google' });
  }
});

// Account retrieval
app.get('/api/account', async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) return res.status(400).json({ message: "Email required" });

    const session = await activeSessionsCollection.findOne({ email });
    if (!session) return res.status(404).json({ message: "No active session found" });

    res.json(session);
  } catch (err) {
    console.error("Account fetch error:", err);
    res.status(500).json({ message: "Failed to fetch account info" });
  }
});


app.get("/api/appliedJobs", async (req, res) => {
  const { email } = req.query;

  try {
    // Fetch the job applications for the given username
    const applications = await JobApplication.find({ email }).lean();

    // Map the applications to include the timestamp
    const response = applications.map((job) => ({
      ...job,
      appliedOn: job._id.getTimestamp(),
    }));

    // Return the applications with the applied date
    res.json({ appliedJobs: response });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// In your backend (Express.js example)
app.post('/api/jobapplications', async (req, res) => {
  try {
    const { username, email,jobDetails } = req.body;
    const { _id, ...jobWithoutId } = jobDetails; // Safely destructure job details

        await JobApplication.create({
          username,
          email,
          ...jobWithoutId,
        });
    res.status(200).send("Application submitted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting application.");
  }
});


// Logout route
app.post('/api/logout', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email required" });

    await activeSessionsCollection.deleteOne({ email });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Failed to logout" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Error handling
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
