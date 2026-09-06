"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Tran Quoc Dat", font: "font-luxurious-roman", href: "#home" },
  { id: "about", label: "About Me", font: "font-luxurious-roman", href: "#about" },
  { id: "contact", label: "Get in Touch", font: "font-luxurious-roman", href: "#contact" },
] as const;

const SECTION_IDS = [...NAV_ITEMS.map((item) => item.id), "footer"];

export function Navbar() {
  const activeSection = useActiveSection(SECTION_IDS);
  const [hasInitialAnimationCompleted, setHasInitialAnimationCompleted] = useState(false);
  const [initialActiveSection] = useState<string | null>(() => activeSection || null);
  const isLightBackgroundSection = activeSection === "about";
  const baseTextColor = isLightBackgroundSection
    ? "text-[var(--brand-bg)]"
    : "text-[var(--brand-fg)]";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHasInitialAnimationCompleted(true);
    }, 2100);

    return () => window.clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className="hidden md:flex fixed bottom-8 left-8 z-50 flex-col items-start -space-y-5 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Main Navigation"
    >
      {NAV_ITEMS.map((item, index) => {
        const isActive = activeSection === item.id;
        const shouldUseInitialActiveAnim = initialActiveSection === item.id;

        return (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={`
              block transition-all duration-500 ease-out origin-left
              ${
                hasInitialAnimationCompleted
                  ? ""
                  : shouldUseInitialActiveAnim
                    ? "animate-nav-fade-in-left-active"
                    : "animate-nav-fade-in-left-inactive"
              }
              ${item.font} tracking-wide
              ${baseTextColor}
              ${
                isActive
                  ? "text-lg opacity-100 font-bold"
                  : "text-md opacity-60 hover:opacity-90 hover:scale-105"
              }
            `}
            style={{ animationDelay: `${0.6 + index * 0.2}s`, animationFillMode: "backwards" }}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
