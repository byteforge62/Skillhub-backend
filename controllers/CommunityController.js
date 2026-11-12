const CommunityService = require("../services/CommunityService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const createCommunity = catchAsync(async (req, res) => {
  const community = await CommunityService.createCommunity(
    req.validated.body,
    req.user.id,
  );
  return ResponseHandler.success(
    res,
    "Community created successfully",
    community,
    201,
  );
});

const getCommunities = catchAsync(async (_req, res) => {
  const communities = await CommunityService.getCommunities();
  return ResponseHandler.success(
    res,
    "Communities fetched successfully",
    communities,
  );
});

const getCommunity = catchAsync(async (req, res) => {
  const community = await CommunityService.getCommunity(
    req.validated.params.id,
  );
  return ResponseHandler.success(
    res,
    "Community fetched successfully",
    community,
  );
});

const updateCommunity = catchAsync(async (req, res) => {
  const community = await CommunityService.updateCommunity(
    req.validated.params.id,
    req.validated.body,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(
    res,
    "Community updated successfully",
    community,
  );
});

const deleteCommunity = catchAsync(async (req, res) => {
  await CommunityService.deleteCommunity(
    req.validated.params.id,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(res, "Community deleted successfully");
});

const joinCommunity = catchAsync(async (req, res) => {
  const community = await CommunityService.joinCommunity(
    req.validated.params.id,
    req.user.id,
  );
  return ResponseHandler.success(
    res,
    "Joined community successfully",
    community,
  );
});

const leaveCommunity = catchAsync(async (req, res) => {
  const community = await CommunityService.leaveCommunity(
    req.validated.params.id,
    req.user.id,
  );
  return ResponseHandler.success(
    res,
    "Left community successfully",
    community,
  );
});

const promoteToAdmin = catchAsync(async (req, res) => {
  const community = await CommunityService.promoteToAdmin(
    req.validated.params.id,
    req.validated.body.userId,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(
    res,
    "Member promoted successfully",
    community,
  );
});

const pinPost = catchAsync(async (req, res) => {
  const community = await CommunityService.pinPost(
    req.validated.params.id,
    req.validated.body.postId,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(res, "Post pinned successfully", community);
});

const unpinPost = catchAsync(async (req, res) => {
  const community = await CommunityService.unpinPost(
    req.validated.params.id,
    req.validated.body.postId,
    req.user.id,
    req.user.role,
  );
  return ResponseHandler.success(res, "Post unpinned successfully", community);
});

const getCommunityPosts = catchAsync(async (req, res) => {
  const posts = await CommunityService.getCommunityPosts(
    req.validated.params.id,
    req.validated.query,
  );
  return ResponseHandler.success(
    res,
    "Community posts fetched successfully",
    posts,
  );
});

module.exports = {
  createCommunity,
  getCommunities,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  promoteToAdmin,
  pinPost,
  unpinPost,
  getCommunityPosts,
};
