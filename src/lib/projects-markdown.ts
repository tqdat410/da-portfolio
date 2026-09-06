import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { PROJECT_CATEGORY_ORDER } from "@/content/projects/config";
import type { ProjectCategory } from "@/content";
import { parseMarkdownFrontmatter } from "@/lib/markdown-frontmatter";

const PROJECTS_CONTENT_DIR = path.join(process.cwd(), "src", "content", "projects");

interface ProjectFrontmatter {
  title: string;
  slug: string;
  category: ProjectCategory;
  order: number;
  images?: ProjectImageAsset[];
}

export interface ProjectImageAsset {
  name: string;
  url: string;
}

export interface ProjectMarkdownDoc extends ProjectFrontmatter {
  fileName: string;
  rawMarkdown: string;
}

export interface ProjectsTreeProject {
  slug: string;
  title: string;
  fileName: string;
  images: ProjectImageAsset[];
}

export interface ProjectsTreeCategory {
  name: ProjectCategory;
  projects: ProjectsTreeProject[];
}

function isValidCategory(value: string): value is ProjectCategory {
  return PROJECT_CATEGORY_ORDER.includes(value as ProjectCategory);
}

function parseFrontmatter(raw: unknown, fileName: string): ProjectFrontmatter | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Partial<ProjectFrontmatter>;
  if (
    typeof data.title !== "string" ||
    typeof data.slug !== "string" ||
    typeof data.category !== "string" ||
    typeof data.order !== "number"
  ) {
    console.warn(`[projects-markdown] Invalid frontmatter shape in ${fileName}`);
    return null;
  }

  if (!isValidCategory(data.category)) {
    console.warn(`[projects-markdown] Invalid category in ${fileName}`);
    return null;
  }

  return {
    title: data.title,
    slug: data.slug,
    category: data.category,
    order: data.order,
    images: Array.isArray(data.images)
      ? data.images.filter(
          (image): image is ProjectImageAsset =>
            !!image &&
            typeof image === "object" &&
            typeof (image as ProjectImageAsset).name === "string" &&
            typeof (image as ProjectImageAsset).url === "string"
        )
      : [],
  };
}

export async function getAllProjectDocs(): Promise<ProjectMarkdownDoc[]> {
  const files = await fs.readdir(PROJECTS_CONTENT_DIR);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const docs = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const absolutePath = path.join(PROJECTS_CONTENT_DIR, fileName);
      const raw = await fs.readFile(absolutePath, "utf8");
      const parsed = parseMarkdownFrontmatter(raw);
      const frontmatter = parseFrontmatter(parsed.data, fileName);
      if (!frontmatter) return null;

      return {
        ...frontmatter,
        fileName,
        rawMarkdown: parsed.content.trim(),
      } satisfies ProjectMarkdownDoc;
    })
  );

  return docs
    .filter((doc): doc is ProjectMarkdownDoc => doc !== null)
    .sort((a, b) => {
      const categoryDiff =
        PROJECT_CATEGORY_ORDER.indexOf(a.category) - PROJECT_CATEGORY_ORDER.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
}

export function buildProjectsTree(docs: ProjectMarkdownDoc[]): ProjectsTreeCategory[] {
  return PROJECT_CATEGORY_ORDER.map((category) => {
    const projects = docs
      .filter((doc) => doc.category === category)
      .map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        fileName: doc.fileName,
        images: doc.images ?? [],
      }));

    return { name: category, projects };
  }).filter((group) => group.projects.length > 0);
}
