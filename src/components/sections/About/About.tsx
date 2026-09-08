"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Section } from "@/components/layout/Section";
import { content } from "@/content";
import TextType from "@/components/animations/TextType";
import { AboutGitHubContributionCalendar } from "./AboutGitHubContributionCalendar";

interface IntroSegment {
  type: "text" | "highlight";
  value: string;
}

const introSegments: IntroSegment[] = [
  { type: "text", value: "I'm " },
  { type: "highlight", value: "Tran Quoc Dat" },
  { type: "text", value: ", a Software Engineering graduate from " },
  { type: "highlight", value: "FPT University" },
  { type: "text", value: ", based in " },
  { type: "highlight", value: "Ho Chi Minh City" },
  {
    type: "text",
    value: ". I build practical web, mobile, and enterprise products, with hands-on ",
  },
  { type: "highlight", value: "SAP" },
  {
    type: "text",
    value: " experience across ABAP, RAP, Fiori, and UI5. I use ",
  },
  { type: "highlight", value: "AI Tools" },
  {
    type: "text",
    value: " to move faster while keeping the work clean and reliable. I currently work as a ",
  },
  { type: "highlight", value: "Software Engineer" },
  {
    type: "text",
    value: ", focused on turning ideas into useful products people can actually use.",
  },
];

const TERMINAL_AUTO_SCROLL_DURATION_MS = 220;
const TERMINAL_AUTO_SCROLL_LOCK_THRESHOLD_PX = 24;

