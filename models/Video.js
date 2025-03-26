const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true, unique: true },
  postUserEmail: { type: String, required: true },
  description: { type: String },
  likes: { type: Array, default: [] },
  comments: [
    {
       _id: mongoose.Schema.Types.ObjectId,
      username: String,
      comment: String,
      createdAt: { type: Number, default: Date.now },
      likes: { type: Array, default: [] }, // Array of user IDs who liked the comment
    }
  ],
  saveByUser: { type: Array, default: [] }, // List of users who saved the video
  sharedByUser: { type: Array, default: [] } // List of users who shared the video
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
