const PostService = require("../services/PostService");
const catchAsync = require("../utils/catchAsync");

const createPost = catchAsync(async (req, res) => {
  const post = await PostService.createPost(
    req.user.id,
    req.user.role,
    req.validated.body,
  );
  return res.status(201).json({ success: true, data: post });
});

const getPosts = catchAsync(async (req, res) => {
  const result = await PostService.getPosts(req.validated.query);
  return res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

const getPost = catchAsync(async (req, res) => {
  const post = await PostService.getPost(req.validated.params.id);
  return res.json({ success: true, data: post });
});

const updatePost = catchAsync(async (req, res) => {
  const post = await PostService.updatePost(
    req.validated.params.id,
    req.user.id,
    req.validated.body,
  );
  return res.json({ success: true, data: post });
});

const deletePost = catchAsync(async (req, res) => {
  await PostService.deletePost(
    req.validated.params.id,
    req.user.id,
    req.user.role,
  );
  return res.json({ success: true, message: "Post deleted" });
});

const toggleLike = catchAsync(async (req, res) => {
  const post = await PostService.toggleLike(
    req.validated.params.id,
    req.user.id,
  );
  return res.json({ success: true, data: post });
});

const addComment = catchAsync(async (req, res) => {
  const post = await PostService.addComment(
    req.validated.params.id,
    req.user.id,
    req.validated.body.content,
  );
  return res.json({ success: true, data: post });
});

const deleteComment = catchAsync(async (req, res) => {
  const post = await PostService.deleteComment(
    req.validated.params.commentId,
    req.user.id,
    req.user.role,
  );
  return res.json({ success: true, data: post });
});

const getCommunityPosts = catchAsync(async (req, res) => {
  const result = await PostService.getCommunityPosts(
    req.validated.params.communityId,
    req.validated.query,
  );
  return res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

const getUserPosts = catchAsync(async (req, res) => {
  const result = await PostService.getPosts({
    ...req.validated.query,
    userId: req.validated.params.userId,
  });
  return res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

const AddCommentReply = catchAsync(async (req, res) => {
  const post = await PostService.addCommentReply(
    req.validated.params.postId,
    req.validated.params.commentId,
    req.user.id,
    req.validated.body.content,
  );
  return res.status(200).json({ success: true, data: post });
});

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getCommunityPosts,
  getUserPosts,
  AddCommentReply,
};
