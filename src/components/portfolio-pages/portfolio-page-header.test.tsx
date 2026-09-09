import { render, screen } from "@testing-library/react";
import { PortfolioPageHeader } from "./portfolio-page-header";

describe("PortfolioPageHeader", () => {
  it("marks the active canonical page without changing link destinations", () => {
    const { container } = render(<PortfolioPageHeader active="projects" />);

    expect(screen.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Da'portfolio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Certificates" })).toHaveAttribute(
      "href",
      "/certificates"
    );
    expect(container.querySelector("header")).toHaveClass("h-[4.8125rem]", "md:h-[4.75rem]");
  });
});
