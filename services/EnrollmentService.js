const EnrollmentModel = require("../models/EnrollmentModel");
const CourseModel = require("../models/CoursesModel");
const LessonModel = require("../models/LessonModel");
const CourseSectionModel = require("../models/CourseSectionModel");
const LessonNoteModel = require("../models/LessonNoteModel");
const AppError = require("../utils/AppError");

const verifyCourseForEnrollment = async (courseId) => {
  const course = await CourseModel.findById(courseId).select("_id title status");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== "published") {
    throw new AppError("You can only enroll in published courses",400);
  }
  return course;
};

const enrollInCourse = async (userId, courseId) => {
  await verifyCourseForEnrollment(courseId);

  const existingEnrollment = await EnrollmentModel.findOne({userId,courseId});
  if (existingEnrollment) {
    if (existingEnrollment.status === "active") {
      throw new AppError("You are already enrolled in this course",409);
    }

    if (existingEnrollment.status === "completed") {
      throw new AppError("You have already completed this course",409);
    }

    if (existingEnrollment.status === "dropped" || existingEnrollment.status === "cancelled") {
      existingEnrollment.status = "active";
      existingEnrollment.progress = 0;
      existingEnrollment.completedLessons = [];
      existingEnrollment.completedAt = null;
      existingEnrollment.lastAccessedLesson = null;
      existingEnrollment.lastAccessedAt = null;
      existingEnrollment.enrolledAt = new Date();

      return await existingEnrollment.save();
    }
  }

  return await EnrollmentModel.create({
    userId,
    courseId,
    status: "active",
    progress: 0,
    completedLessons: [],
  });
};

const asId = (value) => String(value?._id ?? value ?? "");

const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

/**
 * Adds the module context the workspace needs (next lesson, active section,
 * remaining time). Derived from sections/lessons so it also works for records
 * created before these fields existed.
 */
const decorateEnrollments = async (enrollments) => {
  const list = enrollments.map(toPlain).filter(Boolean);
  if (list.length === 0) return list;

  const courseIds = [
    ...new Set(
      list
        .map((item) => asId(item.courseId))
        .filter((id) => /^[0-9a-fA-F]{24}$/.test(id)),
    ),
  ];

  const sections = courseIds.length
    ? await CourseSectionModel.find({ course: { $in: courseIds } })
        .select("title order course")
        .sort({ order: 1 })
        .lean()
    : [];

  const sectionIds = sections.map((section) => section._id);

  const lessons = sectionIds.length
    ? await LessonModel.find({
        section: { $in: sectionIds },
        status: "published",
      })
        .select("title order duration section")
        .sort({ order: 1 })
        .lean()
    : [];

  const sectionById = new Map(
    sections.map((section) => [String(section._id), section]),
  );

  const lessonsByCourse = new Map();

  lessons.forEach((lesson) => {
    const section = sectionById.get(String(lesson.section));
    if (!section) return;

    const key = String(section.course);
    if (!lessonsByCourse.has(key)) lessonsByCourse.set(key, []);

    lessonsByCourse.get(key).push({
      _id: lesson._id,
      title: lesson.title,
      order: lesson.order,
      duration: lesson.duration ?? 0,
      sectionTitle: section.title,
      sectionOrder: section.order,
    });
  });

  lessonsByCourse.forEach((courseLessons) =>
    courseLessons.sort(
      (left, right) =>
        left.sectionOrder - right.sectionOrder || left.order - right.order,
    ),
  );

  const sectionCountByCourse = new Map();
  sections.forEach((section) => {
    const key = String(section.course);
    sectionCountByCourse.set(key, (sectionCountByCourse.get(key) || 0) + 1);
  });

  return list.map((enrollment) => {
    const course = toPlain(enrollment.courseId);
    const courseKey = course && course._id ? String(course._id) : null;
    const courseLessons = courseKey ? lessonsByCourse.get(courseKey) || [] : [];

    const shapedLessons = courseLessons.map((lesson, index) => ({
      _id: lesson._id,
      title: lesson.title,
      order: lesson.order,
      duration: lesson.duration ?? 0,
      sectionTitle: lesson.sectionTitle,
      sectionOrder: lesson.sectionOrder,
      index: index + 1,
    }));

    const completedIds = new Set(
      (enrollment.completedLessons || []).map((lesson) => asId(lesson)),
    );

    const completedLessonsCount = shapedLessons.filter((lesson) =>
      completedIds.has(String(lesson._id)),
    ).length;

    const nextLesson =
      shapedLessons.find((lesson) => !completedIds.has(String(lesson._id))) ||
      shapedLessons[shapedLessons.length - 1] ||
      null;

    const lastAccessedId = enrollment.lastAccessedLesson
      ? asId(enrollment.lastAccessedLesson)
      : null;

    const lastAccessedLesson =
      (lastAccessedId &&
        shapedLessons.find((lesson) => String(lesson._id) === lastAccessedId)) ||
      nextLesson;

    const minutesRemaining = shapedLessons
      .filter((lesson) => !completedIds.has(String(lesson._id)))
      .reduce((total, lesson) => total + (lesson.duration || 0), 0);

    return {
      ...enrollment,
      totalLessons: shapedLessons.length,
      completedLessonsCount,
      remainingLessons: Math.max(shapedLessons.length - completedLessonsCount, 0),
      minutesRemaining,
      currentLesson: nextLesson,
      nextLesson,
      lastAccessedLesson,
      courseId:
        course && course._id
          ? {
              ...course,
              lessonCount: shapedLessons.length,
              sectionCount: sectionCountByCourse.get(courseKey) || 0,
            }
          : enrollment.courseId,
    };
  });
};

