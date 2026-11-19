const PostModel = require("../models/PostModel");
const CommunityModel = require("../models/CommunityModel");
const PostService = require("../services/PostService");

jest.mock("../models/PostModel", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../models/CommunityModel", () => ({
  findById: jest.fn(),
  updateOne: jest.fn(),
}));

const makeQuery = (result) => {
  const query = Promise.resolve(result);
  query.populate = jest.fn(() => query);
  query.skip = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.sort = jest.fn(() => query);
  query.select = jest.fn(() => query);
  return query;
};

const createPost = (overrides = {}) => ({
  _id: "post-1",
  userId: "author-1",
  communityId: null,
  content: "A post",
  media: [],
  likes: [],
  comments: [],
  save: jest.fn(async function save() {
    return this;
  }),
  populate: jest.fn(async function populate() {
    return this;
  }),
  ...overrides,
});

describe("PostService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("binds post ownership to the authenticated user", async () => {
    const post = createPost();
    PostModel.create.mockResolvedValue(post);

    await PostService.createPost("author-1", "user", {
      content: "A post",
      media: [],
      userId: "attacker-id",
    });

    expect(PostModel.create).toHaveBeenCalledWith({
      userId: "author-1",
      communityId: undefined,
      content: "A post",
      media: [],
    });
  });

  it("requires community membership before creating a community post", async () => {
    CommunityModel.findById.mockResolvedValue({
      members: [{ userId: "member-1", role: "member" }],
    });

    await expect(
      PostService.createPost("outsider", "user", {
        communityId: "community-1",
        content: "A post",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(PostModel.create).not.toHaveBeenCalled();
  });

  it("allows only the author to edit a post", async () => {
    const post = createPost();
    PostModel.findById.mockResolvedValue(post);

    await expect(
      PostService.updatePost("post-1", "other-user", {
        content: "Changed",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(post.save).not.toHaveBeenCalled();

    await PostService.updatePost("post-1", "author-1", {
      content: "Updated post",
      userId: "attacker-id",
    });
    expect(post.content).toBe("Updated post");
    expect(post.userId).toBe("author-1");
    expect(post.save).toHaveBeenCalledTimes(1);
  });

  it("allows only authors, community admins, or site admins to delete posts", async () => {
    const post = createPost({ communityId: "community-1" });
    PostModel.findById.mockResolvedValue(post);
    CommunityModel.findById.mockReturnValue(
      makeQuery({
        members: [{ userId: "community-admin", role: "admin" }],
      }),
    );

    await expect(
      PostService.deletePost("post-1", "other-user", "user"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(PostModel.findByIdAndDelete).not.toHaveBeenCalled();

    await PostService.deletePost("post-1", "community-admin", "user");
    expect(CommunityModel.updateOne).toHaveBeenCalledWith(
      { _id: "community-1" },
      { $pull: { pinnedPosts: "post-1" } },
    );
    expect(PostModel.findByIdAndDelete).toHaveBeenCalledWith("post-1");
  });

  it("toggles likes using the authenticated user ID", async () => {
    const likes = ["user-1"];
    likes.pull = jest.fn((userId) => {
      const index = likes.indexOf(userId);
      if (index >= 0) likes.splice(index, 1);
    });
    likes.addToSet = jest.fn((userId) => {
      if (!likes.includes(userId)) likes.push(userId);
    });
    const post = createPost({ likes });
    PostModel.findById.mockResolvedValue(post);

    await PostService.toggleLike("post-1", "user-1");
    expect(likes).not.toContain("user-1");

    await PostService.toggleLike("post-1", "user-2");
    expect(likes).toContain("user-2");
  });

  it("allows only the comment author, post author, or moderators to delete comments", async () => {
    const comment = { userId: "comment-author" };
    const comments = [comment];
    comments.id = jest.fn(() => comment);
    comments.pull = jest.fn();
    const post = createPost({ comments });
    PostModel.findOne.mockResolvedValue(post);

    await expect(
      PostService.deleteComment("comment-1", "other-user", "user"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(comments.pull).not.toHaveBeenCalled();

    await PostService.deleteComment("comment-1", "comment-author", "user");
    expect(comments.pull).toHaveBeenCalledWith("comment-1");
    expect(post.save).toHaveBeenCalledTimes(1);
  });

  it("paginates posts and safely escapes search input", async () => {
    const items = [createPost()];
    const query = makeQuery(items);
    PostModel.find.mockReturnValue(query);
    PostModel.countDocuments.mockResolvedValue(21);

    const result = await PostService.getPosts({
      page: 2,
      limit: 10,
      sort: "new",
      q: ".*",
    });

    expect(PostModel.find.mock.calls[0][0].content).toEqual(/\.\*/i);
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      pages: 3,
    });
  });
});
