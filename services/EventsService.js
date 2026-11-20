const EventsModel = require("../models/EventsModel");
const UserModel = require("../models/UserModel");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");

const publicEventFields =
  "title description date duration capacity location banner status hostId registeredUsers createdAt updatedAt";

const asId = (value) => String(value?._id ?? value ?? "");

const loadHosts = async (events) => {
  const ids = [
    ...new Set(events.map((event) => event.hostId).filter(Boolean).map(String)),
  ];

  if (ids.length === 0) return new Map();

  const users = await UserModel.find({ _id: { $in: ids } })
    .select("fullname avatar role")
    .lean();

  return new Map(users.map((user) => [String(user._id), user]));
};

const shapeEvent = (event, hostById, userId) => {
  const plain = event?.toObject ? event.toObject() : event;
  if (!plain) return plain;

  const registered = plain.registeredUsers || [];
  const host = plain.hostId ? hostById.get(String(plain.hostId)) : null;
  const capacity = plain.capacity ?? null;

  return {
    ...plain,
    duration: plain.duration ?? 60,
    // Backwards-compatible aliases for views that read start/end dates.
    startDate: plain.date,
    endDate: plain.date,
    attendeeCount: registered.length,
    seatsLeft:
      capacity !== null ? Math.max(capacity - registered.length, 0) : null,
    isRegistered: userId
      ? registered.some((attendee) => asId(attendee) === String(userId))
      : false,
    attendees: registered.slice(0, 5).map((attendee) =>
      attendee && typeof attendee === "object"
        ? {
            _id: attendee._id,
            fullname: attendee.fullname,
            avatar: attendee.avatar,
          }
        : { _id: attendee },
    ),
    host: host
      ? {
          _id: host._id,
          fullname: host.fullname,
          avatar: host.avatar,
          role: host.role,
        }
      : null,
  };
};

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
  const { title, description, date, location, banner, duration, capacity } =
    eventData;

  return EventsModel.create({
    title,
    description,
    date: new Date(date),
    location,
    banner,
    duration: duration ?? 60,
    capacity: capacity ?? null,
    hostId: userId,
    status: "draft",
  });
};

const getEvents = async ({ page, limit, q, from, to }, userId = null) => {
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

  const hostById = await loadHosts(items);

  return {
    items: items.map((event) => shapeEvent(event, hostById, userId)),
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
      "title description date duration capacity location banner status hostId registeredUsers createdAt updatedAt",
    )
    .sort({ date: 1 });
};

const getEvent = async (eventId, userId = null) => {
  const event = await EventsModel.findById(eventId).select(publicEventFields);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  if (event.status === "cancelled" || event.status === "draft") {
    throw new AppError("Event not found", 404);
  }

  const hostById = await loadHosts([event]);
  return shapeEvent(event, hostById, userId);
};

const toggleRsvp = async (eventId, userId) => {
  const event = await getEventOrThrow(eventId);

  if (event.status === "cancelled" || event.status === "draft") {
    throw new AppError("This event is not open for registration", 400);
  }

  const existingIndex = (event.registeredUsers || []).findIndex(
    (attendee) => String(attendee) === String(userId),
  );

  if (existingIndex >= 0) {
    event.registeredUsers.splice(existingIndex, 1);
  } else {
    if (event.capacity && event.registeredUsers.length >= event.capacity) {
      throw new AppError("This event is full", 409);
    }
    event.registeredUsers.push(userId);
  }

  await event.save();

  const hostById = await loadHosts([event]);

  return {
    ...shapeEvent(event, hostById, userId),
    isRegistered: existingIndex < 0,
  };
};

const updateEvent = async (eventId, updateData, userId, role) => {
  const event = await getEventOrThrow(eventId);
  ensureCanManageEvent(event, userId, role);

  if (event.status === "cancelled") {
    throw new AppError("Cancelled events cannot be updated", 400);
  }

  const { title, description, date, location, banner, status, duration, capacity } =
    updateData;
  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (date !== undefined) event.date = new Date(date);
  if (location !== undefined) event.location = location;
  if (banner !== undefined) event.banner = banner;
  if (duration !== undefined) event.duration = duration;
  if (capacity !== undefined) event.capacity = capacity;
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
  toggleRsvp,
  updateEvent,
  cancelEvent,
};