const coursePopulation = {
  path: "courseId",
  select:
    "title description imageUrl price duration level language category createdBy cohortLabel tags",
  populate: [
    {
      path: "category",
      select: "name",
    },
    {
      path: "createdBy",
      select: "fullname avatar",
    },
  ],
};

const getMyEnrollments = async (userId) => {
  const enrollments = await EnrollmentModel.find({ userId })
    .populate(coursePopulation)
    .sort({ updatedAt: -1 });

  return decorateEnrollments(enrollments);
};

const getMyEnrollmentById = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  }).populate(coursePopulation);

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  const [decorated] = await decorateEnrollments([enrollment]);
  return decorated;
};

const completeLesson = async (enrollmentId,lessonId,userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  });
  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  const lesson = await LessonModel.findById(lessonId).select("_id section status");
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const courseSections = await CourseSectionModel.find({
    course: enrollment.courseId,
  }).select("_id");
  const sectionIds = courseSections.map((section) => section._id.toString());

  if (!sectionIds.includes(lesson.section.toString())) {
    throw new AppError("Lesson not found in this course", 404);
  }

  if (enrollment.status !== "active") {
    if (
      enrollment.status === "completed" &&
      enrollment.completedLessons.some(
        (completedLessonId) =>
          completedLessonId.toString() === lessonId.toString(),
      )
    ) {
      return enrollment;
    }

    throw new AppError("This enrollment is no longer active", 400);
  }

  if (lesson.status !== "published") {
    throw new AppError("You cannot complete an unpublished lesson",400);
  }

  const alreadyCompleted = enrollment.completedLessons.some(
    (completedLessonId) =>
      completedLessonId.toString() === lessonId.toString(),
  );
  if (!alreadyCompleted) {
    if (typeof enrollment.completedLessons.addToSet === "function") {
      enrollment.completedLessons.addToSet(lessonId);
    } else {
      enrollment.completedLessons.push(lessonId);
    }
  }

  // Keep the resume pointer honest: the last lesson touched is the one to open.
  enrollment.lastAccessedLesson = lessonId;
  enrollment.lastAccessedAt = new Date();

  const publishedLessons = await LessonModel.find({
    section: { $in: sectionIds },
    status: "published",
  }).select("_id");
  const publishedLessonIds = new Set(
    publishedLessons.map((publishedLesson) =>
      publishedLesson._id.toString(),
    ),
  );
  const completedLessonIds = new Set(
    enrollment.completedLessons
      .map((completedLessonId) => completedLessonId.toString())
      .filter((completedLessonId) => publishedLessonIds.has(completedLessonId)),
  );
  const totalLessons = publishedLessonIds.size;

  if (totalLessons === 0) {
    enrollment.progress = 0;
  } else {
    enrollment.progress = Math.round(
      (completedLessonIds.size / totalLessons) * 100,
    );
  }

  if (totalLessons > 0 && completedLessonIds.size === totalLessons) {
    enrollment.progress = 100;
    enrollment.status = "completed";
    enrollment.completedAt ||= new Date();
  }

  await enrollment.save();
  const [decorated] = await decorateEnrollments([enrollment]);
  return decorated;
};

const dropCourse = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  });
  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  if (enrollment.status !== "active") {
    throw new AppError("Only active enrollments can be dropped",400);
  }

  enrollment.status = "dropped";
  await enrollment.save();
  return enrollment;
};

const loadDecoratedEnrollment = async (enrollmentId) => {
  const enrollment = await EnrollmentModel.findById(enrollmentId).populate(
    coursePopulation,
  );
  const [decorated] = await decorateEnrollments([enrollment]);
  return decorated;
};

/**
 * Bookmarks the track without touching progress, so the workspace
 * "Saved" toggle is a single boolean flip on the enrollment.
 */
const toggleSavedEnrollment = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  });

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  enrollment.saved = !enrollment.saved;
  await enrollment.save();

  return loadDecoratedEnrollment(enrollment._id);
};

const findOwnedEnrollment = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  }).select("_id courseId");

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  return enrollment;
};

const getLessonNote = async (enrollmentId, lessonId, userId) => {
  await findOwnedEnrollment(enrollmentId, userId);

  const note = await LessonNoteModel.findOne({ enrollmentId, lessonId });

  return {
    lessonId,
    content: note?.content ?? "",
    updatedAt: note?.updatedAt ?? null,
  };
};

const saveLessonNote = async (enrollmentId, lessonId, userId, content) => {
  await findOwnedEnrollment(enrollmentId, userId);

  const note = await LessonNoteModel.findOneAndUpdate(
    { enrollmentId, lessonId },
    { $set: { content: content ?? "", userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return {
    lessonId,
    content: note.content,
    updatedAt: note.updatedAt,
  };
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getMyEnrollmentById,
  completeLesson,
  dropCourse,
  toggleSavedEnrollment,
  getLessonNote,
  saveLessonNote,
};
