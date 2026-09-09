jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/content/certificates/certificates.md", () => {
  const createItems = (count: number, offset = 0) =>
    Array.from({ length: count }, (_, index) => {
      const number = index + offset + 1;
      return [
        `      - title: "Certificate ${number}"`,
        '        provider: "Test Provider"',
        `        url: "https://example.com/certificate-${number}"`,
      ].join("\n");
    }).join("\n");

  return `---
title: "Certificates"
categories:
  - name: "Coursera"
    items:
${createItems(9)}
  - name: "FPT Software"
    items:
${createItems(2, 9)}
---
`;
});

import { getCertificatesDoc } from "./certificates-markdown";

describe("certificates markdown loader", () => {
  it("returns the two published groups and all eleven credentials", async () => {
    const document = await getCertificatesDoc();
    const certificates = document.categories.flatMap((category) => category.items);

    expect(document.categories.map((category) => category.name)).toEqual([
      "Coursera",
      "FPT Software",
    ]);
    expect(certificates).toHaveLength(11);
  });
});
