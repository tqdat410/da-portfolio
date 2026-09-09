import { render, screen } from "@testing-library/react";
import { CertificateIndex } from "./certificate-index";

describe("CertificateIndex", () => {
  it("uses direct safe links and preserves unavailable credentials", () => {
    render(
      <CertificateIndex
        document={{
          title: "Certificates",
          categories: [
            {
              name: "FPT Software",
              items: [
                {
                  title: "Available Certificate",
                  provider: "FPT Software",
                  url: "https://example.com/certificate",
                },
                {
                  title: "Pending Certificate",
                  provider: "FPT Software",
                  url: "",
                },
              ],
            },
          ],
        }}
      />
    );

    const available = screen.getByRole("link", { name: /Available Certificate/i });
    expect(available).toHaveAttribute("href", "https://example.com/certificate");
    expect(available).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Pending Certificate")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Pending Certificate/i })).not.toBeInTheDocument();
  });
});
