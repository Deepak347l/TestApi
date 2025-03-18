const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
  likes: Number,
  comments: [
    {
      username: String,
      comment: String
    }
  ]
});

const Reel = mongoose.model('reels', reelSchema); // ✅ Correct collection name

module.exports = Reel;
