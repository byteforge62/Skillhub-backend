const { createResourceSchema } = require("../validations/resource.validation");
const { lessonBlockSchema } = require("../validations/lesson.validation");

describe("media URL validation", () => {
  it("accepts HTTP(S) lesson media URLs", () => {
    const result = lessonBlockSchema.safeParse({
      type: "video",
      order: 1,
      data: { url: "https://example.com/lesson.mp4" },
    });

    expect(result.success).toBe(true);
  });

  it.each(["javascript:alert(1)", "data:text/html,unsafe", "ftp://example.com/file"])(
    "rejects unsafe resource URLs: %s",
    (url) => {
      const result = createResourceSchema.safeParse({
        body: {
          title: "Test resource",
          type: "link",
          url,
        },
      });

      expect(result.success).toBe(false);
    }
  );

  it("rejects unsafe lesson image URLs", () => {
    const result = lessonBlockSchema.safeParse({
      type: "image",
      order: 1,
      data: { url: "javascript:alert(1)" },
    });

    expect(result.success).toBe(false);
  });
});
