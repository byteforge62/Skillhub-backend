const EventsModel = require("../models/EventsModel");
const EventsService = require("../services/EventsService");

jest.mock("../models/EventsModel", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

const createEvent = (overrides = {}) => ({
  _id: "event-1",
  title: "Test event",
  description: "An event for testing",
  date: new Date("2030-01-01T10:00:00.000Z"),
  location: "Online",
  banner: "https://example.com/banner.png",
  hostId: "host-1",
  status: "draft",
  save: jest.fn(async function save() {
    return this;
  }),
  ...overrides,
});

const makeQuery = (result) => {
  const query = Promise.resolve(result);
  query.select = jest.fn(() => query);
  query.sort = jest.fn(() => query);
  query.skip = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  return query;
};

describe("EventsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates drafts owned by the authenticated host without accepting caller ownership", async () => {
    const event = createEvent();
    EventsModel.create.mockResolvedValue(event);

    await EventsService.createEvent(
      {
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        banner: event.banner,
        hostId: "attacker-id",
        status: "published",
      },
      "host-1",
    );

    expect(EventsModel.create).toHaveBeenCalledWith({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      banner: event.banner,
      hostId: "host-1",
      status: "draft",
    });
  });

  it("returns paginated, public, upcoming events and escapes search input", async () => {
    const events = [createEvent({ status: "published" })];
    const query = makeQuery(events);
    EventsModel.countDocuments.mockResolvedValue(1);
    EventsModel.find.mockReturnValue(query);

    const result = await EventsService.getEvents({
      page: 2,
      limit: 5,
      q: "React.*",
      from: "2030-01-01T00:00:00.000Z",
    });

    const filter = EventsModel.find.mock.calls[0][0];
    expect(filter.$and[0].$or).toEqual([
      { status: "published" },
      { status: { $exists: false } },
    ]);
    expect(filter.$and[1].date.$gte).toEqual(
      new Date("2030-01-01T00:00:00.000Z"),
    );
    expect(filter.$and[2].$or[0].title).toEqual(/React\.\*/i);
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      items: events,
      meta: { page: 2, limit: 5, total: 1, pages: 1 },
    });
  });

  it("does not expose draft or cancelled events publicly", async () => {
    EventsModel.findById
      .mockReturnValueOnce(makeQuery(createEvent({ status: "draft" })))
      .mockReturnValueOnce(makeQuery(createEvent({ status: "cancelled" })));

    await expect(EventsService.getEvent("event-1")).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(EventsModel.findById.mock.results[0].value.select).toHaveBeenCalledWith(
      "title description date location banner status createdAt updatedAt",
    );
    await expect(EventsService.getEvent("event-1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("allows the host to update and publish a draft", async () => {
    const event = createEvent();
    EventsModel.findById.mockResolvedValue(event);

    await EventsService.updateEvent(
      "event-1",
      { title: "Updated event", status: "published" },
      "host-1",
      "user",
    );

    expect(event.title).toBe("Updated event");
    expect(event.status).toBe("published");
    expect(event.save).toHaveBeenCalledTimes(1);
  });

  it("allows admins to manage events and rejects other users", async () => {
    const event = createEvent();
    EventsModel.findById.mockResolvedValue(event);

    await expect(
      EventsService.updateEvent(
        "event-1",
        { title: "Unauthorized edit" },
        "user-2",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(event.save).not.toHaveBeenCalled();

    await EventsService.updateEvent(
      "event-1",
      { title: "Admin edit" },
      "admin-1",
      "admin",
    );
    expect(event.title).toBe("Admin edit");
    expect(event.save).toHaveBeenCalledTimes(1);
  });

  it("returns not found for missing events", async () => {
    EventsModel.findById.mockResolvedValue(null);

    await expect(
      EventsService.updateEvent(
        "missing",
        { title: "Updated" },
        "host-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("cancels events idempotently and prevents edits after cancellation", async () => {
    const event = createEvent({ status: "published" });
    EventsModel.findById
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(event);

    await EventsService.cancelEvent("event-1", "host-1", "user");
    expect(event.status).toBe("cancelled");
    expect(event.save).toHaveBeenCalledTimes(1);

    await EventsService.cancelEvent("event-1", "host-1", "user");
    expect(event.save).toHaveBeenCalledTimes(1);
    await expect(
      EventsService.updateEvent(
        "event-1",
        { title: "Too late" },
        "host-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
