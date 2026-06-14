"use client";

import { content } from "@/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { ReactNode, useState } from "react";

interface ToolbarLinkProps {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  inverted?: boolean;
}

function ToolbarLink({ href, children, target, rel, inverted = false }: ToolbarLinkProps) {
  const hoverBgClass = inverted ? "bg-[var(--brand-bg)]" : "bg-[var(--brand-fg)]";
  const textClass = inverted ? "text-[var(--brand-bg)]" : "text-[var(--brand-fg)]";
  const hoverTextClass = inverted ? "group-hover:text-[var(--brand-fg)]" : "group-hover:text-[var(--brand-bg)]";

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="group relative shrink-0 overflow-hidden px-1.5 py-2 font-luxurious-roman text-xs tracking-wide whitespace-nowrap md:px-4 md:text-lg"
    >
      {/* Background: Appears from top */}
      <span className={`absolute inset-0 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100 ${hoverBgClass}`} />

      {/* Text: Contrast color on hover */}
      <span className={`relative z-10 block transition-colors duration-300 ${textClass} ${hoverTextClass}`}>
        {children}
      </span>
    </a>
  );
}

interface CvDropdownProps {
  inverted?: boolean;
}

function CvDropdown({ inverted = false }: CvDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Color tokens
  const bgClass = inverted ? "bg-[var(--brand-bg)]" : "bg-[var(--brand-fg)]";
  const triggerTextDefault = inverted ? "text-[var(--brand-bg)]" : "text-[var(--brand-fg)]";
  const contrastText = inverted ? "text-[var(--brand-fg)]" : "text-[var(--brand-bg)]";

  // Desktop hover classes (only applied on desktop)
  const desktopHoverText = inverted
    ? "group-hover/cv:text-[var(--brand-fg)]"
    : "group-hover/cv:text-[var(--brand-bg)]";

  // Resolve trigger text class for mobile
  const triggerTextClass = isMobile
    ? isOpen ? contrastText : triggerTextDefault
    : `${triggerTextDefault} ${desktopHoverText}`;

  return (
    <>
      {/* Backdrop — covers entire screen to catch outside taps (mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="group/cv relative shrink-0 cursor-pointer font-luxurious-roman text-xs tracking-wide whitespace-nowrap md:text-lg">
        {/* Invisible spacer — reserves trigger space in toolbar flow */}
        <div className="invisible px-1.5 py-2 md:px-4">download cv</div>

        {/* Floating overlay — sits on top of spacer, expands down independently */}
        <div className={`absolute top-0 left-0 md:left-auto md:right-0 ${isMobile && isOpen ? "z-[70]" : "z-20"}`}>
          {/* Unified background */}
          <span
            className={`pointer-events-none absolute inset-0 origin-top transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isMobile
                ? isOpen ? "scale-y-100" : "scale-y-0"
                : "scale-y-0 group-hover/cv:scale-y-100"
            } ${bgClass}`}
          />

          {/* Trigger text */}
          <div
            className={`relative z-10 px-1.5 py-2 transition-colors duration-300 md:px-4 ${triggerTextClass}`}
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
              }
            }}
          >
            download cv
          </div>

          {/* Dropdown items */}
          <div
            className={`relative z-10 grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isMobile
                ? isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                : "grid-rows-[0fr] group-hover/cv:grid-rows-[1fr]"
            }`}
          >
            <div className="overflow-hidden">
              <a
                href={content.hero.resumeUrls.visual}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-1.5 py-1.5 transition-opacity duration-200 hover:opacity-60 md:px-4 md:py-2 ${contrastText}`}
                onClick={() => setIsOpen(false)}
              >
                Visual
              </a>
              <a
                href={content.hero.resumeUrls.ats}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-1.5 py-1.5 transition-opacity duration-200 hover:opacity-60 md:px-4 md:py-2 ${contrastText}`}
                onClick={() => setIsOpen(false)}
              >
                ATS.
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function TopToolbar() {
  const isMobile = useIsMobile();
  const activeSection = useActiveSection(["home", "about", "projects", "contact", "footer"]);
  const showSolidBackground = activeSection === "about" || activeSection === "projects";
  const isLightTheme = !isMobile && showSolidBackground;

  const headerClass = isMobile
    ? "bg-[var(--brand-bg)] pointer-events-auto"
    : showSolidBackground
      ? "bg-[var(--brand-fg)] pointer-events-auto"
      : "bg-transparent pointer-events-auto";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex w-full max-w-full items-center justify-end overflow-x-clip px-1 py-2 transition-all duration-300 md:justify-between md:px-4 md:py-4 ${headerClass}`}
    >
      {/* Email - hidden on mobile */}
      <div className="hidden md:block pointer-events-auto animate-fade-in-down" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
        <a
          href="/tqdat410"
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative font-luxurious-roman text-lg tracking-wide ${isLightTheme ? "text-[var(--brand-bg)]" : "text-[var(--brand-fg)]"
            }`}
        >
          {content.contact.email.toLowerCase()}
          <span
            className={`absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${isLightTheme ? "bg-[var(--brand-bg)]" : "bg-[var(--brand-fg)]"
              }`}
          />
        </a>
      </div>
      <div className="flex min-w-0 flex-wrap justify-end gap-0.5 pointer-events-auto animate-fade-in-down md:ml-auto md:gap-4" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
        <CvDropdown inverted={isLightTheme} />
        <ToolbarLink
          href="/tqdat410/projects?folder=root%3Aprojects&view=preview"
          target="_blank"
          rel="noopener noreferrer"
          inverted={isLightTheme}
        >
          projects
        </ToolbarLink>
        <ToolbarLink href={content.social.github} target="_blank" rel="noopener noreferrer" inverted={isLightTheme}>
          github
        </ToolbarLink>
      </div>
    </header>
  );
}
