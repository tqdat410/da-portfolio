"use client";

import { content } from "@/content";
import Particles from "@/components/Particles";
import { useIsMobile } from "@/hooks/useMediaQuery";
import Image from "next/image";

export function Contact() {
  const contactInfo = content.contact;
  const social = content.social;
  const isMobile = useIsMobile();

  // Build contact links array - mobile shows essential links only
  const allContactLinks = [
    { label: "Gmail", value: contactInfo.email, href: `mailto:${contactInfo.email}`, mobile: true },
    { label: "Phone", value: contactInfo.phone, href: `tel:${contactInfo.phone}`, mobile: true },
    { label: "GitHub", value: "tqdat410", href: social.github, mobile: true },
    { label: "LinkedIn", value: "tqdat410", href: social.linkedin, mobile: true },
    { label: "Facebook", value: "tqdat410", href: social.facebook, mobile: false },
    { label: "X", value: "@trandat40", href: social.x, mobile: false },
    { label: "Telegram", value: "@tqdat410", href: social.telegram, mobile: false },
    { label: "Discord", value: "tqdat410", href: social.discord, mobile: false },
    { label: "Linktree", value: "tqdat410", href: contactInfo.linktree, mobile: true },
  ].filter((link) => link.href && link.href.length > 0);

  const contactLinks = isMobile ? allContactLinks.filter((link) => link.mobile) : allContactLinks;

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full overflow-hidden bg-[#0c0c0c] text-[#fafafa]"
    >
      <div className="absolute inset-0 z-0">
        <Particles
          className="h-full w-full"
          particleColors={["#fafafa"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] items-center px-4 py-20 md:px-10 lg:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(240px,360px)_1fr] lg:gap-16">
          <div className="w-full max-w-sm justify-self-center lg:justify-self-start">
            <Image
              src="https://res.cloudinary.com/do6szo7zy/image/upload/f_auto,q_auto/v1771402777/profile_jsxaod.png"
              alt="Profile"
              width={600}
              height={600}
              sizes="(max-width: 1023px) 100vw, 360px"
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="w-full text-right">
            <h2 className="font-luxurious-roman text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
              {contactInfo.title}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group relative block overflow-hidden px-3 py-2 focus-visible:outline-2 focus-visible:outline-[#fafafa] focus-visible:outline-offset-2"
                >
                  <span className="absolute inset-0 origin-bottom-right scale-x-0 scale-y-0 bg-[#fafafa] transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:scale-y-100" />
                  <span className="relative z-10 block whitespace-nowrap text-sm font-medium text-[#fafafa] transition-colors duration-300 group-hover:text-[#0c0c0c] md:text-base">
                    {link.label} : {link.value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
