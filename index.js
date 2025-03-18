const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const reelRoutes = require('./routes/reels');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Use routes
app.use('/api/reels', reelRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
