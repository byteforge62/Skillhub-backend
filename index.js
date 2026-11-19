require("dotenv").config();
require("./events/listners");
require("./config/redis");

const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected");

    // Create HTTP server
    const httpServer = http.createServer(app);
    console.log("PORT =", PORT, typeof PORT);
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    console.log("✅ Socket.IO initialized");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);  
    });
  })
  .catch((err) => {
    console.err("❌ Database connection failed:", err.message);
  });