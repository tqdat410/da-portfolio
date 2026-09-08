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
      className="fixed bottom-8 left-8 z-50 hidden flex-col items-start pb-[env(safe-area-inset-bottom)] md:flex"
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
              group inline-flex items-center text-base leading-none
              ${
                hasInitialAnimationCompleted
                  ? ""
                  : shouldUseInitialActiveAnim
                    ? "animate-nav-fade-in-left-active"
                    : "animate-nav-fade-in-left-inactive"
              }
              ${item.font} tracking-wide
              ${baseTextColor}
            `}
            style={{
              height: "2rem",
              minHeight: "2rem",
              animationDelay: `${0.6 + index * 0.2}s`,
              animationFillMode: "backwards",
            }}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              data-nav-label
              className={`relative inline-block origin-left transition-[transform,opacity] duration-700 ease-out ${
                isActive
                  ? "scale-110 font-bold opacity-100"
                  : "scale-95 font-normal opacity-55 group-hover:opacity-90"
              }`}
            >
              {item.label}
              <span
                data-nav-underline
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}
