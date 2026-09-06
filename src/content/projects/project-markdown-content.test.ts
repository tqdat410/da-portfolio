import fs from "node:fs/promises";
import path from "node:path";

const PROJECTS_DIR = path.join(process.cwd(), "src", "content", "projects");
const REGISTRY_FILE = path.join(PROJECTS_DIR, "project-markdown-content.ts");

describe("project Markdown content registry", () => {
  it("registers every published Markdown file", async () => {
    const [directoryEntries, registrySource] = await Promise.all([
      fs.readdir(PROJECTS_DIR),
      fs.readFile(REGISTRY_FILE, "utf8"),
    ]);

    const markdownFiles = directoryEntries.filter((file) => file.endsWith(".md")).sort();
    const registeredFiles = Array.from(
      registrySource.matchAll(/from "\.\/([^\"]+\.md)"/g),
      (match) => match[1]
    ).sort();

    expect(registeredFiles).toEqual(markdownFiles);
  });
});
