const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const PostService = require("../services/PostService");
const postRoutes = require("../routes/PostRoutes");

jest.mock("../services/PostService", () => ({
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  toggleLike: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  addCommentReply: jest.fn(),
  getCommunityPosts: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/posts", postRoutes);

const token = () =>
  jwt.sign(
    { id: "authenticated-user", role: "user" },
    process.env.ACCESS_TOKEN_SECRET,
  );

describe("post routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-post-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and valid content to create posts", async () => {
    const unauthenticated = await request(app)
      .post("/posts")
      .send({ content: "A post" });
    const invalid = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "   ", userId: "attacker-id" });

    expect(unauthenticated.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(PostService.createPost).not.toHaveBeenCalled();
  });

  it("uses the authenticated user as post author", async () => {
    PostService.createPost.mockResolvedValue({ _id: "post-1" });
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "A post", userId: "attacker-id" });

    expect(response.status).toBe(201);
    expect(PostService.createPost).toHaveBeenCalledWith(
      "authenticated-user",
      "user",
      { content: "A post", media: [] },
    );
  });

  it("validates post IDs and pagination before service calls", async () => {
    const malformedPost = await request(app)
      .put("/posts/not-an-id")
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "Updated" });
    const invalidPage = await request(app)
      .get("/posts?page=0")
      .set("Authorization", `Bearer ${token()}`);

    expect(malformedPost.status).toBe(400);
    expect(invalidPage.status).toBe(400);
    expect(PostService.updatePost).not.toHaveBeenCalled();
    expect(PostService.getPosts).not.toHaveBeenCalled();
  });

  it("derives comment authorship from the authenticated user", async () => {
    PostService.addComment.mockResolvedValue({ _id: "post-1" });
    const response = await request(app)
      .post("/posts/507f1f77bcf86cd799439011/comment")
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "A comment", userId: "attacker-id" });

    expect(response.status).toBe(200);
    expect(PostService.addComment).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "authenticated-user",
      "A comment",
    );
  });

  it("requires authentication for post deletion", async () => {
    const response = await request(app).delete(
      "/posts/507f1f77bcf86cd799439011",
    );
    expect(response.status).toBe(401);
    expect(PostService.deletePost).not.toHaveBeenCalled();
  });
});
