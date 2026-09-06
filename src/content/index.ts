import { about } from "@/content/site/about";
import { contact, social } from "@/content/site/contact";
import { hero } from "@/content/site/hero";
import type { PortfolioContent } from "@/content/types";

export const content: PortfolioContent = {
  hero,
  about,
  contact,
  social,
};

export type * from "@/content/types";
