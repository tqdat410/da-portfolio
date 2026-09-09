jest.mock("@/components/portfolio-pages/portfolio-page-header", () => ({
  PortfolioPageHeader: () => null,
}));
jest.mock("@/components/projects/project-article", () => ({
  ProjectArticle: () => null,
}));
jest.mock("@/lib/projects-markdown", () => ({
  getAllProjectDocs: jest
    .fn()
    .mockResolvedValue([{ slug: "custom-notification-center" }, { slug: "hengout" }]),
  getProjectDocBySlug: jest.fn(),
}));

import { dynamicParams, generateStaticParams } from "./page";

describe("project detail route generation", () => {
  it("keeps runtime fallback enabled when a prerender cache entry is unavailable", async () => {
    expect(dynamicParams).toBe(true);
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "custom-notification-center" },
      { slug: "hengout" },
    ]);
  });
});
