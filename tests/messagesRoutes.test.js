const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const MessageService = require("../services/MessagesService");
const messageRoutes = require("../routes/MessagesRoutes");

jest.mock("../services/MessagesService", () => ({
  sendMessage: jest.fn(),
  getConversation: jest.fn(),
  addReaction: jest.fn(),
  replyToMessage: jest.fn(),
  deleteMessage: jest.fn(),
  editMessage: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/messages", messageRoutes);

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439012";
const token = () =>
  jwt.sign(
    { id: userId, role: "user" },
    process.env.ACCESS_TOKEN_SECRET,
  );

describe("message routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-messages-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("derives the sender identity from the authenticated user", async () => {
    MessageService.sendMessage.mockResolvedValue({ _id: "message-1" });
    const response = await request(app)
      .post("/messages/message")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        senderId: otherUserId,
        receiverId: otherUserId,
        text: "Hello",
      });

    expect(response.status).toBe(201);
    expect(MessageService.sendMessage).toHaveBeenCalledWith(userId, {
      receiverId: otherUserId,
      text: "Hello",
    });
  });

  it("only allows a conversation containing the authenticated user", async () => {
    const unauthorized = await request(app)
      .get(`/messages/messages/${otherUserId}/507f1f77bcf86cd799439013`)
      .set("Authorization", `Bearer ${token()}`);
    expect(unauthorized.status).toBe(403);
    expect(MessageService.getConversation).not.toHaveBeenCalled();

    MessageService.getConversation.mockResolvedValue([]);
    const authorized = await request(app)
      .get(`/messages/messages/${otherUserId}/${userId}`)
      .set("Authorization", `Bearer ${token()}`);

    expect(authorized.status).toBe(200);
    expect(MessageService.getConversation).toHaveBeenCalledWith(
      userId,
      otherUserId,
    );
  });

  it("validates message IDs and content before service calls", async () => {
    const response = await request(app)
      .patch("/messages/message/not-an-id")
      .set("Authorization", `Bearer ${token()}`)
      .send({ text: "Edited" });

    expect(response.status).toBe(400);
    expect(MessageService.editMessage).not.toHaveBeenCalled();
  });
});
