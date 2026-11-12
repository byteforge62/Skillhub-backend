const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const EventsService = require("../services/EventsService");
const eventsRoutes = require("../routes/EventsRoutes");

jest.mock("../services/EventsService", () => ({
  createEvent: jest.fn(),
  getEvents: jest.fn(),
  getMyEvents: jest.fn(),
  getEvent: jest.fn(),
  updateEvent: jest.fn(),
  cancelEvent: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(eventsRoutes);

const authToken = (payload = { id: "host-1", role: "user" }) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

describe("event routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-events-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication to create an event", async () => {
    const response = await request(app).post("/event").send({});
    expect(response.status).toBe(401);
  });

  it("validates event data and datetime input", async () => {
    const response = await request(app)
      .post("/event")
      .set("Authorization", `Bearer ${authToken()}`)
      .send({
        title: "Test event",
        description: "Testing",
        date: "not-a-date",
        location: "Online",
        banner: "https://example.com/banner.png",
      });

    expect(response.status).toBe(400);
    expect(EventsService.createEvent).not.toHaveBeenCalled();
  });

  it("preserves the legacy create response while binding ownership to the token", async () => {
    const event = { _id: "event-1", status: "draft" };
    EventsService.createEvent.mockResolvedValue(event);
    const response = await request(app)
      .post("/event")
      .set("Authorization", `Bearer ${authToken()}`)
      .send({
        title: "Test event",
        description: "Testing",
        date: "2030-01-01T10:00:00.000Z",
        location: "Online",
        banner: "https://example.com/banner.png",
        hostId: "attacker-id",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Event Added Successfully",
      data: event,
    });
    expect(EventsService.createEvent).toHaveBeenCalledWith(
      {
        title: "Test event",
        description: "Testing",
        date: "2030-01-01T10:00:00.000Z",
        location: "Online",
        banner: "https://example.com/banner.png",
      },
      "host-1",
    );
  });

  it("rejects malformed event IDs and invalid list pagination", async () => {
    const token = authToken();
    const malformedId = await request(app)
      .get("/events/not-an-id")
      .set("Authorization", `Bearer ${token}`);
    const invalidPage = await request(app).get("/events?page=0");

    expect(malformedId.status).toBe(400);
    expect(invalidPage.status).toBe(400);
    expect(EventsService.getEvent).not.toHaveBeenCalled();
    expect(EventsService.getEvents).not.toHaveBeenCalled();
  });

  it("requires authentication for event updates and cancellation", async () => {
    const eventId = "507f1f77bcf86cd799439011";
    const updateResponse = await request(app)
      .patch(`/events/${eventId}`)
      .send({ title: "Updated event" });
    const cancelResponse = await request(app).patch(
      `/events/${eventId}/cancel`,
    );

    expect(updateResponse.status).toBe(401);
    expect(cancelResponse.status).toBe(401);
    expect(EventsService.updateEvent).not.toHaveBeenCalled();
    expect(EventsService.cancelEvent).not.toHaveBeenCalled();
  });
});
