const UserModel = require("../models/UserModel");
const UserSettingsModel = require("../models/UserSettingsModel");
const s3 = require("../config/s3");
const UserService = require("../services/UserService");

jest.mock("../models/UserModel", () => ({
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
}));
jest.mock("../models/UserSettingsModel", () => ({
  findOne: jest.fn(),
}));
jest.mock("../config/s3", () => ({
  send: jest.fn(),
}));

describe("UserService profile operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("only updates whitelisted fields on the authenticated user's profile", async () => {
    const updatedUser = { _id: "user-1", fullname: "Updated" };
    UserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

    await expect(
      UserService.updateUser(
        "user-1",
        {
          fullname: "Updated",
          role: "admin",
          email: "attacker@example.com",
          points: 999999,
        },
        "user-1",
      ),
    ).resolves.toBe(updatedUser);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "user-1",
      { $set: { fullname: "Updated" } },
      { new: true, runValidators: true },
    );
  });

  it("rejects updates to another user's profile", async () => {
    await expect(
      UserService.updateUser("user-2", { fullname: "Changed" }, "user-1"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(UserModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("reports a missing profile after a valid owner update", async () => {
    UserModel.findByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateUser("user-1", { bio: "About me" }, "user-1"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("keeps other users' profiles private unless they opt in", async () => {
    const userQuery = Promise.resolve({ _id: "user-2", email: "private@example.com" });
    userQuery.select = jest.fn(() => userQuery);
    userQuery.populate = jest.fn(() => userQuery);
    UserModel.findById.mockReturnValue(userQuery);
    const settingsQuery = Promise.resolve({ profilePublic: false });
    settingsQuery.select = jest.fn(() => settingsQuery);
    UserSettingsModel.findOne.mockReturnValue(settingsQuery);

    await expect(
      UserService.getPublicProfile("user-2", "user-1", "user"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(userQuery.select).toHaveBeenCalledWith(
      "_id fullname avatar bio github linkedin twitter achievements createdAt",
    );
  });

  it("rejects unsupported avatar types without contacting storage", async () => {
    await expect(
      UserService.uploadAvatar("user-1", {
        buffer: Buffer.from("data"),
        mimetype: "image/svg+xml",
        size: 4,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(s3.send).not.toHaveBeenCalled();
  });

  it("stores an avatar and updates the authenticated user's profile", async () => {
    const oldBucket = process.env.AWS_BUCKET_NAME;
    const oldRegion = process.env.AWS_REGION;
    const oldAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const oldSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    process.env.AWS_BUCKET_NAME = "skillhub-test";
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "test-access-key";
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";
    UserModel.findByIdAndUpdate.mockResolvedValue({
      _id: "user-1",
      avatar: "new-avatar",
    });

    try {
      await UserService.uploadAvatar("user-1", {
        buffer: Buffer.from("image-data"),
        mimetype: "image/png",
        size: 10,
      });

      expect(s3.send).toHaveBeenCalledTimes(1);
      expect(s3.send.mock.calls[0][0].input).toMatchObject({
        Bucket: "skillhub-test",
        ContentType: "image/png",
        Body: expect.any(Buffer),
      });
      expect(s3.send.mock.calls[0][0].input.Key).toMatch(
        /^profile-avatars\/user-1\/[0-9a-f-]+\.png$/,
      );
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "user-1",
        { $set: { avatar: expect.stringMatching(/^https:/) } },
        { new: true, runValidators: true },
      );
    } finally {
      if (oldBucket === undefined) delete process.env.AWS_BUCKET_NAME;
      else process.env.AWS_BUCKET_NAME = oldBucket;
      if (oldRegion === undefined) delete process.env.AWS_REGION;
      else process.env.AWS_REGION = oldRegion;
      if (oldAccessKey === undefined) delete process.env.AWS_ACCESS_KEY_ID;
      else process.env.AWS_ACCESS_KEY_ID = oldAccessKey;
      if (oldSecretKey === undefined) delete process.env.AWS_SECRET_ACCESS_KEY;
      else process.env.AWS_SECRET_ACCESS_KEY = oldSecretKey;
    }
  });

  it("returns an empty search result when no query is supplied", async () => {
    await expect(UserService.searchUsers("")).resolves.toEqual([]);
    expect(UserModel.find).not.toHaveBeenCalled();
  });
});
