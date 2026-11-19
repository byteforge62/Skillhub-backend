const CommunityModel = require("../models/CommunityModel");
const PostModel = require("../models/PostModel");
const CommunityService = require("../services/CommunityService");

jest.mock("../models/CommunityModel", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("../models/PostModel", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

const createCommunity = (overrides = {}) => ({
  _id: "community-1",
  name: "Developers",
  description: "A place for developers",
  createdBy: "admin-1",
  members: [
    { userId: "admin-1", role: "admin" },
    { userId: "member-1", role: "member" },
  ],
  pinnedPosts: [],
  save: jest.fn(async function save() {
    return this;
  }),
  ...overrides,
});

const makeQuery = (result) => {
  const query = Promise.resolve(result);
  query.populate = jest.fn(() => query);
  query.skip = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.sort = jest.fn(() => query);
  query.select = jest.fn(() => query);
  return query;
};

describe("CommunityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a community with the authenticated creator as its initial admin", async () => {
    const community = createCommunity();
    CommunityModel.create.mockResolvedValue(community);

    await CommunityService.createCommunity(
      {
        name: community.name,
        description: community.description,
        coverImage: "",
        userId: "attacker-id",
      },
      "admin-1",
    );

    expect(CommunityModel.create).toHaveBeenCalledWith({
      name: community.name,
      description: community.description,
      coverImage: "",
      createdBy: "admin-1",
      members: [{ userId: "admin-1", role: "admin" }],
    });
  });

  it("allows a community admin to update details but rejects other members", async () => {
    const community = createCommunity();
    CommunityModel.findById.mockResolvedValue(community);

    await expect(
      CommunityService.updateCommunity(
        "community-1",
        { name: "Unauthorized" },
        "member-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(community.save).not.toHaveBeenCalled();

    await CommunityService.updateCommunity(
      "community-1",
      { name: "Updated community" },
      "admin-1",
      "user",
    );
    expect(community.name).toBe("Updated community");
    expect(community.save).toHaveBeenCalledTimes(1);
  });

  it("prevents deleting communities that still contain posts", async () => {
    CommunityModel.findById.mockResolvedValue(createCommunity());
    PostModel.countDocuments.mockResolvedValue(1);

    await expect(
      CommunityService.deleteCommunity(
        "community-1",
        "admin-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(CommunityModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("prevents the last community admin from leaving", async () => {
    const community = createCommunity({
      members: [{ userId: "admin-1", role: "admin" }],
    });
    CommunityModel.findById.mockResolvedValue(community);

    await expect(
      CommunityService.leaveCommunity("community-1", "admin-1"),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(community.save).not.toHaveBeenCalled();
  });

  it("allows only community admins to promote members", async () => {
    const community = createCommunity();
    CommunityModel.findById.mockResolvedValue(community);

    await expect(
      CommunityService.promoteToAdmin(
        "community-1",
        "member-1",
        "member-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(community.members[1].role).toBe("member");

    await CommunityService.promoteToAdmin(
      "community-1",
      "member-1",
      "admin-1",
      "user",
    );
    expect(community.members[1].role).toBe("admin");
  });

  it("allows pinning only posts belonging to the authorized community", async () => {
    const community = createCommunity();
    CommunityModel.findById.mockResolvedValue(community);
    PostModel.findById.mockReturnValue(
      makeQuery({ _id: "post-1", communityId: "different-community" }),
    );

    await expect(
      CommunityService.pinPost(
        "community-1",
        "post-1",
        "admin-1",
        "user",
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(community.save).not.toHaveBeenCalled();
  });

  it("paginates community posts, escapes search, and keeps pinned posts first", async () => {
    const community = createCommunity({
      pinnedPosts: ["post-1"],
    });
    const posts = [
      {
        _id: "post-2",
        likes: ["a", "b", "c"],
        comments: [],
        toObject: () => ({ _id: "post-2", likes: ["a", "b", "c"] }),
      },
      {
        _id: "post-1",
        likes: ["a"],
        comments: [],
        toObject: () => ({ _id: "post-1", likes: ["a"] }),
      },
    ];
    const query = makeQuery(posts);
    CommunityModel.findById.mockResolvedValue(community);
    PostModel.find.mockReturnValue(query);
    PostModel.countDocuments.mockResolvedValue(2);

    const result = await CommunityService.getCommunityPosts(
      "community-1",
      { page: 2, limit: 5, sort: "top", q: ".*" },
    );

    const filter = PostModel.find.mock.calls[0][0];
    expect(filter.content).toEqual(/\.\*/i);
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.limit).toHaveBeenCalledWith(5);
    expect(result.posts.map((post) => post._id)).toEqual([
      "post-1",
      "post-2",
    ]);
    expect(result.posts[0].isPinned).toBe(true);
    expect(result.total).toBe(2);
  });
});
