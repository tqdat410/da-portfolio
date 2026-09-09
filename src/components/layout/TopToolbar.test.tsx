import { fireEvent, render, screen } from "@testing-library/react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { TopToolbar } from "./TopToolbar";

jest.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: jest.fn(),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useIsMobile: jest.fn(),
}));

const mockUseActiveSection = jest.mocked(useActiveSection);
const mockUseIsMobile = jest.mocked(useIsMobile);

describe("TopToolbar scrollbar theme", () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseActiveSection.mockReturnValue("home");
  });

  it("keeps the root scrollbar palette synchronized with the active section", () => {
    const { container, rerender, unmount } = render(<TopToolbar />);
    const getThemeCss = () => container.querySelector("style[data-scrollbar-theme]")?.textContent;

    expect(getThemeCss()).toContain("--scrollbar-track: var(--brand-bg)");
    expect(getThemeCss()).toContain("--scrollbar-thumb: var(--brand-fg)");

    mockUseActiveSection.mockReturnValue("about");
    rerender(<TopToolbar />);
    expect(getThemeCss()).toContain("--scrollbar-track: var(--brand-fg)");
    expect(getThemeCss()).toContain("--scrollbar-thumb: var(--brand-bg)");

    unmount();
    expect(document.querySelector("style[data-scrollbar-theme]")).not.toBeInTheDocument();
  });

  it("uses canonical project and home destinations", () => {
    render(<TopToolbar />);

    screen
      .getAllByRole("link", { name: "projects" })
      .forEach((link) => expect(link).toHaveAttribute("href", "/projects"));
    const brandLink = screen.getByRole("link", { name: "Back to home" });
    expect(brandLink).toHaveAttribute("href", "#home");
    expect(screen.getByTestId("desktop-toolbar-logo")).toHaveAttribute("src", "/qd-logo-white.svg");
    expect(screen.getByTestId("desktop-toolbar-logo")).toHaveClass(
      "group-hover:-rotate-45",
      "group-hover:opacity-0"
    );
    expect(screen.getByTestId("desktop-toolbar-logo")).toHaveStyle({
      transitionDuration: "1200ms, 300ms",
      transitionProperty: "rotate, opacity",
    });
    expect(screen.getByTestId("desktop-toolbar-name")).toHaveTextContent("Tran Quoc Dat");
    expect(screen.getByTestId("desktop-toolbar-name")).toHaveClass(
      "max-w-0",
      "group-hover:max-w-40",
      "group-hover:opacity-100"
    );
    const label = screen.getByTestId("desktop-toolbar-name-label");
    expect(label).toHaveClass("font-bold");
    const labels = ["Tran Quoc Dat", "Trần Quốc Đạt", "TQD", "tqdat410", "Da'portfolio"];

    labels.forEach((expectedLabel) => {
      fireEvent.mouseEnter(brandLink);
      expect(label).toHaveTextContent(expectedLabel);
      fireEvent.mouseLeave(brandLink);
    });

    fireEvent.mouseEnter(brandLink);
    expect(label).toHaveTextContent("Tran Quoc Dat");
  });

  it("keeps the mobile topbar opaque when the menu is closed or open", () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<TopToolbar />);
    const header = container.querySelector("header");
    const logo = screen.getByRole("button", { name: "Open menu" }).querySelector("img");

    expect(header).toHaveClass("bg-[var(--brand-bg)]", "py-4");
    expect(header).not.toHaveClass("bg-transparent");
    expect(header).not.toHaveClass("backdrop-blur-md");
    expect(logo).toHaveAttribute("src", "/qd-logo-white.svg");
    expect(logo).toHaveClass("h-9", "w-9", "rotate-0");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(header).toHaveClass("bg-[var(--brand-bg)]");
    expect(header).not.toHaveClass("bg-transparent");
    expect(logo).toHaveAttribute("src", "/qd-logo-white.svg");
    expect(logo).toHaveClass("-rotate-90");
    expect(screen.getByTestId("mobile-navigation-dropbar")).toHaveClass(
      "bg-[var(--brand-bg)]",
      "text-[var(--brand-fg)]"
    );
  });

  it("uses the black mobile logo over the light About topbar", () => {
    mockUseIsMobile.mockReturnValue(true);
    mockUseActiveSection.mockReturnValue("about");
    render(<TopToolbar />);

    const logo = screen.getByRole("button", { name: "Open menu" }).querySelector("img");
    expect(logo).toHaveAttribute("src", "/qd-logo-black.svg");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(logo).toHaveAttribute("src", "/qd-logo-black.svg");
    expect(logo).toHaveClass("-rotate-90");
    expect(screen.getByTestId("mobile-navigation-dropbar")).toHaveClass(
      "bg-[var(--brand-fg)]",
      "text-[var(--brand-bg)]"
    );
  });

  it("removes the light About topbar border on desktop", () => {
    mockUseActiveSection.mockReturnValue("about");
    const { container } = render(<TopToolbar />);

    expect(container.querySelector("header")).toHaveClass("bg-[var(--brand-fg)]", "md:border-none");
  });
});
