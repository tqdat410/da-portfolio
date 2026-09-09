import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ProjectArticle } from "./project-article";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => undefined,
}));

describe("ProjectArticle", () => {
  it("renders a typography-only project article without navigation or numbering", () => {
    render(
      <ProjectArticle
        project={{
          title: "AI Quick Note",
          slug: "ai-quick-note",
          summary: "AI-assisted notes.",
          order: 5,
          fileName: "ai-quick-note.md",
          rawMarkdown: "## Overview\n\nProject body",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "AI Quick Note" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /All projects/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Project 05")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/Project body/)).toBeInTheDocument();
  });
});
