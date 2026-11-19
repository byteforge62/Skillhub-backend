const MessagesModel = require("../models/MessagesModel");
const UserModel = require("../models/UserModel");
const { getIO } = require("../socket");
const AppError = require("../utils/AppError");

const idOf = (value) => String(value?._id ?? value);

const requireParticipant = (message, userId) => {
  if (
    idOf(message.senderId) !== String(userId) &&
    idOf(message.receiverId) !== String(userId)
  ) {
    throw new AppError("Not authorized to access this message", 403);
  }
};

const sendMessage = async (senderId, { receiverId, text, replyTo }) => {
  if (String(senderId) === String(receiverId)) {
    throw new AppError("You cannot send a message to yourself", 400);
  }
  const receiver = await UserModel.findById(receiverId).select("_id");
  if (!receiver) {
    throw new AppError("Recipient not found", 404);
  }

  if (replyTo) {
    const parent = await MessagesModel.findById(replyTo);
    if (!parent) {
      throw new AppError("Message to reply to was not found", 404);
    }
    requireParticipant(parent, senderId);
    const otherParticipant =
      idOf(parent.senderId) === String(senderId)
        ? idOf(parent.receiverId)
        : idOf(parent.senderId);
    if (otherParticipant !== String(receiverId)) {
      throw new AppError("Reply recipient must match the conversation", 403);
    }
  }

  const message = await MessagesModel.create({
    senderId,
    receiverId,
    text,
    replyTo: replyTo || null,
    read: false,
  });

  const populatedMessage = await MessagesModel.findById(message._id)
    .populate("senderId", "fullname name email avatar")
    .populate("replyTo", "text")
    .populate("reactions.userId", "fullname");

  const io = getIO();

  io.to(receiverId.toString()).emit("new_message", {
    message: populatedMessage,
  });

  return populatedMessage;
};

const getConversation = async (userId, otherUserId) => {
  const messages = await MessagesModel.find({
    $or: [
      {
        senderId: userId,
        receiverId: otherUserId,
      },
      {
        senderId: otherUserId,
        receiverId: userId,
      },
    ],
  })
    .populate("senderId", "name email fullname avatar")
    .populate("replyTo", "text senderId")
    .populate("reactions.userId", "fullname")
    .sort({ createdAt: 1 });

  await MessagesModel.updateMany(
    {
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    {
      read: true,
    },
  );

  return messages;
};

const addReaction = async (messageId, userId, emoji) => {
  let message = await MessagesModel.findById(messageId);

  if (!message) {
    throw new AppError("Message not found", 404);
  }
  requireParticipant(message, userId);

  const existingReaction = message.reactions.findIndex(
    (reaction) => idOf(reaction.userId) === String(userId),
  );

  if (existingReaction >= 0) {
    if (message.reactions[existingReaction].emoji === emoji) {
      message.reactions.splice(existingReaction, 1);
    } else {
      message.reactions[existingReaction].emoji = emoji;
    }
  } else {
    message.reactions.push({
      userId,
      emoji,
    });
  }

  await message.save();

  message = await message.populate("reactions.userId", "fullname");

  const io = getIO();

  io.to([message.senderId.toString(), message.receiverId.toString()]).emit(
    "reaction_updated",
    {
      message,
    },
  );

  return message;
};

const replyToMessage = async (messageId, senderId, text) => {
  const parent = await MessagesModel.findById(messageId);
  if (!parent) {
    throw new AppError("Message to reply to was not found", 404);
  }
  requireParticipant(parent, senderId);
  const receiverId =
    idOf(parent.senderId) === String(senderId)
      ? idOf(parent.receiverId)
      : idOf(parent.senderId);

  const reply = await MessagesModel.create({
    senderId,
    receiverId,
    text,
    replyTo: messageId,
  });

  const populatedReply = await MessagesModel.findById(reply._id)
    .populate("senderId", "fullname name email avatar")
    .populate("replyTo", "text");

  const io = getIO();

  io.to(receiverId.toString()).emit("new_message", {
    message: populatedReply,
  });

  return populatedReply;
};

const deleteMessage = async (messageId, userId) => {
  const message = await MessagesModel.findById(messageId);

  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (idOf(message.senderId) !== String(userId)) {
    throw new AppError("Only the sender can delete this message", 403);
  }

  const senderId = idOf(message.senderId);
  const receiverId = idOf(message.receiverId);

  await MessagesModel.findByIdAndDelete(messageId);

  const io = getIO();

  io.to([senderId, receiverId]).emit("message_deleted", {
    messageId,
  });
};

const editMessage = async (messageId, userId, text) => {
  let message = await MessagesModel.findById(messageId);

  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (idOf(message.senderId) !== String(userId)) {
    throw new AppError("Only the sender can edit this message", 403);
  }

  message.text = text;
  message.isEdited = true;

  await message.save();

  message = await MessagesModel.findById(message._id)
    .populate("senderId", "fullname name email avatar")
    .populate("replyTo", "text")
    .populate("reactions.userId", "fullname");

  const io = getIO();

  io.to([message.senderId.toString(), message.receiverId.toString()]).emit(
    "message_edited",
    {
      message,
    },
  );

  return message;
};

module.exports = {
  sendMessage,
  getConversation,
  addReaction,
  replyToMessage,
  deleteMessage,
  editMessage,
};
