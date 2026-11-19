const router = require("express").Router();
const postController = require("../controllers/PostController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  postIdParamsSchema,
  createPostSchema,
  updatePostSchema,
  postListQuerySchema,
  communityPostQuerySchema,
  userPostQuerySchema,
  commentSchema,
  deleteCommentSchema,
  commentReplySchema,
} = require("../validations/post.validation");

router.post(
  "/",
  authMiddleware.verifyToken,
  validate(createPostSchema),
  postController.createPost,
);
router.get(
  "/",
  authMiddleware.verifyToken,
  validate(postListQuerySchema),
  postController.getPosts,
);
router.get(
  "/:id",
  authMiddleware.verifyToken,
  validate(postIdParamsSchema),
  postController.getPost,
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  validate(updatePostSchema),
  postController.updatePost,
);
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  validate(postIdParamsSchema),
  postController.deletePost,
);
router.post(
  "/:id/like",
  authMiddleware.verifyToken,
  validate(postIdParamsSchema),
  postController.toggleLike,
);
router.post(
  "/:id/comment",
  authMiddleware.verifyToken,
  validate(commentSchema),
  postController.addComment,
);
router.delete(
  "/comment/:commentId",
  authMiddleware.verifyToken,
  validate(deleteCommentSchema),
  postController.deleteComment,
);
router.post(
  "/:postId/comment/:commentId/reply",
  authMiddleware.verifyToken,
  validate(commentReplySchema),
  postController.AddCommentReply,
);
router.get(
  "/community/:communityId",
  authMiddleware.verifyToken,
  validate(communityPostQuerySchema),
  postController.getCommunityPosts,
);
router.get(
  "/user/:userId",
  authMiddleware.verifyToken,
  validate(userPostQuerySchema),
  postController.getUserPosts,
);

module.exports = router;
