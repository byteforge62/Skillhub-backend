const MessagesModel = require("../models/MessagesModel");
const MessageService = require("../services/MessagesService");

jest.mock("../models/MessagesModel", () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  updateMany: jest.fn(),
  create: jest.fn(),
}));
jest.mock("../models/UserModel", () => ({
  findById: jest.fn(),
}));
jest.mock("../socket", () => ({
  getIO: jest.fn(),
}));

describe("message service authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prevents non-senders from editing or deleting a message", async () => {
    MessagesModel.findById.mockResolvedValue({
      _id: "message-1",
      senderId: "sender-1",
      receiverId: "receiver-1",
    });

    await expect(
      MessageService.editMessage("message-1", "receiver-1", "Changed"),
    ).rejects.toMatchObject({ statusCode: 403 });
    await expect(
      MessageService.deleteMessage("message-1", "receiver-1"),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(MessagesModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("prevents non-participants from changing reactions", async () => {
    MessagesModel.findById.mockResolvedValue({
      _id: "message-1",
      senderId: "sender-1",
      receiverId: "receiver-1",
      reactions: [],
    });

    await expect(
      MessageService.addReaction("message-1", "other-user", "👍"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("prevents replies to messages outside the caller's conversations", async () => {
    MessagesModel.findById.mockResolvedValue({
      _id: "message-1",
      senderId: "sender-1",
      receiverId: "receiver-1",
    });

    await expect(
      MessageService.replyToMessage("message-1", "other-user", "Reply"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(MessagesModel.create).not.toHaveBeenCalled();
  });
});
