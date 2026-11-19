const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const enrollmentRoutes = require("../routes/EnrollmentRoutes");

const app = express();
app.use(enrollmentRoutes);

describe("enrollment route access and validation", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
  });

  it("rejects unauthenticated enrollment requests", async () => {
    const response = await request(app).get("/enrollments/not-an-id");

    expect(response.status).toBe(401);
  });

  it("rejects malformed enrollment IDs after authentication", async () => {
    const token = jwt.sign(
      { id: "user-1", role: "user" },
      process.env.ACCESS_TOKEN_SECRET,
    );
    const response = await request(app)
      .get("/enrollments/not-an-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects malformed lesson IDs before calling the completion service", async () => {
    const token = jwt.sign(
      { id: "user-1", role: "user" },
      process.env.ACCESS_TOKEN_SECRET,
    );
    const response = await request(app)
      .patch(
        "/enrollments/507f1f77bcf86cd799439011/lessons/not-an-id/complete",
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
