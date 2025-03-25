const express = require('express');
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
router.put('/comment/:videoId', async (req, res) => {
    try {
      const { username, comment } = req.body;
      const video = await Video.findOne({ videoId: req.params.videoId });
  
      if (!video) return res.status(404).json({ message: 'Video not found' });
  
      video.comments.push({ username, comment });
      await video.save();
  
      res.status(200).json({ message: 'Comment added!', comments: video.comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
