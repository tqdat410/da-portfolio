import { render, screen } from "@testing-library/react";
import { Contact } from "./Contact";
import "@testing-library/jest-dom";
import { content } from "@/content";

jest.mock("@/components/Particles", () => ({
  __esModule: true,
  default: () => <div data-testid="particles-bg" />,
}));

describe("Contact Section", () => {
  it("renders the section title and profile image", () => {
    render(<Contact />);
    expect(screen.getByText(content.contact.title)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /profile/i })).toBeInTheDocument();
  });

  it("renders contact information (email and phone)", () => {
    render(<Contact />);
    const emailLink = screen
      .getByText(new RegExp(`Gmail\\s*:\\s*${content.contact.email}`))
      .closest("a");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", `mailto:${content.contact.email}`);

    const phoneLink = screen.getByText(new RegExp(`Phone\\s*:\\s*\\+84\\s*901600791`)).closest("a");
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute("href", `tel:${content.contact.phone}`);
  });

  it("renders key social links with correct attributes and hover style classes", () => {
    render(<Contact />);
    const githubLink = screen.getByText(/GitHub\s*:\s*tqdat410/).closest("a");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", content.social.github);

    const linkedinLink = screen.getByText(/LinkedIn\s*:\s*tqdat410/).closest("a");
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute("href", content.social.linkedin);

    const linktreeLink = screen.getByText(/Linktree\s*:\s*tqdat410/).closest("a");
    expect(linktreeLink).toBeInTheDocument();
    expect(linktreeLink).toHaveAttribute("href", content.contact.linktree);

    expect(githubLink).toHaveClass("group");
    const backgroundLayer = githubLink?.querySelector("span.absolute");
    expect(backgroundLayer).toBeInTheDocument();
    expect(backgroundLayer).toHaveClass("origin-bottom-right");
    expect(backgroundLayer).toHaveClass("group-hover:scale-x-100");
    expect(backgroundLayer).toHaveClass("group-hover:scale-y-100");
  });

  it("does not render removed contact channels", () => {
    render(<Contact />);

    expect(screen.queryByText(/Instagram\s*:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Upwork\s*:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reddit\s*:/i)).not.toBeInTheDocument();
  });
});
