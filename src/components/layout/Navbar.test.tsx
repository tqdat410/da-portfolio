import { render, screen } from "@testing-library/react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Navbar } from "./Navbar";

jest.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: jest.fn(),
}));

const mockUseActiveSection = jest.mocked(useActiveSection);

describe("Navbar", () => {
  beforeEach(() => {
    mockUseActiveSection.mockReturnValue("home");
  });

  it("uses stable, non-overlapping navigation rows", () => {
    render(<Navbar />);

    expect(screen.getByRole("navigation", { name: /main navigation/i })).not.toHaveClass(
      "-space-y-5"
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveClass("text-base");
      expect(link).toHaveStyle({ height: "2rem", minHeight: "2rem" });
      expect(link.className).not.toMatch(/scale-|text-lg|text-md/);
    });
  });

  it("indicates the active section without changing item dimensions", () => {
    render(<Navbar />);

    const activeLabel = screen
      .getByRole("link", { name: "Tran Quoc Dat" })
      .querySelector("[data-nav-label]");
    const inactiveLink = screen.getByRole("link", { name: "About Me" });
    const inactiveLabel = inactiveLink.querySelector("[data-nav-label]");
    const hoverFill = inactiveLink.querySelector("[data-nav-hover-fill]");

    expect(activeLabel).toHaveClass("scale-110", "font-bold", "duration-700");
    expect(inactiveLabel).toHaveClass("scale-95", "font-normal");
    expect(inactiveLabel?.firstElementChild).toHaveClass("opacity-55");
    expect(inactiveLabel).not.toHaveClass("group-hover:scale-100");
    expect(hoverFill).toHaveClass("nav-hover-fill");
    expect(hoverFill).toHaveAttribute("aria-hidden", "true");
    expect(inactiveLink.querySelector("[data-nav-underline]")).toBeNull();
  });
});
