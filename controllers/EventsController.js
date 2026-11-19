const EventsService = require("../services/EventsService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddEvent = catchAsync(async (req, res) => {
  const event = await EventsService.createEvent(
    req.validated.body,
    req.user.id,
  );

  return res.status(200).json({
    message: "Event Added Successfully",
    data: event,
  });
});

const GetEvents = catchAsync(async (req, res) => {
  const events = await EventsService.getEvents(req.validated.query);
  return ResponseHandler.success(
    res,
    "Events fetched successfully",
    events.items,
    200,
    events.meta,
  );
});

const GetMyEvents = catchAsync(async (req, res) => {
  const events = await EventsService.getMyEvents(req.user.id);
  return ResponseHandler.success(res, "Your events fetched successfully", events);
});

const GetEvent = catchAsync(async (req, res) => {
  const event = await EventsService.getEvent(req.validated.params.eventId);
  return ResponseHandler.success(res, "Event fetched successfully", event);
});

const UpdateEvent = catchAsync(async (req, res) => {
  const event = await EventsService.updateEvent(
    req.validated.params.eventId,
    req.validated.body,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(res, "Event updated successfully", event);
});

const CancelEvent = catchAsync(async (req, res) => {
  const event = await EventsService.cancelEvent(
    req.validated.params.eventId,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(res, "Event cancelled successfully", event);
});

module.exports = {
  AddEvent,
  GetEvents,
  GetMyEvents,
  GetEvent,
  UpdateEvent,
  CancelEvent,
};
