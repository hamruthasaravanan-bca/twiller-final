import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Post from "./models/post.js";

dotenv.config();
const app = express();

// --- CORS FIX (Allow all for testing, then restrict) ---
app.use(cors({
  origin: "*", // Testing-ku ippo yellathaiyum allow pannunga
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hamru_21:hamru2006@cluster0.gzqz9qa.mongodb.net/twiller?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// --- ROUTES ---

// 1. Root Route (Testing if server is alive)
app.get("/", (req, res) => {
  res.status(200).send("Twiller backend is running successfully!");
});

// 2. Register Route
app.post("/register", async (req, res) => {
  try {
    const { email, displayName, avatar } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        displayName: displayName || "User", 
        avatar: avatar || "" 
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Create Post
app.post("/post", async (req, res) => {
  try {
    const { userName, postText, image, userEmail, avatar } = req.body;
    if (!postText || !userEmail) {
      return res.status(400).json({ message: "postText and userEmail are required" });
    }

    const newPost = new Post({
      userName: userName || "Anonymous",
      postText,
      image: image || "",
      userEmail,
      avatar: avatar || "",
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      replies: []
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Get All Posts
app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});