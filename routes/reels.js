const express = require('express');
const Reel = require('../models/reel');

const router = express.Router();

// ✅ POST sample data
router.post('/add', async (req, res) => {
  try {
    const sampleData = [
      {
        title: "Funny Cat Reel",
        description: "A funny cat doing crazy stuff!",
        videoUrl: "https://example.com/funny-cat.mp4",
        likes: 1200,
        comments: [
          { username: "user1", comment: "So funny!" },
          { username: "user2", comment: "I can't stop laughing!" }
        ]
      },
      {
        title: "Travel Vlog",
        description: "Exploring the beautiful mountains.",
        videoUrl: "https://example.com/travel-vlog.mp4",
        likes: 850,
        comments: [
          { username: "traveller123", comment: "Amazing view!" },
          { username: "adventure", comment: "Where is this place?" }
        ]
      }
    ];

    const result = await Reel.insertMany(sampleData);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error adding data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET reels
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find(); // ✅ Fetching from the `reels` collection
    res.json(reels);
  } catch (error) {
    console.error('❌ Error fetching reels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
