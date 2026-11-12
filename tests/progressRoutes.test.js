const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const ProgressService = require("../services/ProgressService");
const progressRoutes = require("../routes/ProgressRoutes");
const errorHandler = require("../middleware/errorHandler");

jest.mock("../services/ProgressService", () => ({
  saveProgress: jest.fn(),
  getProgress: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/progress", progressRoutes);
app.use(errorHandler);

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439099";
const courseId = "507f1f77bcf86cd799439012";
const tokenFor = (id = userId, role = "user") =>
  jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET);

describe("progress routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-progress-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and validates saved progress", async () => {
    const unauthenticated = await request(app)
      .post("/progress/save")
      .send({ courseId, currentQuestionIdx: 1 });
    const invalid = await request(app)
      .post("/progress/save")
      .set("Authorization", `Bearer ${tokenFor()}`)
      .send({ courseId: "bad-id", currentQuestionIdx: -1 });

    expect(unauthenticated.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(ProgressService.saveProgress).not.toHaveBeenCalled();
  });

  it("binds saved progress to the token identity and strips client points", async () => {
    ProgressService.saveProgress.mockResolvedValue({ courseId });
    const response = await request(app)
      .post("/progress/save")
      .set("Authorization", `Bearer ${tokenFor()}`)
      .send({
        userId: otherUserId,
        courseId,
        currentQuestionIdx: 1,
        quizAnswers: {},
        points: 50000,
      });

    expect(response.status).toBe(200);
    expect(ProgressService.saveProgress).toHaveBeenCalledWith(userId, {
      userId: otherUserId,
      courseId,
      currentQuestionIdx: 1,
      quizAnswers: {},
    });
  });

  it("prevents reading another user's progress", async () => {
    const response = await request(app)
      .get(`/progress/${otherUserId}/${courseId}`)
      .set("Authorization", `Bearer ${tokenFor()}`);

    expect(response.status).toBe(403);
    expect(ProgressService.getProgress).not.toHaveBeenCalled();
  });
});
