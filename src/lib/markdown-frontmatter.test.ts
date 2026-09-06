import { parseMarkdownFrontmatter } from "./markdown-frontmatter";

describe("parseMarkdownFrontmatter", () => {
  it("parses YAML data and preserves markdown content", () => {
    const parsed = parseMarkdownFrontmatter(`---
title: Example
tags:
  - portfolio
---
# Body
`);

    expect(parsed.data).toEqual({ title: "Example", tags: ["portfolio"] });
    expect(parsed.content).toBe("# Body\n");
  });

  it("supports Windows line endings and a byte order mark", () => {
    const parsed = parseMarkdownFrontmatter("\uFEFF---\r\ntitle: Example\r\n---\r\nBody");

    expect(parsed.data).toEqual({ title: "Example" });
    expect(parsed.content).toBe("Body");
  });

  it("rejects markdown without frontmatter", () => {
    expect(() => parseMarkdownFrontmatter("# Body")).toThrow(
      "Markdown file must start with YAML frontmatter"
    );
  });
});
