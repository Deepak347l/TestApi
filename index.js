const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const reelRoutes = require('./routes/reels');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Use routes
app.use('/api/reels', reelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes); // Use the video API

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
