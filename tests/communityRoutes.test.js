const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const CommunityService = require("../services/CommunityService");
const communityRoutes = require("../routes/CommunityRoutes");

jest.mock("../services/CommunityService", () => ({
  createCommunity: jest.fn(),
  getCommunities: jest.fn(),
  getCommunity: jest.fn(),
  updateCommunity: jest.fn(),
  deleteCommunity: jest.fn(),
  joinCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
  promoteToAdmin: jest.fn(),
  pinPost: jest.fn(),
  unpinPost: jest.fn(),
  getCommunityPosts: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/communities", communityRoutes);

const token = () =>
  jwt.sign(
    { id: "authenticated-user", role: "user" },
    process.env.ACCESS_TOKEN_SECRET,
  );

describe("community routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-community-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and valid content to create a community", async () => {
    const unauthenticated = await request(app)
      .post("/communities")
      .send({ name: "New group", description: "A group" });
    const invalid = await request(app)
      .post("/communities")
      .set("Authorization", `Bearer ${token()}`)
      .send({ name: "", description: "A group" });

    expect(unauthenticated.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(CommunityService.createCommunity).not.toHaveBeenCalled();
  });

  it("uses the authenticated user for membership changes, ignoring caller user IDs", async () => {
    CommunityService.leaveCommunity.mockResolvedValue({ _id: "community-1" });
    const response = await request(app)
      .patch("/communities/507f1f77bcf86cd799439011/leave")
      .set("Authorization", `Bearer ${token()}`)
      .send({ userId: "attacker-id" });

    expect(response.status).toBe(200);
    expect(CommunityService.leaveCommunity).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "authenticated-user",
    );
  });

  it("rejects malformed community and post IDs before service calls", async () => {
    const response = await request(app)
      .patch("/communities/not-an-id/pin")
      .set("Authorization", `Bearer ${token()}`)
      .send({ postId: "also-invalid" });

    expect(response.status).toBe(400);
    expect(CommunityService.pinPost).not.toHaveBeenCalled();
  });
});
