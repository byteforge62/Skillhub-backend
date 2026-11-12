const ProgressModel = require("../models/ProgressModel");
const UserModel = require("../models/UserModel");
const ProgressService = require("../services/ProgressService");

jest.mock("../models/ProgressModel", () => ({
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../models/UserModel", () => ({
  findByIdAndUpdate: jest.fn(),
}));

describe("ProgressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses the authenticated user ID and never accepts client-supplied points", async () => {
    const userId = "507f1f77bcf86cd799439011";
    const courseId = "507f1f77bcf86cd799439012";
    const savedProgress = { points: 15 };
    ProgressModel.findOneAndUpdate.mockResolvedValue(savedProgress);
    ProgressModel.find.mockResolvedValue([{ points: 15 }, { points: 5 }]);

    await ProgressService.saveProgress(userId, {
      courseId,
      currentQuestionIdx: 3,
      quizAnswers: { question1: "option1" },
      userId: "507f1f77bcf86cd799439099",
      points: 999999,
    });

    expect(ProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        userId: expect.anything(),
        courseId: expect.anything(),
      },
      {
        $set: {
          currentQuestionIdx: 3,
          quizAnswers: { question1: "option1" },
        },
        $setOnInsert: { points: 0 },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    expect(ProgressModel.find.mock.calls[0][0].userId.toString()).toBe(userId);
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(UserModel.findByIdAndUpdate.mock.calls[0][0].toString()).toBe(
      userId,
    );
    expect(UserModel.findByIdAndUpdate.mock.calls[0][1]).toEqual({
      points: 20,
    });
  });

  it("rejects malformed IDs before database access", async () => {
    await expect(
      ProgressService.saveProgress("not-an-id", {
        courseId: "507f1f77bcf86cd799439012",
        currentQuestionIdx: 0,
        quizAnswers: {},
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(ProgressModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
