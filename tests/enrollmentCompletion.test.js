const EnrollmentModel = require("../models/EnrollmentModel");
const CourseSectionModel = require("../models/CourseSectionModel");
const LessonModel = require("../models/LessonModel");
const EnrollmentService = require("../services/EnrollmentService");

jest.mock("../models/EnrollmentModel", () => ({
  findOne: jest.fn(),
}));
jest.mock("../models/CourseSectionModel", () => ({
  find: jest.fn(),
}));
jest.mock("../models/LessonModel", () => ({
  findById: jest.fn(),
  find: jest.fn(),
}));

const createEnrollment = (overrides = {}) => ({
  _id: "enrollment-1",
  userId: "user-1",
  courseId: "course-1",
  status: "active",
  completedLessons: [],
  progress: 0,
  save: jest.fn(async function save() {
    return this;
  }),
  ...overrides,
});

const mockLesson = (lesson) => {
  LessonModel.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(lesson),
  });
};

const mockCourseSections = (sections = ["section-1"]) => {
  CourseSectionModel.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(
      sections.map((_id) => ({ _id })),
    ),
  });
};

const mockPublishedLessons = (lessonIds = ["lesson-1", "lesson-2"]) => {
  LessonModel.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(
      lessonIds.map((_id) => ({ _id })),
    ),
  });
};

describe("EnrollmentService.completeLesson", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates progress from published lessons in the enrolled course only", async () => {
    const enrollment = createEnrollment({
      completedLessons: ["deleted-lesson"],
    });
    EnrollmentModel.findOne.mockResolvedValue(enrollment);
    mockLesson({
      _id: "lesson-1",
      section: "section-1",
      status: "published",
    });
    mockCourseSections();
    mockPublishedLessons();

    await EnrollmentService.completeLesson(
      "enrollment-1",
      "lesson-1",
      "user-1",
    );

    expect(enrollment.completedLessons).toEqual([
      "deleted-lesson",
      "lesson-1",
    ]);
    expect(enrollment.progress).toBe(50);
    expect(enrollment.status).toBe("active");
    expect(enrollment.save).toHaveBeenCalledTimes(1);
  });

  it("does not add duplicate lesson references on repeat completion", async () => {
    const enrollment = createEnrollment({
      completedLessons: ["lesson-1"],
    });
    EnrollmentModel.findOne.mockResolvedValue(enrollment);
    mockLesson({
      _id: "lesson-1",
      section: "section-1",
      status: "published",
    });
    mockCourseSections();
    mockPublishedLessons();

    await EnrollmentService.completeLesson(
      "enrollment-1",
      "lesson-1",
      "user-1",
    );

    expect(enrollment.completedLessons).toEqual(["lesson-1"]);
    expect(enrollment.progress).toBe(50);
    expect(enrollment.save).toHaveBeenCalledTimes(1);
  });

  it("treats a repeated completion for a completed enrollment as idempotent", async () => {
    const enrollment = createEnrollment({
      status: "completed",
      completedLessons: ["lesson-1"],
      progress: 100,
    });
    EnrollmentModel.findOne.mockResolvedValue(enrollment);
    mockLesson({
      _id: "lesson-1",
      section: "section-1",
      status: "published",
    });
    mockCourseSections();

    await expect(
      EnrollmentService.completeLesson(
        "enrollment-1",
        "lesson-1",
        "user-1",
      ),
    ).resolves.toBe(enrollment);
    expect(LessonModel.findById).toHaveBeenCalledWith("lesson-1");
    expect(enrollment.save).not.toHaveBeenCalled();
  });

  it("rejects lessons that belong to a different course", async () => {
    const enrollment = createEnrollment();
    EnrollmentModel.findOne.mockResolvedValue(enrollment);
    mockLesson({
      _id: "lesson-1",
      section: "another-section",
      status: "published",
    });
    mockCourseSections();

    await expect(
      EnrollmentService.completeLesson(
        "enrollment-1",
        "lesson-1",
        "user-1",
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(enrollment.save).not.toHaveBeenCalled();
  });

  it("rejects missing enrollments and unpublished lessons", async () => {
    EnrollmentModel.findOne.mockResolvedValueOnce(null);
    await expect(
      EnrollmentService.completeLesson(
        "enrollment-1",
        "lesson-1",
        "user-1",
      ),
    ).rejects.toMatchObject({ statusCode: 404 });

    EnrollmentModel.findOne.mockResolvedValueOnce(createEnrollment());
    mockLesson({
      _id: "lesson-1",
      section: "section-1",
      status: "draft",
    });
    mockCourseSections();

    await expect(
      EnrollmentService.completeLesson(
        "enrollment-1",
        "lesson-1",
        "user-1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("scopes enrollment lookup to the authenticated user and rejects missing lessons", async () => {
      EnrollmentModel.findOne.mockResolvedValueOnce(null);
      await expect(
        EnrollmentService.completeLesson(
          "enrollment-1",
          "lesson-1",
          "another-user",
        ),
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(EnrollmentModel.findOne).toHaveBeenCalledWith({
        _id: "enrollment-1",
        userId: "another-user",
      });

      EnrollmentModel.findOne.mockResolvedValueOnce(createEnrollment());
      mockLesson(null);
      await expect(
        EnrollmentService.completeLesson(
          "enrollment-1",
          "lesson-1",
          "user-1",
        ),
      ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("marks the enrollment complete when all published course lessons are done", async () => {
      const enrollment = createEnrollment();
      EnrollmentModel.findOne.mockResolvedValue(enrollment);
      mockLesson({
        _id: "lesson-1",
        section: "section-1",
        status: "published",
      });
      mockCourseSections();
      mockPublishedLessons(["lesson-1"]);

      await EnrollmentService.completeLesson(
        "enrollment-1",
        "lesson-1",
        "user-1",
      );

      expect(enrollment.progress).toBe(100);
      expect(enrollment.status).toBe("completed");
      expect(enrollment.completedAt).toBeInstanceOf(Date);
  });

  it("does not bypass course ownership for completed enrollments", async () => {
      const enrollment = createEnrollment({
        status: "completed",
        completedLessons: ["lesson-1"],
      });
      EnrollmentModel.findOne.mockResolvedValue(enrollment);
      mockLesson({
        _id: "lesson-1",
        section: "another-section",
        status: "published",
      });
      mockCourseSections();

      await expect(
        EnrollmentService.completeLesson(
          "enrollment-1",
          "lesson-1",
          "user-1",
        ),
      ).rejects.toMatchObject({ statusCode: 404 });
  });
});
