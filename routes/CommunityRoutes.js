const router = require("express").Router();
const communityController = require("../controllers/CommunityController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  communityIdParamsSchema,
  createCommunitySchema,
  updateCommunitySchema,
  targetMemberSchema,
  communityPostActionSchema,
  communityPostsQuerySchema,
} = require("../validations/community.validation");

router.post(
  "/",
  authMiddleware.verifyToken,
  validate(createCommunitySchema),
  communityController.createCommunity,
);
router.get("/", communityController.getCommunities);
router.get(
  "/:id",
  validate(communityIdParamsSchema),
  communityController.getCommunity,
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  validate(updateCommunitySchema),
  communityController.updateCommunity,
);
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  validate(communityIdParamsSchema),
  communityController.deleteCommunity,
);

router.patch(
  "/:id/join",
  authMiddleware.verifyToken,
  validate(communityIdParamsSchema),
  communityController.joinCommunity,
);
router.patch(
  "/:id/leave",
  authMiddleware.verifyToken,
  validate(communityIdParamsSchema),
  communityController.leaveCommunity,
);
router.patch(
  "/:id/promote",
  authMiddleware.verifyToken,
  validate(targetMemberSchema),
  communityController.promoteToAdmin,
);
router.patch(
  "/:id/pin",
  authMiddleware.verifyToken,
  validate(communityPostActionSchema),
  communityController.pinPost,
);
router.patch(
  "/:id/unpin",
  authMiddleware.verifyToken,
  validate(communityPostActionSchema),
  communityController.unpinPost,
);
router.get(
  "/:id/posts",
  authMiddleware.verifyToken,
  validate(communityPostsQuerySchema),
  communityController.getCommunityPosts,
);

module.exports = router;
