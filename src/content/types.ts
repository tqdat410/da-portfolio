export type ProjectCategory =
  | "SAP"
  | "Startup"
  | "University Course Projects"
  | "Personal / Creative Side Projects";

export interface ProjectLink {
  label: string;
  url: string;
  icon?: "github" | "demo" | "docs" | "video" | "external";
}

export interface HeroContent {
  name: string;
  role: string;
  description: string;
  resumeUrl: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  year: string;
  gpa: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface CertificateItem {
  name: string;
  provider: string;
  url: string;
}

export interface CertificateGroup {
  name: string;
  count: number;
  items: CertificateItem[];
}

export interface AboutContent {
  title: string;
  name: string;
  basicInfo: { location: string };
  education: { items: EducationItem[] };
  experience: { items: ExperienceItem[] };
  skills: { categories: SkillCategory[] };
  certificates: { items: CertificateGroup[] };
}

export interface ProjectsContent {
  title: string;
}

export interface ShowcaseItem {
  category: ProjectCategory;
  title: string;
  description: string;
  techStack: string[];
  mainImage: string;
  secondaryImage: string;
}

export interface ContactContent {
  title: string;
  email: string;
  phone: string;
  linktree: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  facebook: string;
  x: string;
  telegram: string;
  discord: string;
}

export interface PortfolioContent {
  hero: HeroContent;
  about: AboutContent;
  projects: ProjectsContent;
  showcase: { items: ShowcaseItem[] };
  contact: ContactContent;
  social: SocialLinks;
}
