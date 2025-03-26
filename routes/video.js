const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Video = require('../models/Video'); // Import Video model

/** ✅ Create a new video post */
router.post('/create', async (req, res) => {
  try {
    const { videoUrl, videoId, postUserEmail, description, likes, comments, saveByUser, sharedByUser } = req.body;

    // Check if video ID already exists
    const existingVideo = await Video.findOne({ videoId });
    if (existingVideo) {
      return res.status(400).json({ message: "Video ID already exists!" });
    }

    // Create new video
    const newVideo = new Video({
      videoUrl,
      videoId,
      postUserEmail,
      description,
      likes: likes || [],
      comments: comments || [],
      saveByUser: saveByUser || [],
      sharedByUser: sharedByUser || []
    });

    // Save to DB
    await newVideo.save();
    res.status(201).json({ message: "Video created successfully!", video: newVideo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** ✅ Get all videos */
router.get('/all', async (req, res) => {
    try {
      const videos = await Video.find();
      res.status(200).json(videos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  /** ✅ Get a single video by ID */
  router.get('/:videoId', async (req, res) => {
    try {
      const video = await Video.findOne({ videoId: req.params.videoId });
      if (!video) return res.status(404).json({ message: 'Video not found' });
      res.status(200).json(video);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /** ✅ Like a video */
router.post("/like-video", async (req, res) => {
  try {
    const { videoId, userEmail } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const isLiked = video.likes.includes(userEmail);

    if (isLiked) {
      // Unlike the video (remove user)
      video.likes = video.likes.filter((email) => email !== userEmail);
      await video.save();
      return res.json({ message: "Video unliked", likes: video.likes });
    } else {
      // Like the video (add user)
      video.likes.push(userEmail);
      await video.save();
      return res.json({ message: "Video liked", likes: video.likes });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
/** ✅ Add a comment */
router.post("/comment-video", async (req, res) => {
  try {
    const { videoId, username, comment, action, commentId } = req.body;

    // Validate videoId format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid videoId format" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (action === "add") {
      // Add new comment
      const newComment = {
        _id: new mongoose.Types.ObjectId(),
        username,
        comment,
        createdAt: Date.now(),
        likes: [],
      };
      video.comments.push(newComment);
    } else if (action === "delete") {
      // Remove comment
      video.comments = video.comments.filter((c) => c._id.toString() !== commentId);
    } else if (action === "like") {
      // Find the comment
      const targetComment = video.comments.find((c) => c._id.toString() === commentId);
      if (!targetComment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Toggle Like
      if (!targetComment.likes.includes(username)) {
        targetComment.likes.push(username);
      } else {
        targetComment.likes = targetComment.likes.filter((user) => user !== username);
      }
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'add', 'delete', or 'like'." });
    }

    await video.save();

    return res.json({ message: "Success", comments: video.comments });

  } catch (error) {
    console.error("Error in comment-video API:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
   /** ✅ Save a video */
router.put('/save/:videoId', async (req, res) => {
    try {
      const { userEmail } = req.body;
      const video = await Video.findOne({ videoId: req.params.videoId });
  
      if (!video) return res.status(404).json({ message: 'Video not found' });
  
      if (!video.saveByUser.includes(userEmail)) {
        video.saveByUser.push(userEmail);
        await video.save();
      }
  
      res.status(200).json({ message: 'Video saved!', savedBy: video.saveByUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
/** ✅ Share a video */
router.put('/share/:videoId', async (req, res) => {
    try {
      const { userEmail } = req.body;
      const video = await Video.findOne({ videoId: req.params.videoId });
  
      if (!video) return res.status(404).json({ message: 'Video not found' });
  
      if (!video.sharedByUser.includes(userEmail)) {
        video.sharedByUser.push(userEmail);
        await video.save();
      }
  
      res.status(200).json({ message: 'Video shared!', sharedBy: video.sharedByUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
     

module.exports = router;
