const UserSettingsModel = require("../models/UserSettingsModel");
const UserSettingsService = require("../services/UserSettingsService");

jest.mock("../models/UserSettingsModel", () => ({
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe("UserSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("only updates supported settings", async () => {
    const settings = { theme: "light" };
    UserSettingsModel.findOneAndUpdate.mockResolvedValue(settings);

    await expect(
      UserSettingsService.updateUserSettings("user-1", {
        theme: "light",
        role: "admin",
        userId: "other-user",
      }),
    ).resolves.toBe(settings);

    expect(UserSettingsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user-1" },
      { $set: { theme: "light" } },
      { new: true, upsert: true, runValidators: true },
    );
  });
});
