const NotificationModel = require("../models/NotificationModel");
const NotificationService = require("../services/NotificationService");

jest.mock("../models/NotificationModel", () => ({
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
}));

describe("notification service ownership", () => {
  it("scopes read updates to the owning user", async () => {
    NotificationModel.findOneAndUpdate.mockResolvedValue({
      _id: "notification-1",
      userId: "owner-1",
      read: true,
    });

    await NotificationService.markAsRead("notification-1", "owner-1");

    expect(NotificationModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "notification-1", userId: "owner-1" },
      { read: true },
      { new: true },
    );
  });
});
