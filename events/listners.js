const eventEmitter = require("./EventEmitter")
const ActivityLog = require("../models/ActivityLogModel")
const Notification = require("../models/NotificationModel")
const Course = require("../models/CoursesModel")
 eventEmitter.on("ENROLLMENT_CREATED",async(payload)=>{
    const {userId,courseId} = payload
     try{
      const course = await Course.findById(courseId).select("title")
      if (!course) {
       throw new Error(`Course ${courseId} not found for enrollment notification`)
      }
      const courseTitle = course.title
      await ActivityLog.create({
        userId,
        action:"ENROLLED",
        targetType:"Course",
        targetId:courseId,
        message:`You enrolled in course ${courseTitle}`
      })
      await Notification.create({
        userId,
        type:"COURSE_ENROLLMENT",
        message:`You have successfully enrolled in course ${courseTitle}`,
        read:false
      })
     }catch(err){
     console.error("Enrollment notification error:", err.message);
     }
 })
 eventEmitter.on("post-created",async(payload)=>{
  const {userId,postId} = payload
  try{
    await ActivityLog.create({
      userId,
      action:"POST_CREATED",
      targetType:"Post",
      targetId:postId,
      message:`User created a new post with id ${postId}`
    })
    await Notification.create({
      userId,
      type:"POST_CREATED",
      message:`Your post has been created successfully`,
      read:false
    })
  }catch(err){
   console.error("Post notification error (created):", err.message);
  }
 })
 eventEmitter.on("post-Liked", async ({ post, likedBy }) => {
  try {
    if (post.userId.toString() !== likedBy.toString()) {
      await Notification.create({
        userId: post.userId,
        type: "like",
        message: "❤️ Someone liked your post",
        data: { postId: post._id },
      });
    }
  } catch (err) {
    console.error("Notification Error (postLiked):", err.message);
  }
})
eventEmitter.on("post-Commented", async ({ post, comment, commentedBy }) => {
  try {
    if (post.userId.toString() !== commentedBy.toString()) {
      await Notification.create({
        userId: post.userId,
        type: "comment",
        message: "💬 Someone commented on your post",
        data: { postId: post._id, comment },
      });
    }
  } catch (err) {
    console.error("Notification Error (postCommented):", err.message);
  }
});