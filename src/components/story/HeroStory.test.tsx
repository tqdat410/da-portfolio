import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HeroStory } from "./HeroStory";

jest.mock("@/components/animations/HeroVisual", () => ({
  __esModule: true,
  default: () => <canvas aria-hidden="true" data-testid="hero-visual" />,
}));

describe("HeroStory", () => {
  it("keeps the complete semantic Hero available without the visual enhancement", () => {
    render(<HeroStory />);

    expect(screen.getByRole("heading", { level: 1, name: "Da'portfolio" })).toBeVisible();
    const intro = screen.getByRole("paragraph");
    expect(intro).toBeVisible();
    expect(intro).toHaveTextContent("Hi, this is Tran Quoc Dat's site,");
    expect(intro).toHaveTextContent(
      "where you can explore my projects, background, and experience."
    );
    expect(screen.getByTestId("hero-visual")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes one authoritative heading", () => {
    render(<HeroStory />);
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });
});
