const Community = require("../models/CommunityModel");
const Post = require("../models/PostModel");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");

const requireCommunityAdmin = (community, userId, userRole) => {
  if (userRole === "admin") {
    return;
  }

  const member = community.members.find(
    (item) => item.userId.toString() === String(userId),
  );
  if (!member || member.role !== "admin") {
    throw new AppError("Not authorized", 403);
  }
};

const saveCommunity = async (community) => {
  try {
    return await community.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("A community with this name already exists", 409);
    }
    throw error;
  }
};

const getCommunityOrThrow = async (communityId) => {
  const community = await Community.findById(communityId);
  if (!community) {
    throw new AppError("Community not found", 404);
  }
  return community;
};

/**
 * Adds the counts the workspace rail and community list render. `members`
 * keeps its original shape so existing consumers are unaffected.
 */
const withCommunityStats = async (communities) => {
  const list = communities.map((community) =>
    community?.toObject ? community.toObject() : community,
  );

  if (list.length === 0) return list;

  const ids = list.map((community) => community._id);

  const postCounts = await Post.aggregate([
    { $match: { communityId: { $in: ids } } },
    { $group: { _id: "$communityId", count: { $sum: 1 } } },
  ]);
  const postCountByCommunity = new Map(
    postCounts.map((row) => [String(row._id), row.count]),
  );

  return list.map((community) => {
    const members = community.members || [];
    const shapedMembers = members.map((member) => {
      const user = member.userId && typeof member.userId === "object"
        ? member.userId
        : null;

      return {
        userId: user?._id ?? member.userId,
        role: member.role,
        fullname: user?.fullname ?? null,
        avatar: user?.avatar ?? null,
      };
    });

    return {
      ...community,
      memberCount: members.length,
      adminCount: members.filter((member) => member.role === "admin").length,
      postCount: postCountByCommunity.get(String(community._id)) || 0,
      recentMembers: shapedMembers
        .filter((member) => member.fullname || member.avatar)
        .slice(0, 5),
    };
  });
};

