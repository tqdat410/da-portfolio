import "server-only";

import certificatesMarkdown from "@/content/certificates/certificates.md";
import {
  CERTIFICATE_CATEGORY_ORDER,
  type CertificateCategoryName,
} from "@/content/certificates/config";
import { parseMarkdownFrontmatter } from "@/lib/markdown-frontmatter";

export interface CertificatePdfItem {
  title: string;
  provider: string;
  url: string;
}

export interface CertificateCategory {
  name: CertificateCategoryName;
  items: CertificatePdfItem[];
}

interface CertificatesFrontmatter {
  title: string;
  categories: CertificateCategory[];
}

export type CertificateDocument = CertificatesFrontmatter;

function isValidCategory(value: string): value is CertificateCategoryName {
  return CERTIFICATE_CATEGORY_ORDER.includes(value as CertificateCategoryName);
}

function parseItem(raw: unknown): CertificatePdfItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<CertificatePdfItem>;
  if (
    typeof item.title !== "string" ||
    typeof item.provider !== "string" ||
    typeof item.url !== "string"
  ) {
    return null;
  }

  return {
    title: item.title,
    provider: item.provider,
    url: item.url,
  };
}

function parseCategory(raw: unknown): CertificateCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const category = raw as Partial<CertificateCategory>;
  if (typeof category.name !== "string" || !isValidCategory(category.name)) {
    return null;
  }

  const items = Array.isArray(category.items)
    ? category.items.map(parseItem).filter((item): item is CertificatePdfItem => item !== null)
    : [];

  return {
    name: category.name,
    items,
  };
}

function parseFrontmatter(raw: unknown): CertificatesFrontmatter | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<CertificatesFrontmatter>;

  if (typeof data.title !== "string" || !Array.isArray(data.categories)) {
    return null;
  }

  const parsedCategories = data.categories
    .map(parseCategory)
    .filter((category): category is CertificateCategory => category !== null);

  const categories = CERTIFICATE_CATEGORY_ORDER.map((name) => {
    const matched = parsedCategories.find((category) => category.name === name);
    return matched ?? { name, items: [] };
  });

  return {
    title: data.title,
    categories,
  };
}

export async function getCertificatesDoc(): Promise<CertificateDocument> {
  const parsed = parseMarkdownFrontmatter(certificatesMarkdown);
  const frontmatter = parseFrontmatter(parsed.data);

  if (!frontmatter) {
    throw new Error("[certificates-markdown] Invalid frontmatter in certificates.md");
  }

  return frontmatter;
}
