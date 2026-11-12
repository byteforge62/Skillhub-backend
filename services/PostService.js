const Post = require("../models/PostModel");
const Community = require("../models/CommunityModel");
const CommunityService = require("./CommunityService");
const AppError = require("../utils/AppError");
const eventEmitter = require("../events/EventEmitter");
const escapeRegex = require("../utils/escapeRegex");

const idOf = (value) => String(value?._id ?? value);

const getPostOrThrow = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
};

const isCommunityAdmin = async (communityId, userId) => {
  if (!communityId) {
    return false;
  }

  const community = await Community.findById(communityId).select("members");
  return Boolean(
    community?.members.some(
      (member) =>
        idOf(member.userId) === String(userId) && member.role === "admin",
    ),
  );
};

const ensureCanDeletePost = async (post, userId, userRole) => {
  if (userRole === "admin" || idOf(post.userId) === String(userId)) {
    return;
  }
  if (!(await isCommunityAdmin(post.communityId, userId))) {
    throw new AppError("Not authorized to delete this post", 403);
  }
};

const createPost = async (userId, userRole, postData) => {
  const { communityId, content, media = [] } = postData;

  if (communityId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new AppError("Community not found", 404);
    }

    const isMember = community.members.some(
      (member) => idOf(member.userId) === String(userId),
    );
    if (!isMember && userRole !== "admin") {
      throw new AppError("Join the community before posting", 403);
    }
  }

  const post = await Post.create({
    userId,
    communityId,
    content,
    media,
  });
  eventEmitter.emit("post-created", {
    userId: post.userId,
    postId: post._id,
  });
  return post;
};

const getPosts = async ({ page, limit, sort, q, communityId, userId } = {}) => {
  const filter = {};
  if (communityId) filter.communityId = communityId;
  if (userId) filter.userId = userId;
  if (q) filter.content = new RegExp(escapeRegex(q), "i");

  let query = Post.find(filter)
    .populate("userId", "fullname avatar")
    .populate("communityId", "name")
    .populate("comments.userId", "fullname avatar")
    .skip((page - 1) * limit)
    .limit(limit);

  if (sort === "new") {
    query = query.sort({ createdAt: -1 });
  } else if (sort === "old") {
    query = query.sort({ createdAt: 1 });
  }

  const [total, rawItems] = await Promise.all([
    Post.countDocuments(filter),
    query,
  ]);
  const items =
    sort === "top"
      ? [...rawItems].sort(
          (left, right) =>
            (right.likes?.length || 0) - (left.likes?.length || 0),
        )
      : rawItems;

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getPost = async (postId) => {
  const post = await Post.findById(postId)
    .populate("userId", "fullname avatar")
    .populate("communityId", "name")
    .populate("comments.userId", "fullname avatar")
    .populate("comments.replies.userId", "fullname avatar");

  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
};

const updatePost = async (postId, userId, updateData) => {
  const post = await getPostOrThrow(postId);
  if (idOf(post.userId) !== String(userId)) {
    throw new AppError("Not authorized to update this post", 403);
  }

  if (updateData.content !== undefined) post.content = updateData.content;
  if (updateData.media !== undefined) post.media = updateData.media;
  await post.save();
  return post;
};

const deletePost = async (postId, userId, userRole) => {
  const post = await getPostOrThrow(postId);
  await ensureCanDeletePost(post, userId, userRole);

  if (post.communityId) {
    await Community.updateOne(
      { _id: post.communityId },
      { $pull: { pinnedPosts: post._id } },
    );
  }
  await Post.findByIdAndDelete(postId);
};

const toggleLike = async (postId, userId) => {
  const post = await getPostOrThrow(postId);
  const isLiked = post.likes.some(
    (likedBy) => idOf(likedBy) === String(userId),
  );
  if (isLiked) {
    post.likes.pull(userId);
  } else if (typeof post.likes.addToSet === "function") {
    post.likes.addToSet(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();
  if (!isLiked) {
    eventEmitter.emit("post-Liked", { post, likedBy: userId });
  }
  return post;
};

const addComment = async (postId, userId, content) => {
  const post = await getPostOrThrow(postId);
  post.comments.push({ userId, content });
  await post.save();
  eventEmitter.emit("post-Commented", {
    post,
    comment: content,
    commentedBy: userId,
  });
  await post.populate("comments.userId", "fullname avatar");
  return post;
};

const deleteComment = async (commentId, userId, userRole) => {
  const post = await Post.findOne({ "comments._id": commentId });
  if (!post) {
    throw new AppError("Comment not found", 404);
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (
    idOf(comment.userId) !== String(userId) &&
    idOf(post.userId) !== String(userId) &&
    userRole !== "admin" &&
    !(await isCommunityAdmin(post.communityId, userId))
  ) {
    throw new AppError("Not authorized to delete this comment", 403);
  }

  post.comments.pull(commentId);
  await post.save();
  return post;
};

const addCommentReply = async (
  postId,
  commentId,
  userId,
  content,
) => {
  const post = await getPostOrThrow(postId);
  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  comment.replies.push({ userId, content });
  await post.save();
  await post.populate("comments.userId", "fullname avatar");
  return post;
};

const getCommunityPosts = async (communityId, query) => {
  const result = await CommunityService.getCommunityPosts(communityId, query);
  return {
    items: result.posts,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.ceil(result.total / result.limit),
    },
  };
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  addCommentReply,
  getCommunityPosts,
};
