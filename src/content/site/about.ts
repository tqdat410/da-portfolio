import type { AboutContent } from "@/content/types";

export const about: AboutContent = {
  title: "About Me",
  name: "Tran Quoc Dat",
  basicInfo: {
    location: "Ho Chi Minh City, Vietnam",
  },
  education: {
    items: [
      {
        school: "FPT University",
        degree: "Software Engineering",
        year: "2022 - 2026",
        gpa: "GPA: 3.75/4.0",
      },
    ],
  },
  experience: {
    items: [
      {
        company: "FPT Software",
        role: "OJT Trainee",
        period: "Jan 2025 - Apr 2025",
      },
    ],
  },
  skills: {
    categories: [
      {
        title: "Core",
        items: ["ABAP", "Java", "SpringBoot"],
      },
      {
        title: "AI Usage",
        items: ["Claude Code", "Codex"],
      },
      {
        title: "Others",
        items: [
          "Fiori",
          "UI5",
          "PostgreSQL",
          "JavaScript",
          "TypeScript",
          "React",
          "Next.js",
          "MongoDB",
          "Redis",
          "Supabase",
          "Docker",
          "Kafka",
          "Cloudflare",
          "n8n",
        ],
      },
    ],
  },
  certificates: {
    items: [
      {
        name: "Coursera",
        count: 9,
        items: [
          {
            name: "Project Management Principles and Practices",
            provider: "University of California, Irvine",
            url: "https://coursera.org/share/e2d023039eb45b4e9a50acf98f951b86",
          },
          {
            name: "User Experience Research and Design",
            provider: "University of Michigan",
            url: "https://coursera.org/share/6b2d9b9df878b385e7882feb8553aa16",
          },
          {
            name: "Software Development Lifecycle",
            provider: "University of Minnesota",
            url: "https://coursera.org/share/0c5ed0fcbc8853284dbcc5535b212887",
          },
          {
            name: "CertNexus Certified Ethical Emerging Technologist",
            provider: "CertNexus",
            url: "https://coursera.org/share/2b5e52f9bf6d0a85af54636bca0dfc86",
          },
          {
            name: "Object Oriented Programming in Java",
            provider: "Duke University, University of California San Diego",
            url: "https://coursera.org/share/20dbf0f78491c8554f59c823e7c786b5",
          },
          {
            name: "Web Design for Everybody: Basics of Web Development & Coding",
            provider: "University of Michigan",
            url: "https://coursera.org/share/670a0cf0ceb2f23d41bbb3bffc382820",
          },
          {
            name: "Java Database Connectivity",
            provider: "LearnQuest",
            url: "https://coursera.org/share/a63ee360e3dff0215d6eedfd5076f79b",
          },
          {
            name: "Computer Communications",
            provider: "University of Colorado System",
            url: "https://coursera.org/share/174d8e8c079ba69a64d80c92da7b246d",
          },
          {
            name: "Academic Skills for University Success",
            provider: "The University of Sydney",
            url: "https://coursera.org/share/6dd89064482d892dd5f55cdab5850aa4",
          },
        ],
      },
      {
        name: "FPT Software",
        count: 2,
        items: [
          {
            name: "Certificate on the Job Training",
            provider: "FPT Software",
            url: "https://fap.fpt.edu.vn/temp/9eb13e44-ad3b-4a10-a11b-3fa14e6a4b6c.pdf",
          },
          { name: "FSOFT Short Course for Testing", provider: "FPT Software", url: "" },
        ],
      },
    ],
  },
};
