const route = require("express").Router();
const MessagesController = require("../controllers/MessagesController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  messageIdParamsSchema,
  sendMessageSchema,
  conversationParamsSchema,
  reactionSchema,
  replySchema,
  editMessageSchema,
} = require("../validations/message.validation");

// Send message
route.post(
  "/message",
  authMiddleware.verifyToken,
  validate(sendMessageSchema),
  MessagesController.SendMessage,
);

// Get conversation between two users
route.get(
  "/messages/:userId/:otherUserId",
  authMiddleware.verifyToken,
  validate(conversationParamsSchema),
  MessagesController.GetConversations,
);

// Add reaction
route.patch(
  "/message/:id/reaction",
  authMiddleware.verifyToken,
  validate(reactionSchema),
  MessagesController.AddReaction,
);

// Reply to message
route.patch(
  "/message/:id/reply",
  authMiddleware.verifyToken,
  validate(replySchema),
  MessagesController.ReplyToMessage,
);

// Edit message
route.patch(
  "/message/:id",
  authMiddleware.verifyToken,
  validate(editMessageSchema),
  MessagesController.EditMessage,
);

// Delete message
route.delete(
  "/message/:id",
  authMiddleware.verifyToken,
  validate(messageIdParamsSchema),
  MessagesController.DeleteMessage,
);

module.exports = route;