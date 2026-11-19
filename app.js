require("dotenv").config();
require("./events/listners");

const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser")
const userRoutes = require("./routes/UserRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const courseSectionRoutes = require("./routes/courseSectionRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const achievementRoutes = require("./routes/AchievementRoutes");
const analyticsRoutes = require("./routes/AnalyticsRoutes");
const adminlogRoutes = require("./routes/AdminLogRoutes");
const blogsRoutes = require("./routes/BlogsRoutes");
const categoryRoutes = require("./routes/CategoriesRoutes");
const certificatesRoutes = require("./routes/CertificateRoutes");
const enrollmentRoutes = require("./routes/EnrollmentRoutes");
const eventRoutes = require("./routes/EventsRoutes");
const feedbackRoutes = require("./routes/FeedbackRoutes");
const messagesRoutes = require("./routes/MessagesRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const reportRoutes = require("./routes/ReportRoutes");
const resourceRoutes = require("./routes/ResourceRoutes");
const overviewRoutes = require("./routes/OverviewRoutes");
const quizRoutes = require("./routes/QuizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const progressRoutes = require("./routes/ProgressRoutes");
const postRoutes = require("./routes/PostRoutes");
const communityRoutes = require("./routes/CommunityRoutes");
const activityRoutes = require("./routes/ActivityRoutes");
const adminOverviewRoutes = require("./routes/AdminDashboardOverviewRoutes");
const userSettingsRoutes = require("./routes/UserSettingsRoutes")
const {globalLimiter} = require("./middleware/rateLimiter");


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// Routes
app.use(userRoutes);
app.use(courseRoutes);
app.use(courseSectionRoutes);
app.use(lessonRoutes);
app.use(certificatesRoutes);
app.use(achievementRoutes);
app.use(analyticsRoutes);
app.use(adminlogRoutes);
app.use(blogsRoutes);
app.use(categoryRoutes);
app.use(enrollmentRoutes);
app.use(eventRoutes);
app.use(feedbackRoutes);
app.use(messagesRoutes);
app.use("/notifications", notificationRoutes);
app.use(reportRoutes);
app.use(resourceRoutes);
app.use(overviewRoutes);
app.use("/posts", postRoutes);
app.use("/progress", progressRoutes);
app.use(quizRoutes);
app.use(questionRoutes);
app.use(quizAttemptRoutes);
app.use("/communities", communityRoutes);
app.use("/activities", activityRoutes);
app.use(adminOverviewRoutes);
app.use(userSettingsRoutes)

const AppError = require("./utils/AppError");

app.get("/test-error", (req, res, next) => {
    next(new AppError("This is a test error", 400));
});

app.use(errorHandler);
module.exports = app;
