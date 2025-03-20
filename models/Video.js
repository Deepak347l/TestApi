const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true, unique: true },
  postUserEmail: { type: String, required: true },
  description: { type: String },
  likes: { type: Number, default: 0 },
  comments: [
    {
      username: String,
      comment: String
    }
  ],
  saveByUser: { type: Array, default: [] }, // List of users who saved the video
  sharedByUser: { type: Array, default: [] } // List of users who shared the video
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
