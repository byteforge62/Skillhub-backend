require("dotenv").config();
require("./events/listners");

const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/UserRoutes");
const courseRoutes = require("./routes/CourseRoutes");
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
const searchlogsRoutes = require("./routes/SearchLogsRoutes");
const skillsRoutes = require("./routes/SkillsRoutes");
const reportRoutes = require("./routes/ReportRoutes");
const resourceRoutes = require("./routes/ResourceRoutes");
const overviewRoutes = require("./routes/OverviewRoutes");
const quizRoutes = require("./routes/QuizRoutes");
const progressRoutes = require("./routes/ProgressRoutes");
const postRoutes = require("./routes/PostRoutes");
const communityRoutes = require("./routes/CommunityRoutes");
const activityRoutes = require("./routes/ActivityRoutes");
const friendsRoutes = require("./routes/FriendsRoutes");
const adminOverviewRoutes = require("./routes/AdminDashboardOverviewRoutes");
const userSettingsRoutes = require("./routes/UserSettingsRoutes")
const app = express();

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:3000"
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use(userRoutes);
app.use(courseRoutes);
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
app.use(searchlogsRoutes);
app.use(skillsRoutes);
app.use(reportRoutes);
app.use(resourceRoutes);
app.use(overviewRoutes);
app.use("/posts", postRoutes);
app.use("/progress", progressRoutes);
app.use(quizRoutes);
app.use("/communities", communityRoutes);
app.use("/activities", activityRoutes);
app.use("/friends", friendsRoutes);
app.use(adminOverviewRoutes);
app.use(userSettingsRoutes)
module.exports = app;