function getTerminalScrollTarget(element: HTMLDivElement): number {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export function About() {
  const [introRef, isIntroInView] = useInView<HTMLParagraphElement>({ threshold: 0.2 });
  const [terminalRef, isTerminalInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();
  const skillCategories = content.about.skills.categories;
  const totalCourseraCertificates = content.about.certificates.items
    .filter((group) => group.name.toLowerCase() === "coursera")
    .reduce((total, group) => total + (group.count ?? group.items.length), 0);
  const prompt = "tqdat410@portfolio ~ %";
  const certificatesExplorerPath = "/tqdat410/certificates?file=certificates.md&view=preview";
  const [siteOrigin] = useState(() =>
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://tranquocdat.com"
  );
  const isTestEnv = process.env.NODE_ENV === "test";

  const [showInstallOutput, setShowInstallOutput] = useState(isTestEnv);
  const [showVersionCommand, setShowVersionCommand] = useState(isTestEnv);
  const [showVersionOutput, setShowVersionOutput] = useState(isTestEnv);
  const [showInfoCommand, setShowInfoCommand] = useState(isTestEnv);
  const [showInfoOutput, setShowInfoOutput] = useState(isTestEnv);
  const [showIntro, setShowIntro] = useState(isTestEnv);
  const [showTerminal, setShowTerminal] = useState(isTestEnv);
  const [installTypingDone, setInstallTypingDone] = useState(isTestEnv);
  const [versionTypingDone, setVersionTypingDone] = useState(isTestEnv);
  const [infoTypingDone, setInfoTypingDone] = useState(isTestEnv);

  const typedRef = useRef({
    install: isTestEnv,
    version: isTestEnv,
    info: isTestEnv,
  });
  const timersRef = useRef<number[]>([]);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const terminalAutoScrollFrameRef = useRef<number | null>(null);
  const shouldAutoFollowTerminalRef = useRef(true);
  const lastAutoScrollPositionRef = useRef<number | null>(null);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (terminalAutoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(terminalAutoScrollFrameRef.current);
      }
    };
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push(id);
  };

  useEffect(() => {
    if (isTestEnv || showIntro || !isIntroInView) return;
    schedule(() => setShowIntro(true), 180);
  }, [isIntroInView, isTestEnv, showIntro]);

  useEffect(() => {
    if (isTestEnv || showTerminal || !isTerminalInView) return;
    schedule(() => setShowTerminal(true), 220);
  }, [isTerminalInView, isTestEnv, showTerminal]);

  useEffect(() => {
    const terminalBody = terminalBodyRef.current;
    const terminalContent = terminalContentRef.current;
    if (!showTerminal || !terminalBody || !terminalContent) return;

    shouldAutoFollowTerminalRef.current = true;
    let animationStartTime: number | null = null;

    const clearAnimationFrame = () => {
      if (terminalAutoScrollFrameRef.current === null) return;
      window.cancelAnimationFrame(terminalAutoScrollFrameRef.current);
      terminalAutoScrollFrameRef.current = null;
      animationStartTime = null;
    };

    const setTerminalScrollTop = (nextScrollTop: number) => {
      lastAutoScrollPositionRef.current = nextScrollTop;
      terminalBody.scrollTop = nextScrollTop;
    };

    const syncTerminalToTarget = (targetScrollTop: number) => {
      clearAnimationFrame();
      setTerminalScrollTop(targetScrollTop);
    };

    const animateTerminalToTarget = (targetScrollTop: number) => {
      if (Math.abs(targetScrollTop - terminalBody.scrollTop) < 1) {
        syncTerminalToTarget(targetScrollTop);
        return;
      }

      clearAnimationFrame();
      const startScrollTop = terminalBody.scrollTop;

      const step = (timestamp: number) => {
        if (animationStartTime === null) {
          animationStartTime = timestamp;
        }

        const progress = Math.min(
          1,
          (timestamp - animationStartTime) / TERMINAL_AUTO_SCROLL_DURATION_MS
        );
        const easedProgress = easeOutCubic(progress);
        const nextScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

        setTerminalScrollTop(nextScrollTop);

        if (progress < 1) {
          terminalAutoScrollFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        setTerminalScrollTop(targetScrollTop);
        terminalAutoScrollFrameRef.current = null;
        animationStartTime = null;
      };

      terminalAutoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    const followTerminalOutput = (force = false) => {
      const targetScrollTop = getTerminalScrollTarget(terminalBody);
      if (targetScrollTop <= 0) {
        syncTerminalToTarget(0);
        return;
      }

      if (!force && !shouldAutoFollowTerminalRef.current) return;

      if (prefersReducedMotion) {
        syncTerminalToTarget(targetScrollTop);
        return;
      }

      animateTerminalToTarget(targetScrollTop);
    };

    const handleManualScroll = () => {
      if (
        lastAutoScrollPositionRef.current !== null &&
        Math.abs(terminalBody.scrollTop - lastAutoScrollPositionRef.current) <= 1
      ) {
        return;
      }

      const distanceFromBottom = getTerminalScrollTarget(terminalBody) - terminalBody.scrollTop;
      shouldAutoFollowTerminalRef.current =
        distanceFromBottom <= TERMINAL_AUTO_SCROLL_LOCK_THRESHOLD_PX;
    };

    const resizeObserver = new ResizeObserver(() => {
      followTerminalOutput();
    });

    terminalBody.addEventListener("scroll", handleManualScroll, { passive: true });
    resizeObserver.observe(terminalContent);
    followTerminalOutput(true);

    return () => {
      terminalBody.removeEventListener("scroll", handleManualScroll);
      resizeObserver.disconnect();
      clearAnimationFrame();
      lastAutoScrollPositionRef.current = null;
    };
  }, [prefersReducedMotion, showTerminal]);

  return (
    <Section
      id="about"
      className="bg-[var(--brand-fg)] text-[var(--brand-bg)] !items-start !pt-24 font-sans"
    >
      <div className="w-full max-w-5xl mx-auto px-6 md:px-10">
        <p
          ref={introRef}
          className={`max-w-4xl text-justify leading-8 md:leading-9 text-base md:text-lg text-[var(--brand-bg)] ${
            showIntro ? "opacity-100" : "opacity-0"
          }`}
        >
          {introSegments.map((segment, index) => {
            if (segment.type === "text") {
              return <span key={`text-${index}`}>{segment.value}</span>;
            }

            const delay =
              introSegments.slice(0, index + 1).filter((item) => item.type === "highlight").length -
              1;
            const transitionDelay = delay * 110;

            return (
              <span key={`highlight-${segment.value}-${index}`} className="inline-block px-1">
                <span
                  className={`group relative inline-block overflow-hidden px-1.5 py-0.5 align-middle transition-colors duration-1000 ${
                    showIntro ? "text-[var(--brand-fg)]" : "text-[var(--brand-bg)]"
                  }`}
                  style={{ transitionDelay: `${transitionDelay}ms` }}
                >
                  <span
                    className={`absolute inset-0 origin-bottom transform bg-[var(--brand-bg)] transition-transform duration-1000 ${
                      showIntro ? "scale-y-100" : "scale-y-0"
                    }`}
                    style={{ transitionDelay: `${transitionDelay}ms` }}
                  />
                  <span className="relative z-10">{segment.value}</span>
                </span>
              </span>
            );
          })}
        </p>

        <div
          ref={terminalRef}
          className={`mt-12 md:mt-16 rounded-xl border border-[#2b3440] bg-[#0d1117] ${
            showTerminal ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between rounded-t-xl border-b border-[#2b3440] bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="text-xs md:text-sm text-[var(--brand-fg)] font-medium flex items-center gap-2">
              <span aria-hidden="true" className="inline-flex h-4 w-5">
                <svg viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.5 4.2C1.5 2.98 2.48 2 3.7 2H7.3L8.4 3.4H16.3C17.52 3.4 18.5 4.38 18.5 5.6V12.3C18.5 13.52 17.52 14.5 16.3 14.5H3.7C2.48 14.5 1.5 13.52 1.5 12.3V4.2Z"
                    fill="#57A7FF"
                  />
                  <path
                    d="M1.5 6.2H18.5V12.3C18.5 13.52 17.52 14.5 16.3 14.5H3.7C2.48 14.5 1.5 13.52 1.5 12.3V6.2Z"
                    fill="#2E87F7"
                  />
                </svg>
              </span>
              <span data-testid="about-terminal-title">
                tqdat410
                <span className="hidden md:inline"> — -zsh — 80x24</span>
              </span>
            </p>
            <span className="w-14" aria-hidden="true" />
          </div>

          <div
            ref={terminalBodyRef}
            data-testid="about-terminal-body"
            className="no-scrollbar h-[560px] overflow-auto rounded-b-xl bg-[#0d1117] px-4 py-5 font-sans text-[var(--brand-fg)] md:px-6 md:py-6"
          >
            <div
              ref={terminalContentRef}
              data-testid="about-terminal-content"
              className="text-sm md:text-[15px] leading-7 space-y-5"
            >
              {showTerminal && (
                <>
                  <p className="text-[#9aa3ad]">Last login: Sat May 23 11:02:40 on ttys000</p>

                  <div>
                    <p>
                      <span className="text-[#58a6ff]">{prompt}</span>{" "}
                      {isTestEnv ? (
                        <span className="text-[#7ee787]">npm install -g da-portfolio@latest</span>
                      ) : (
                        <TextType
                          as="span"
                          text="npm install -g da-portfolio@latest"
                          className="text-[#7ee787]"
                          typingSpeed={80}
                          pauseDuration={1500}
                          deletingSpeed={50}
                          loop={false}
                          showCursor={!installTypingDone}
                          cursorCharacter="|"
                          startOnVisible={showTerminal}
                          onSentenceComplete={() => {
                            if (typedRef.current.install) return;
                            typedRef.current.install = true;
                            setInstallTypingDone(true);
                            schedule(() => setShowInstallOutput(true), 250);
                            schedule(() => setShowVersionCommand(true), 600);
                          }}
                        />
                      )}
                    </p>
                    {showInstallOutput && (
                      <div className="text-[var(--brand-fg)]">
                        added 1 package, and audited 1 package in 88ms
                        <br />
                        <br />
                        found 0 vulnerabilities
                      </div>
                    )}
                  </div>

                  {showVersionCommand && (
                    <div>
                      <p>
                        <span className="text-[#58a6ff]">{prompt}</span>{" "}
                        {isTestEnv ? (
                          <span className="text-[#7ee787]">dp --version</span>
                        ) : (
                          <TextType
                            as="span"
                            text="dp --version"
                            className="text-[#7ee787]"
                            typingSpeed={80}
                            pauseDuration={1500}
                            deletingSpeed={50}
                            loop={false}
                            showCursor={!versionTypingDone}
                            cursorCharacter="|"
                            startOnVisible={showVersionCommand}
                            onSentenceComplete={() => {
                              if (typedRef.current.version) return;
                              typedRef.current.version = true;
                              setVersionTypingDone(true);
                              schedule(() => setShowVersionOutput(true), 250);
                              schedule(() => setShowInfoCommand(true), 600);
                            }}
                          />
                        )}
                      </p>
                      {showVersionOutput && <p className="mt-2 text-[var(--brand-fg)]">v0.4.2</p>}
                    </div>
                  )}

                  {showInfoCommand && (
                    <div>
                      <p>
                        <span className="text-[#58a6ff]">{prompt}</span>{" "}
                        {isTestEnv ? (
                          <span className="text-[#7ee787]">dp --info</span>
                        ) : (
                          <TextType
                            as="span"
                            text="dp --info"
                            className="text-[#7ee787]"
                            typingSpeed={80}
                            pauseDuration={1500}
                            deletingSpeed={50}
                            loop={false}
                            showCursor={!infoTypingDone}
                            cursorCharacter="|"
                            startOnVisible={showInfoCommand}
                            onSentenceComplete={() => {
                              if (typedRef.current.info) return;
                              typedRef.current.info = true;
                              setInfoTypingDone(true);
                              schedule(() => setShowInfoOutput(true), 250);
                            }}
                          />
                        )}
                      </p>
                      {showInfoOutput && (
                        <div className="mt-3 space-y-2 text-[var(--brand-fg)]">
                          <p className="text-[#79c0ff]">[ PROFILE ]</p>
                          <p>• Name: {content.about.name}</p>
                          <p>• Location: {content.about.basicInfo.location}</p>
                          {content.about.education.items.map((item, index) => (
                            <div key={index} className="pt-1">
                              <p className="text-[#79c0ff]">[ EDUCATION ]</p>
                              <p>• {item.school}</p>
                              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.degree}</p>
                              <p>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.year} |{" "}
                                <span className="rounded px-1.5 py-0.5 font-semibold text-[#79c0ff]">
                                  {item.gpa}
                                </span>
                              </p>
                            </div>
                          ))}
                          <div className="pt-1">
                            <p className="text-[#79c0ff]">[ SKILLS & TOOLS ]</p>
                            {skillCategories.map((category) => (
                              <p
                                key={category.title}
                                className={category.title === "Others" ? "text-[#9aa3ad]" : ""}
                              >
                                <span className="whitespace-nowrap">• {category.title}:</span>{" "}
                                <span className="inline">
                                  {category.items.join(", ")}
                                  {category.title === "Others" ? ", ..." : ""}
                                </span>
                              </p>
                            ))}
                          </div>
                          <div className="pt-1">
                            <p className="text-[#79c0ff]">[ CERTIFICATES ]</p>
                            <p>• Certificate on the Job Training</p>
                            <p>• FSOFT Short Course for Testing</p>
                            <p>• {totalCourseraCertificates}+ Coursera Certificates</p>
                            <p>
                              See more:{" "}
                              <Link
                                href={`${siteOrigin}${certificatesExplorerPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--brand-fg)] underline underline-offset-2"
                              >
                                {siteOrigin}
                                {certificatesExplorerPath}
                              </Link>
                            </p>
                          </div>
                          {content.about.experience.items.map((item, index) => (
                            <div key={`${item.company}-${index}`} className="pt-1">
                              <p className="text-[#79c0ff]">[ EXPERIENCE ]</p>
                              <p>• {item.company}</p>
                              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.role}</p>
                              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.period}</p>
                            </div>
                          ))}
                          <p className="pt-2 text-[#7ee787]">[ok] completed</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <AboutGitHubContributionCalendar />
      </div>
    </Section>
  );
}
