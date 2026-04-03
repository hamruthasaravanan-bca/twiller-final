import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Post from "./models/post.js";

dotenv.config();
const app = express();

// --- UPDATED CORS FIX ---
app.use(cors({
  origin: [
    "https://twitter-app-final.onrender.com", // Unga pudhu Render Frontend URL
    "https://twitter-clone-jg73-hamruthasaravanan-bcas-projects.vercel.app",
    "https://twitter-clone-jg73.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// ------------------------

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://hamru_21:hamru2006@cluster0.gzqz9qa.mongodb.net/?appName=Cluster0";

// 1. Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

// --- ROUTES ---

// 2. Default route
app.get("/", (req, res) => {
  res.send("Twiller backend is running successfully");
});

// 3. Like logic route
app.post("/like/:id", async (req, res) => {
  try {
    const tweet = await Post.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    if (!tweet.likedBy) tweet.likedBy = [];

    if (tweet.likedBy.includes(userId)) {
      tweet.likedBy = tweet.likedBy.filter(id => id !== userId);
      tweet.likesCount = Math.max(0, (tweet.likesCount || 1) - 1);
    } else {
      tweet.likedBy.push(userId);
      tweet.likesCount = (tweet.likesCount || 0) + 1;
    }
    await tweet.save();
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Comment logic route
app.post("/comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text, userName, avatar } = req.body;

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const tweet = await Post.findById(id);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    tweet.replies.push({
      userId: userId,
      userName: userName || "Hamrutha Saravanan",
      avatar: avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png", 
      text: text,
      createdAt: new Date(),
    });
    
    tweet.commentsCount = (tweet.commentsCount || 0) + 1;

    await tweet.save();
    res.status(200).json(tweet);
  } catch (err) {
    console.error("Comment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 5. Create Post Route
app.post("/post", async (req, res) => {
  try {
    const { userName, postText, image, userEmail, avatar } = req.body;

    if (!postText || !userEmail) {
      return res.status(400).json({ message: "postText and userEmail are required" });
    }

    const newPost = new Post({
      userName: userName || "Hamrutha Saravanan",
      postText: postText,
      image: image || "",
      userEmail: userEmail,
      avatar: avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      replies: []
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error saving post:", error.message);
    res.status(500).json({ message: "Error saving post", error: error.message });
  }
});

// 6. Get All Posts Route
app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Register Route
app.post("/register", async (req, res) => {
  try {
    const { email, displayName, avatar } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        displayName: displayName || "Hamrutha Saravanan", 
        avatar: avatar || "" 
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 8. Get logged user
app.get("/loggeduser", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});