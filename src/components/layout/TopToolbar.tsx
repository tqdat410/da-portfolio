"use client";

import { content } from "@/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { ReactNode, useState, useEffect } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isMobile]);

  const showSolidBackground = activeSection === "about" || activeSection === "projects";
  const isLightTheme = showSolidBackground;

  const headerClass = isMobile
    ? `justify-center ${
        isMenuOpen
          ? "bg-transparent border-none"
          : showSolidBackground
            ? "bg-[var(--brand-fg)]/90 backdrop-blur-md border-b border-[var(--brand-bg)]/10"
            : "bg-[var(--brand-bg)]/90 backdrop-blur-md border-b border-[var(--brand-fg)]/10"
      } pointer-events-auto transition-all duration-300`
    : `justify-between ${
        showSolidBackground
          ? "bg-[var(--brand-fg)]"
          : "bg-transparent"
      } pointer-events-auto`;

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const buttonColor = isMenuOpen
    ? "bg-[var(--brand-fg)]"
    : isLightTheme
      ? "bg-[var(--brand-bg)]"
      : "bg-[var(--brand-fg)]";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[70] flex w-full max-w-full items-center overflow-x-clip px-4 py-3 transition-all duration-300 md:px-8 md:py-4 ${headerClass}`}
      >
        {/* Email - hidden on mobile */}
        <div className="hidden md:block pointer-events-auto animate-fade-in-down" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <a
            href="/tqdat410"
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative font-luxurious-roman text-lg tracking-wide ${
              isLightTheme ? "text-[var(--brand-bg)]" : "text-[var(--brand-fg)]"
            }`}
          >
            {content.contact.email.toLowerCase()}
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                isLightTheme ? "bg-[var(--brand-bg)]" : "bg-[var(--brand-fg)]"
              }`}
            />
          </a>
        </div>

        {/* Desktop menu links - hidden on mobile */}
        <div className="hidden md:flex min-w-0 flex-wrap justify-end gap-4 pointer-events-auto animate-fade-in-down md:ml-auto" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
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

        {/* Hamburger Menu Toggle (Mobile) - Centered */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-[80] flex h-10 w-10 flex-col items-center justify-center focus:outline-none md:hidden pointer-events-auto"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative h-5 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 transition-all duration-300 ${buttonColor} ${
                isMenuOpen ? "top-[9px] rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[9px] h-0.5 w-6 transition-all duration-300 ${buttonColor} ${
                isMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 transition-all duration-300 ${buttonColor} ${
                isMenuOpen ? "top-[9px] -rotate-45" : "top-[18px]"
              }`}
            />
          </div>
        </button>
      </header>

      {/* Mobile Navigation Dropbar - Slides Down from Top */}
      <div
        className={`fixed inset-x-0 top-0 z-[60] flex flex-col justify-between bg-black/95 px-6 pt-28 pb-12 text-[#fafafa] backdrop-blur-xl h-[100dvh] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Menu Items */}
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <a
            href="#home"
            onClick={(e) => handleScroll(e, "#home")}
            className="font-luxurious-roman text-2xl tracking-widest transition-colors hover:text-[#79c0ff]"
          >
            home
          </a>
          <a
            href="#about"
            onClick={(e) => handleScroll(e, "#about")}
            className="font-luxurious-roman text-2xl tracking-widest transition-colors hover:text-[#79c0ff]"
          >
            about me
          </a>
          <a
            href="#contact"
            onClick={(e) => handleScroll(e, "#contact")}
            className="font-luxurious-roman text-2xl tracking-widest transition-colors hover:text-[#79c0ff]"
          >
            get in touch
          </a>
          <a
            href="/tqdat410/projects?folder=root%3Aprojects&view=preview"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="font-luxurious-roman text-2xl tracking-widest transition-colors hover:text-[#79c0ff]"
          >
            projects
          </a>
          <a
            href={content.social.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="font-luxurious-roman text-2xl tracking-widest transition-colors hover:text-[#79c0ff]"
          >
            github
          </a>

          {/* CV Section */}
          <div className="pt-6 flex flex-col items-center space-y-2">
            <span className="font-luxurious-roman text-xs tracking-widest uppercase text-slate-500">
              download cv
            </span>
            <div className="flex items-center gap-3 font-luxurious-roman text-base uppercase tracking-widest text-[#fafafa]">
              <a
                href={content.hero.resumeUrls.visual}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="transition-opacity duration-200 hover:opacity-60"
              >
                Visual
              </a>
              <span className="h-8 w-[1px] bg-slate-600 block shrink-0 -translate-y-[5px]" />
              <a
                href={content.hero.resumeUrls.ats}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="transition-opacity duration-200 hover:opacity-60"
              >
                ATS.
              </a>
            </div>
          </div>
        </div>

        {/* Footer Email */}
        <div className="text-center font-luxurious-roman text-sm tracking-wide text-slate-500">
          <a href={`mailto:${content.contact.email}`} className="hover:underline">
            {content.contact.email.toLowerCase()}
          </a>
        </div>
      </div>
    </>
  );
}
