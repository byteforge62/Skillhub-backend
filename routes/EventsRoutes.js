const route = require("express").Router();
const EventsController = require("../controllers/EventsController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createEventSchema,
  eventIdParamsSchema,
  eventQuerySchema,
  updateEventSchema,
} = require("../validations/event.validation");

route.post(
  "/event",
  authMiddleware.verifyToken,
  validate(createEventSchema),
  EventsController.AddEvent,
);
route.get("/events", validate(eventQuerySchema), EventsController.GetEvents);
route.get(
  "/events/mine",
  authMiddleware.verifyToken,
  EventsController.GetMyEvents,
);
route.get(
  "/events/:eventId",
  validate(eventIdParamsSchema),
  EventsController.GetEvent,
);
route.patch(
  "/events/:eventId",
  authMiddleware.verifyToken,
  validate(updateEventSchema),
  EventsController.UpdateEvent,
);
route.patch(
  "/events/:eventId/cancel",
  authMiddleware.verifyToken,
  validate(eventIdParamsSchema),
  EventsController.CancelEvent,
);

module.exports = route;
