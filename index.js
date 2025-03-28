const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const reelRoutes = require('./routes/reels');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const http = require('http'); // Required for WebSockets
const { Server } = require("socket.io"); // Import socket.io

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Create HTTP Server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this in production)
    methods: ["GET", "POST"]
  }
});

// ✅ Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("🔗 A client connected:", socket.id);

  // Listen for disconnection
  socket.on("disconnect", () => {
    console.log("❌ A client disconnected:", socket.id);
  });
});

// ✅ Function to Broadcast Updates
const broadcastVideoUpdate = async (videoData) => {
  io.emit("videoUpdate", videoData); // Sends data to all connected clients
};

// ✅ Use routes
app.use('/api/reels', reelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);


app.set('io', io);
app.set('broadcastVideoUpdate', broadcastVideoUpdate);

// ✅ Start the Server
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
