jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/content/projects/project-markdown-content", () => ({
  PROJECT_MARKDOWN_FILES: [
    {
      fileName: "second.md",
      raw: `---
title: "Second"
slug: "second"
summary: "Second project."
order: 2
---
## Overview
`,
    },
    {
      fileName: "first.md",
      raw: `---
title: "First"
slug: "first"
summary: "First project."
order: 1
---
## Overview
`,
    },
  ],
}));

import { getAllProjectDocs, getProjectDocBySlug } from "./projects-markdown";

describe("projects markdown loader", () => {
  it("returns a flat ordered collection and resolves stable slugs", async () => {
    const projects = await getAllProjectDocs();

    expect(projects.map((project) => project.slug)).toEqual(["first", "second"]);
    await expect(getProjectDocBySlug("second")).resolves.toMatchObject({
      title: "Second",
      summary: "Second project.",
    });
    await expect(getProjectDocBySlug("missing")).resolves.toBeUndefined();
  });
});
