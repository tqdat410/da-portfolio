# Design Guidelines

## Direction

Da'portfolio uses a high-contrast black-and-off-white editorial style with restrained animated effects. Preserve its direct, personal tone; avoid generic dashboard styling, decorative component libraries, and unnecessary UI chrome.

## Authority

- Color, typography, animation, and layout tokens: `src/app/globals.css`.
- Root fonts and metadata: `src/app/layout.tsx`.
- Responsive navigation: `src/components/layout/`.
- OGL effects: `src/components/animations/` and `src/components/Particles.jsx`.

Do not duplicate token values in documentation. Change the CSS owner and visually verify every affected route.

## Interaction constraints

- Keep navigation usable by keyboard and touch.
- Provide visible focus states and descriptive accessible names.
- Respect `prefers-reduced-motion` for content animation.
- Keep mobile effects lighter than desktop effects.
- Use semantic HTML before adding ARIA.
- Optimize remote images through `next/image` when layout dimensions are known.

## Content constraints

- Prefer concise copy and strong hierarchy over extra cards or sections.
- Keep project detail in Markdown Explorer pages instead of duplicating it on the homepage.
- Treat Finder/Explorer visual language as an intentional alternate navigation experience, not a general-purpose design system.

## Review

For UI changes, verify the homepage, Finder, project Explorer, and certificate Explorer at mobile and desktop widths. Run `npm run check` before committing.
