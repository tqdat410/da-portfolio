import { render, screen } from "@testing-library/react";
import { ProjectsIndex } from "./projects-index";
import type { ProjectMarkdownDoc } from "@/lib/projects-markdown";

const projects: ProjectMarkdownDoc[] = [
  {
    title: "Custom Notification Center",
    slug: "custom-notification-center",
    summary: "SAP notifications.",
    order: 1,
    fileName: "custom-notification-center.md",
    rawMarkdown: "## Overview",
  },
  {
    title: "Hengout",
    slug: "hengout",
    summary: "Location discovery.",
    order: 2,
    fileName: "hengout.md",
    rawMarkdown: "## Overview",
  },
  {
    title: "Koi Vet. Center",
    slug: "koi-vet-center",
    summary: "Veterinary services.",
    order: 3,
    fileName: "koi-vet-center.md",
    rawMarkdown: "## Overview",
  },
  {
    title: "Uni. Event Manager",
    slug: "uni-event-manager",
    summary: "University events.",
    order: 4,
    fileName: "uni-event-manager.md",
    rawMarkdown: "## Overview",
  },
  {
    title: "AI Quick Note",
    slug: "ai-quick-note",
    summary: "AI notes.",
    order: 5,
    fileName: "ai-quick-note.md",
    rawMarkdown: "## Overview",
  },
];

describe("ProjectsIndex", () => {
  it("renders five project routes and an external Others destination", () => {
    render(<ProjectsIndex projects={projects} />);

    projects.forEach((project) => {
      expect(screen.getByRole("link", { name: new RegExp(project.title) })).toHaveAttribute(
        "href",
        `/projects/${project.slug}`
      );
    });

    const others = screen.getByRole("link", { name: /Others/i });
    expect(others).toHaveAttribute("href", "https://github.com/tqdat410?tab=repositories");
    expect(others).toHaveAttribute("target", "_blank");
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it("keeps every row typography-only without trailing labels", () => {
    render(<ProjectsIndex projects={projects} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Read case study")).not.toBeInTheDocument();
    expect(screen.queryByText("GitHub repositories ↗")).not.toBeInTheDocument();
  });
});
