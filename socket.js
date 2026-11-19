const { Server } = require("socket.io");
const mongoose = require("mongoose");
const MessagesModel = require("./models/MessagesModel");
const User = require("./models/UserModel");
const { verifyAccessToken } = require("./utils/jwt");

let io = null;
const connectedUsers = new Map(); // userId -> socketId

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // JWT Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id || decoded._id || decoded.userId;
      socket.user = await User.findById(socket.userId).select("fullname name email avatar");
      if (!socket.userId || !socket.user) {
        return next(new Error("Authentication error: User not found"));
      }
      
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);
    
    // Register user as online
    connectedUsers.set(socket.userId.toString(), socket.id);
    
    // Join personal room for direct messages
    socket.join(socket.userId.toString());
    
    // Broadcast online status to friends
    socket.broadcast.emit("user_online", { userId: socket.userId });

    // ===============================
    // MESSAGE EVENTS
    // ===============================
    const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
    const isParticipant = (message, userId) =>
      message.senderId.toString() === userId.toString() ||
      message.receiverId.toString() === userId.toString();
    const emitValidationError = (message, tempId) =>
      socket.emit("error", { message, tempId });
    
    socket.on("send_message", async (data) => {
      try {
        const { tempId, receiverId, text, replyTo } = data;
        const senderId = socket.userId;
        if (
          !isValidId(receiverId) ||
          receiverId.toString() === senderId.toString() ||
          typeof text !== "string" ||
          !text.trim() ||
          text.length > 5000
        ) {
          return emitValidationError("Invalid message data", tempId);
        }
        const receiver = await User.findById(receiverId).select("_id");
        if (!receiver) {
          return emitValidationError("Recipient not found", tempId);
        }
        if (replyTo) {
          if (!isValidId(replyTo)) {
            return emitValidationError("Invalid reply target", tempId);
          }
          const parent = await MessagesModel.findById(replyTo);
          if (!parent || !isParticipant(parent, senderId)) {
            return emitValidationError("Reply target not found", tempId);
          }
          const otherParticipant =
            parent.senderId.toString() === senderId.toString()
              ? parent.receiverId.toString()
              : parent.senderId.toString();
          if (otherParticipant !== receiverId.toString()) {
            return emitValidationError(
              "Reply recipient must match the conversation",
              tempId,
            );
          }
        }

        // Save message to database
        const message = await MessagesModel.create({
          senderId,
          receiverId,
          text: text.trim(),
          replyTo: replyTo || null,
          read: false
        });

        // Populate for response
        const populatedMessage = await MessagesModel.findById(message._id)
          .populate("senderId", "fullname name email avatar")
          .populate("replyTo", "text")
          .populate("reactions.userId", "fullname");

        // Emit to receiver's room
        io.to(receiverId.toString()).emit("new_message", {
          message: populatedMessage,
          tempId
        });

        // Confirm to sender
        socket.emit("message_sent", {
          message: populatedMessage,
          tempId
        });

        // Send notification if receiver is offline
        const receiverSocketId = connectedUsers.get(receiverId.toString());
        if (!receiverSocketId) {
          // You can integrate with your notification system here
          console.log(`User ${receiverId} is offline, notification queued`);
        }

      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", {
          message: "Failed to send message",
          tempId: data && data.tempId,
        });
      }
    });

    socket.on("edit_message", async (data) => {
      try {
        const { messageId, text } = data;
        if (!isValidId(messageId) || typeof text !== "string" || !text.trim() || text.length > 5000) {
          return emitValidationError("Invalid message data");
        }
        
        let message = await MessagesModel.findById(messageId);
        if (!message || message.senderId.toString() !== socket.userId.toString()) {
          return emitValidationError("Unauthorized or message not found");
        }

        message.text = text.trim();
        message.isEdited = true;
        await message.save();

        const populatedMessage = await MessagesModel.findById(message._id)
          .populate("senderId", "fullname name email avatar")
          .populate("replyTo", "text")
          .populate("reactions.userId", "fullname");

        // Notify both sender and receiver
        io.to([socket.userId.toString(), message.receiverId.toString()]).emit("message_edited", {
          message: populatedMessage
        });

      } catch (err) {
        console.error("Edit message error:", err);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    socket.on("delete_message", async (data) => {
      try {
        const { messageId } = data;
        if (!isValidId(messageId)) {
          return emitValidationError("Invalid message ID");
        }
        
        const message = await MessagesModel.findById(messageId);
        if (!message || message.senderId.toString() !== socket.userId.toString()) {
          return emitValidationError("Unauthorized or message not found");
        }

        const receiverId = message.receiverId.toString();
        await MessagesModel.findByIdAndDelete(messageId);

        // Notify both users
        io.to([socket.userId.toString(), receiverId.toString()]).emit("message_deleted", {
          messageId
        });

      } catch (err) {
        console.error("Delete message error:", err);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    socket.on("add_reaction", async (data) => {
      try {
        const { messageId, emoji } = data;
        const userId = socket.userId;
        if (
          !isValidId(messageId) ||
          typeof emoji !== "string" ||
          !emoji.trim() ||
          emoji.length > 32
        ) {
          return emitValidationError("Invalid reaction data");
        }

        let message = await MessagesModel.findById(messageId);
        if (!message) {
          return socket.emit("error", { message: "Message not found" });
        }
        if (!isParticipant(message, userId)) {
          return emitValidationError("Not authorized to react to this message");
        }

        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId.toString()
        );

        if (existingIndex >= 0) {
          if (message.reactions[existingIndex].emoji === emoji) {
            // Remove reaction if same emoji clicked
            message.reactions.splice(existingIndex, 1);
          } else {
            // Update reaction
            message.reactions[existingIndex].emoji = emoji;
          }
        } else {
          message.reactions.push({ userId, emoji });
        }

        await message.save();
        
        const populatedMessage = await message.populate("reactions.userId", "fullname");

        // Notify conversation participants
        const room = [message.senderId.toString(), message.receiverId.toString()];
        io.to(room).emit("reaction_updated", { message: populatedMessage });

      } catch (err) {
        console.error("Reaction error:", err);
        socket.emit("error", { message: "Failed to add reaction" });
      }
    });

    // ===============================
    // TYPING INDICATORS
    // ===============================
    
    socket.on("typing", (data) => {
      const { receiverId } = data;
      socket.to(receiverId.toString()).emit("user_typing", {
        userId: socket.userId
      });
    });

    socket.on("stop_typing", (data) => {
      const { receiverId } = data;
      socket.to(receiverId.toString()).emit("user_stop_typing", {
        userId: socket.userId
      });
    });

    // ===============================
    // READ RECEIPTS
    // ===============================
    
    socket.on("mark_read", async (data) => {
      try {
        const { messageId } = data;
        if (!isValidId(messageId)) {
          return emitValidationError("Invalid message ID");
        }
        
        const message = await MessagesModel.findOneAndUpdate(
          { _id: messageId, receiverId: socket.userId, read: false },
          { read: true },
          { new: true }
        );

        if (message) {
          // Notify sender that message was read
          io.to(message.senderId.toString()).emit("message_read", {
            messageId: message._id,
            readAt: new Date()
          });
        }
      } catch (err) {
        console.error("Mark read error:", err);
      }
    });

    socket.on("mark_all_read", async (data) => {
      try {
        const { senderId } = data;
        if (!isValidId(senderId) || senderId.toString() === socket.userId.toString()) {
          return emitValidationError("Invalid sender ID");
        }
        
        const result = await MessagesModel.updateMany(
          { senderId, receiverId: socket.userId, read: false },
          { read: true }
        );

        if (result.modifiedCount > 0) {
          io.to(senderId.toString()).emit("messages_read", {
            by: socket.userId
          });
        }
      } catch (err) {
        console.error("Mark all read error:", err);
      }
    });

    // ===============================
    // FRIEND REQUEST EVENTS
    // ===============================
    
    socket.on("send_friend_request", (data) => {
      const { recipientId } = data;
      io.to(recipientId.toString()).emit("friend_request_received", {
        from: socket.userId
      });
    });

    socket.on("friend_request_response", (data) => {
      const { requestId, status } = data;
      // Broadcast to update friend lists
      socket.broadcast.emit("friend_request_updated", { requestId, status });
    });

    // ===============================
    // CONVERSATION MANAGEMENT
    // ===============================
    
    socket.on("join_conversation", (data) => {
      const { friendId } = data;
      const roomName = [socket.userId.toString(), friendId.toString()].sort().join("_");
      socket.join(roomName);
      console.log(`User ${socket.userId} joined room ${roomName}`);
    });

    socket.on("leave_conversation", (data) => {
      const { friendId } = data;
      const roomName = [socket.userId.toString(), friendId.toString()].sort().join("_");
      socket.leave(roomName);
    });

    // ===============================
    // DISCONNECT HANDLER
    // ===============================
    
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.userId} (Reason: ${reason})`);
      connectedUsers.delete(socket.userId.toString());
      socket.broadcast.emit("user_offline", { userId: socket.userId });
    });
  });

  return io;
};

// Helper functions for HTTP controllers
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};

module.exports = {
  initializeSocket,
  emitToUser,
  getIO,
  getConnectedUsers,
  isUserOnline
};