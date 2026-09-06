import { parse } from "yaml";

export interface ParsedMarkdownFrontmatter {
  data: unknown;
  content: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

export function parseMarkdownFrontmatter(source: string): ParsedMarkdownFrontmatter {
  const normalizedSource = source.replace(/^\uFEFF/, "");
  const match = FRONTMATTER_PATTERN.exec(normalizedSource);

  if (!match) {
    throw new Error("Markdown file must start with YAML frontmatter");
  }

  return {
    data: parse(match[1]),
    content: match[2],
  };
}
