const MessageService = require("../services/MessagesService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");
const AppError = require("../utils/AppError");

const sameId = (left, right) =>
  String(left).toLowerCase() === String(right).toLowerCase();

const SendMessage = catchAsync(async (req, res) => {
  const message = await MessageService.sendMessage(
    req.user.id,
    req.validated.body,
  );

  return ResponseHandler.success(
    res,
    "Message sent successfully",
    message,
    201,
  );
});

const GetConversations = catchAsync(async (req, res) => {
  const { userId, otherUserId } = req.validated.params;
  if (!sameId(userId, req.user.id) && !sameId(otherUserId, req.user.id)) {
    throw new AppError("Not authorized to view this conversation", 403);
  }
  const participantId = sameId(userId, req.user.id) ? otherUserId : userId;
  const messages = await MessageService.getConversation(
    req.user.id,
    participantId,
  );

  return ResponseHandler.success(
    res,
    "Conversation fetched successfully",
    messages,
  );
});

const AddReaction = catchAsync(async (req, res) => {
  const message = await MessageService.addReaction(
    req.validated.params.id,
    req.user.id,
    req.validated.body.emoji,
  );

  return ResponseHandler.success(res, "Reaction updated successfully", message);
});

const ReplyToMessage = catchAsync(async (req, res) => {
  const reply = await MessageService.replyToMessage(
    req.validated.params.id,
    req.user.id,
    req.validated.body.text,
  );

  return ResponseHandler.success(res, "Reply sent successfully", reply, 201);
});

const DeleteMessage = catchAsync(async (req, res) => {
  await MessageService.deleteMessage(req.validated.params.id, req.user.id);

  return ResponseHandler.success(res, "Message deleted successfully");
});

const EditMessage = catchAsync(async (req, res) => {
  const message = await MessageService.editMessage(
    req.validated.params.id,
    req.user.id,
    req.validated.body.text,
  );

  return ResponseHandler.success(res, "Message updated successfully", message);
});

module.exports = {
  SendMessage,
  GetConversations,
  AddReaction,
  ReplyToMessage,
  DeleteMessage,
  EditMessage,
};