const createCommunity = async (communityData, userId) => {
  const { name, description, coverImage } = communityData;
  try {
    return await Community.create({
      name,
      description,
      coverImage,
      createdBy: userId,
      members: [{ userId, role: "admin" }],
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("A community with this name already exists", 409);
    }
    throw error;
  }
};

const getCommunities = async () => {
  const communities = await Community.find()
    .populate("createdBy", "fullname avatar")
    .populate("members.userId", "fullname avatar");

  return withCommunityStats(communities);
};

const getCommunity = async (communityId) => {
  const community = await Community.findById(communityId)
    .populate("createdBy", "fullname avatar")
    .populate("members.userId", "fullname avatar")
    .populate("pinnedPosts");

  if (!community) {
    throw new AppError("Community not found", 404);
  }

  const [shaped] = await withCommunityStats([community]);
  return shaped;
};

const updateCommunity = async (
  communityId,
  updateData,
  userId,
  userRole,
) => {
  const community = await getCommunityOrThrow(communityId);
  requireCommunityAdmin(community, userId, userRole);

  const { name, description, coverImage } = updateData;
  if (name !== undefined) community.name = name;
  if (description !== undefined) community.description = description;
  if (coverImage !== undefined) community.coverImage = coverImage;

  return saveCommunity(community);
};

const deleteCommunity = async (communityId, userId, userRole) => {
  const community = await getCommunityOrThrow(communityId);
  requireCommunityAdmin(community, userId, userRole);
  if (await Post.countDocuments({ communityId })) {
    throw new AppError("Communities with posts cannot be deleted", 409);
  }
  await Community.findByIdAndDelete(communityId);
  return community;
};

const joinCommunity = async (communityId, userId) => {
  const community = await getCommunityOrThrow(communityId);

  const alreadyMember = community.members.some(
    (member) => member.userId.toString() === String(userId),
  );
  if (alreadyMember) {
    throw new AppError("Already a member", 409);
  }

  community.members.push({ userId, role: "member" });
  return saveCommunity(community);
};

const leaveCommunity = async (communityId, userId) => {
  const community = await getCommunityOrThrow(communityId);
  const member = community.members.find(
    (item) => item.userId.toString() === String(userId),
  );

  if (member?.role === "admin") {
    const adminCount = community.members.filter(
      (item) => item.role === "admin",
    ).length;
    if (adminCount <= 1) {
      throw new AppError(
        "The last community admin cannot leave before promoting another member",
        409,
      );
    }
  }

  community.members = community.members.filter(
    (item) => item.userId.toString() !== String(userId),
  );

  return saveCommunity(community);
};

const promoteToAdmin = async (
  communityId,
  targetUserId,
  actorUserId,
  actorRole,
) => {
  const community = await getCommunityOrThrow(communityId);
  requireCommunityAdmin(community, actorUserId, actorRole);

  const member = community.members.find(
    (item) => item.userId.toString() === String(targetUserId),
  );
  if (!member) {
    throw new AppError("User not a member", 404);
  }

  member.role = "admin";
  return saveCommunity(community);
};

const verifyPostInCommunity = async (communityId, postId) => {
  const post = await Post.findById(postId).select("_id communityId");
  if (!post || post.communityId?.toString() !== String(communityId)) {
    throw new AppError("Post not found in this community", 404);
  }
};

const pinPost = async (communityId, postId, userId, userRole) => {
  const community = await getCommunityOrThrow(communityId);
  requireCommunityAdmin(community, userId, userRole);
  await verifyPostInCommunity(communityId, postId);

  if (
    !community.pinnedPosts.some(
      (pinnedPost) => pinnedPost.toString() === String(postId),
    )
  ) {
    community.pinnedPosts.push(postId);
    await saveCommunity(community);
  }
  return community;
};

const unpinPost = async (communityId, postId, userId, userRole) => {
  const community = await getCommunityOrThrow(communityId);
  requireCommunityAdmin(community, userId, userRole);
  await verifyPostInCommunity(communityId, postId);

  community.pinnedPosts = community.pinnedPosts.filter(
    (post) => post.toString() !== String(postId),
  );
  return saveCommunity(community);
};

const getCommunityPosts = async (communityId, queryParams) => {
  const { page, limit, sort, q } = queryParams;
  const community = await getCommunityOrThrow(communityId);
  const filter = { communityId };

  if (q) {
    const safeQuery = new RegExp(escapeRegex(q), "i");
    filter.content = safeQuery;
  }

  const skip = (page - 1) * limit;
  let query = Post.find(filter)
    .populate("userId", "fullname avatar")
    .populate("comments.userId", "fullname avatar")
    .skip(skip)
    .limit(limit);

  if (sort === "new") {
    query = query.sort({ createdAt: -1 });
  } else if (sort === "old") {
    query = query.sort({ createdAt: 1 });
  }

  const [total, rawPosts] = await Promise.all([
    Post.countDocuments(filter),
    query,
  ]);
  const pinnedIds = (community.pinnedPosts || []).map(String);
  const posts =
    sort === "top"
      ? [...rawPosts].sort(
          (left, right) =>
            (right.likes?.length || 0) - (left.likes?.length || 0),
        )
      : rawPosts;
  const orderedPosts = [
    ...posts.filter((post) => pinnedIds.includes(String(post._id))),
    ...posts.filter((post) => !pinnedIds.includes(String(post._id))),
  ];
  const shapedPosts = orderedPosts.map((post) => ({
    ...post.toObject(),
    likeCount: post.likes?.length || 0,
    commentCount: post.comments?.length || 0,
    isPinned: pinnedIds.includes(String(post._id)),
  }));

  return {
    community: {
      _id: community._id,
      name: community.name,
      description: community.description,
      memberCount: community.members?.length || 0,
      pinnedCount: community.pinnedPosts?.length || 0,
    },
    page,
    limit,
    total,
    count: shapedPosts.length,
    posts: shapedPosts,
  };
};

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
