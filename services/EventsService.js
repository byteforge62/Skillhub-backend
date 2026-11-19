const EventsModel = require("../models/EventsModel");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");

const publicEventFields =
  "title description date location banner status createdAt updatedAt";

const getEventOrThrow = async (eventId) => {
  const event = await EventsModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  return event;
};

const ensureCanManageEvent = (event, userId, role) => {
  if (
    role !== "admin" &&
    (!event.hostId || event.hostId.toString() !== userId.toString())
  ) {
    throw new AppError("You are not authorized to manage this event", 403);
  }
};

const createEvent = async (eventData, userId) => {
  const { title, description, date, location, banner } = eventData;

  return EventsModel.create({
    title,
    description,
    date: new Date(date),
    location,
    banner,
    hostId: userId,
    status: "draft",
  });
};

const getEvents = async ({ page, limit, q, from, to }) => {
  const dateFilter = {
    $gte: from ? new Date(from) : new Date(),
  };
  if (to) {
    dateFilter.$lte = new Date(to);
  }

  const filter = {
    $and: [
      {
        $or: [
          { status: "published" },
          { status: { $exists: false } },
        ],
      },
      { date: dateFilter },
    ],
  };

  if (q) {
    const safeQuery = new RegExp(escapeRegex(q), "i");
    filter.$and.push({
      $or: [{ title: safeQuery }, { description: safeQuery }],
    });
  }

  const [total, items] = await Promise.all([
    EventsModel.countDocuments(filter),
    EventsModel.find(filter)
      .select(publicEventFields)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getMyEvents = async (userId) => {
  return EventsModel.find({ hostId: userId })
    .select(
      "title description date location banner status hostId createdAt updatedAt",
    )
    .sort({ date: 1 });
};

const getEvent = async (eventId) => {
  const event = await EventsModel.findById(eventId).select(publicEventFields);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  if (event.status === "cancelled" || event.status === "draft") {
    throw new AppError("Event not found", 404);
  }
  return event;
};

const updateEvent = async (eventId, updateData, userId, role) => {
  const event = await getEventOrThrow(eventId);
  ensureCanManageEvent(event, userId, role);

  if (event.status === "cancelled") {
    throw new AppError("Cancelled events cannot be updated", 400);
  }

  const { title, description, date, location, banner, status } = updateData;
  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (date !== undefined) event.date = new Date(date);
  if (location !== undefined) event.location = location;
  if (banner !== undefined) event.banner = banner;
  if (status === "published") event.status = "published";

  return event.save();
};

const cancelEvent = async (eventId, userId, role) => {
  const event = await getEventOrThrow(eventId);
  ensureCanManageEvent(event, userId, role);

  if (event.status !== "cancelled") {
    event.status = "cancelled";
    await event.save();
  }

  return event;
};

module.exports = {
  createEvent,
  getEvents,
  getMyEvents,
  getEvent,
  updateEvent,
  cancelEvent,
};
