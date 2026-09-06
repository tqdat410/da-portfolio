import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ProjectsExplorerPageClient } from "./projects-explorer-page-client";
import type { ProjectMarkdownDoc, ProjectsTreeCategory } from "@/lib/projects-markdown";

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockParams = new URLSearchParams();

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => "/tqdat410/projects",
  useSearchParams: () => ({
    get: (key: string) => mockParams.get(key),
    toString: () => mockParams.toString(),
  }),
}));

const docs: ProjectMarkdownDoc[] = [
  {
    title: "Demo Project",
    slug: "demo-project",
    category: "SAP",
    order: 1,
    images: [{ name: "website.png", url: "https://example.com/website.png" }],
    fileName: "demo-project.md",
    rawMarkdown: "## Overview\n\nHello world",
  },
];

const tree: ProjectsTreeCategory[] = [
  {
    name: "SAP",
    projects: [
      {
        slug: "demo-project",
        title: "Demo Project",
        fileName: "demo-project.md",
        images: [{ name: "website.png", url: "https://example.com/website.png" }],
      },
    ],
  },
];

describe("ProjectsExplorerPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    mockParams = new URLSearchParams("view=preview");
  });

  it("opens markdown file on double click", () => {
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand SAP" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand Demo Project" }));
    fireEvent.doubleClick(screen.getByRole("treeitem", { name: "demo-project.md" }));

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("file=demo-project"));
  });

  it("renders back row and total project count", () => {
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    expect(screen.getByRole("treeitem", { name: "..." })).toBeInTheDocument();
    expect(screen.getByText("total projects: 1")).toBeInTheDocument();
  });

  it("supports keyboard enter on back row", () => {
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);
    fireEvent.click(screen.getByRole("treeitem", { name: "..." }));
    fireEvent.keyDown(screen.getByRole("tree"), { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/tqdat410");
  });

  it("expands folder using arrow single click", () => {
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand SAP" }));

    expect(screen.getByRole("treeitem", { name: /Demo Project/i })).toBeInTheDocument();
  });

  it("opens folder view and hides preview/raw toggle", () => {
    mockParams = new URLSearchParams("folder=category:SAP");
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    expect(screen.getByRole("button", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Raw" })).not.toBeInTheDocument();
  });

  it("opens image file in popup", () => {
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand SAP" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand Demo Project" }));
    fireEvent.doubleClick(screen.getByRole("treeitem", { name: "website.png" }));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("image=demo-project%3Awebsite.png")
    );
  });

  it("maps legacy project query to file slug", () => {
    mockParams = new URLSearchParams("project=Demo%20Project");
    render(<ProjectsExplorerPageClient docs={docs} tree={tree} />);

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("file=demo-project"));
  });
});
