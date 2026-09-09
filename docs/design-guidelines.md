# Design Guidelines

## Direction

Da'portfolio uses a high-contrast black-and-off-white editorial style with restrained animated effects. Preserve its direct, personal tone; avoid generic dashboard styling, decorative component libraries, and unnecessary UI chrome.

## Authority

- Color, typography, animation, and layout tokens: `src/app/globals.css`.
- Root fonts and metadata: `src/app/layout.tsx`.
- Responsive navigation: `src/components/layout/`.
- Hero renderer and responsive lifecycle: `src/components/animations/HeroVisual.tsx`, `src/components/animations/hero-visual-renderer.ts`, and `src/components/animations/hero-text-mask.ts`.
- OGL Contact effect: `src/components/Particles.jsx`.

Do not duplicate token values in documentation. Change the CSS owner and visually verify every affected route.

## Interaction constraints

- Keep navigation usable by keyboard and touch.
- Provide visible focus states and descriptive accessible names.
- Respect `prefers-reduced-motion` for content animation.
- Keep mobile effects lighter than desktop effects.
- Keep Hero metaballs and text inversion in one render pass; do not reintroduce cross-layer CSS blending.
- Keep the semantic Hero readable until a current, measured frame is ready, and restore it when graphics capabilities, accessibility preferences, or runtime failures require the static fallback.
- Pause Hero rendering while it or the document is not visible, and rebuild from current measurements after responsive geometry changes.
- Use semantic HTML before adding ARIA.
- Optimize remote images through `next/image` when layout dimensions are known.

## Content constraints

- Prefer concise copy and strong hierarchy over extra cards or sections.
- Keep project detail in dedicated Markdown-backed case-study pages instead of duplicating it on the homepage.
- Keep project indexes flat and certificate groups readable without simulated desktop chrome, double-click behavior, or hover-only controls.
- Keep project indexes and case studies typography-first; project imagery is intentionally excluded.

## Review

For UI changes, verify the homepage, project index and details, and certificate index at mobile and desktop widths. Include physical iPhone Safari when responsive behavior changes. Run `npm run check` before committing.
