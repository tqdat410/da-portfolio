import { render } from "@testing-library/react";
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
});
