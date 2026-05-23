# DaPortfolio v4.0 - Project Overview & PDR

**Project Name:** DaPortfolio v4.0
**Version:** 0.1.0
**Status:** Beta / Release Candidate
**Last Updated:** 2026-02-17

## Project Overview

DaPortfolio v4.0 is a modern, high-performance personal portfolio website featuring cutting-edge GPU-accelerated visual effects. It serves as both a professional portfolio showcase and technical demonstration of advanced web technologies including real-time 3D graphics, fluid simulation, and particle systems.

### Target Audience

- **Recruiters/Hiring Managers**: Quickly scan projects, skills, and contact information
- **Tech Enthusiasts**: Appreciate advanced WebGL implementation and shader programming
- **Developers**: Reference for Next.js + Three.js + GSAP integration patterns
- **Accessibility Users**: Full keyboard navigation and screen reader support

## Goals & Objectives

### Primary Goals
1. **Professional Showcase** - Present portfolio projects and technical skills effectively
2. **Technical Demonstration** - Showcase advanced GPU-accelerated graphics capabilities
3. **Performance Excellence** - Maintain 60 FPS animations across device tiers
4. **Accessibility Compliance** - Meet WCAG 2.1 AA standards for inclusive access

### Business Objectives
- Increase recruiter engagement through memorable visual experience
- Demonstrate full-stack web development capabilities
- Build personal brand as technical architect
- Generate inbound opportunities from impressed visitors

## Key Features & Requirements

### Functional Requirements

| Feature | Description | Priority |
|---------|-------------|----------|
| Hero Section | Animated introduction with name, role, status | Critical |
| About Section | Biography, education, skills, certificates | Critical |
| Projects | Portfolio grid + SAP-style list/detail view | Critical |
| Certificates | SAP-style certificates page with detail view | High |
| Contact | Contact channels with email, phone, key social links, and Linktree | Critical |
| Footer | Author name display | High |
| Water Effects | GPU-based fluid simulation with ripples | High |
| Particle Systems | Ambient floating + rain particles | High |
| Caustics | Underwater light pattern shader | Medium |
| Animations | GSAP scroll-triggered section transitions | High |
| Responsive Design | Mobile, tablet, desktop layouts | Critical |
| Accessibility | WCAG 2.1 AA, keyboard nav, screen readers | Critical |

### Non-Functional Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **Performance** | 60 FPS on mobile | Smooth visual experience |
| **Load Time** | < 3s first paint | User retention |
| **Accessibility** | WCAG 2.1 AA | Inclusive design |
| **Browser Support** | Chrome 120+, Safari 16+, Firefox 122+ | Modern stack |
| **TypeScript** | Strict mode | Type safety |
| **Test Coverage** | 70%+ | Code reliability |
| **Bundle Size** | < 500KB gzipped | Fast downloads |

## Success Metrics

### Technical Metrics
- **60 FPS** on devices with RTX 3060+, 45-50 FPS on mid-range
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 3s
- **Zero accessibility violations** (axe-core audit)
- **Keyboard navigation** works for all interactive elements

### Business Metrics
- **Recruiter reach**: Monitor via analytics
- **Social shares**: Track portfolio project links
- **Contact form submissions**: Inbound opportunities
- **Page stay time**: Average 2+ minutes per session

## Technical Architecture

### Tech Stack Rationale

**Next.js 16 + React 19**
- App Router for modern routing patterns
- Server components for optimization
- Built-in image/font optimization

**Three.js + React Three Fiber**
- GPU acceleration for visual effects
- Reusable R3F components via Drei
- Performance monitoring and LOD systems

**GSAP ScrollTrigger**
- Choreographed scroll animations
- Reduced motion support built-in
- Smooth timeline management

**Tailwind CSS v4**
- Semantic color system integration
- Responsive utilities
- Custom theme extension

**TypeScript Strict Mode**
- Full type safety across codebase
- Better IDE intellisense
- Reduced runtime errors

## Content Structure

### Portfolio Data (portfolio.ts)
Single-source TypeScript file containing:
- Navigation labels
- Hero content (greeting, role, status, CV URL)
- About section (bio, location, education, skills, certificates)
- Projects (10 portfolio items with metadata)
- Certificates (portfolio items with metadata)
- Contact information (email, phone, key social platforms, and Linktree)

### Design System (Silver Mist)

**Color Palette**
```
Background:  #f1f5f9 (Slate 100)
Primary:     #0f172a (Slate 900)
Body:        #1e293b (Slate 800)
Secondary:   #64748b (Slate 500)
Surface:     rgba(241, 245, 249, 0.7)
Highlight:   #ffffff
```

**Typography**
- Headings: Luxurious Roman (serif, 400 weight)
- Display: Style Script (cursive)
- Mono: Geist Mono (for code)

## Component Hierarchy

```
Layout Root
├── Navbar (Desktop vertical, Mobile horizontal)
├── Main Content
│   ├── Hero + Story Carousel
│   ├── About Section
│   │   ├── Bio
│   │   ├── Skills Grid
│   │   └── Certificates
│   ├── Projects Section
│   │   └── Project Cards
│   ├── Contact Section
│   │   └── Contact Links (Email, Phone, GitHub, LinkedIn, Facebook, X, Telegram, Discord, Linktree)
│   └── Footer
├── ProjectsPage (/projects)
│   ├── ProjectListPanel
│   └── ProjectDetailPanel
└── CertificatesPage (/certificates) [NEW]
    ├── CertificateListPanel
    └── CertificateDetailPanel
```

## Data Flow

```
Content Source: portfolio.ts (TypeScript)
  ↓
Components consume via imports
  ↓
GSAP monitors scroll position
  ↓
Animations trigger on intersection
  ↓
WebGL renders effects
```

## Constraints & Dependencies

### Technical Constraints
- WebGL 2.0 required for texture formats
- GPU VRAM: 256MB minimum for shader textures
- JavaScript ES2020 target minimum

### External Dependencies
- **Google Fonts**: Luxurious Roman, Style Script (CDN)
- **axe-core**: Accessibility testing
- **GitHub**: Social link integration

### Browser Limitations
- Older browsers (IE11): Graceful fallback to static layout
- Low-end devices: Automatic effect reduction via `usePerformanceMonitor`

## Phases & Milestones

### Phase 1: Foundation (Complete)
- Next.js setup with App Router
- Tailwind CSS v4 integration
- TypeScript configuration

### Phase 2: Core Components (Complete)
- Layout system (Navbar, Sections, Footer)
- Content structure (portfolio.ts)
- Responsive grid layouts
- SAP-style Projects page with Flexible Column Layout

### Phase 3: Visual Effects (Complete)
- Water simulation shader
- Rain particle system
- Ambient particles
- Caustics effect

### Phase 4: Animations (Complete)
- GSAP scroll integration
- Section transitions
- Micro-interactions
- Hero story animations

### Phase 5: Accessibility (Complete)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Reduced motion support

### Phase 6: Optimization (In Progress)
- Bundle analysis
- Image optimization
- Shader compilation caching
- Performance monitoring

### Phase 7: Deployment (Planned)
- Vercel hosting setup
- Analytics integration
- CI/CD pipeline

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| GPU effects unsupported on old browsers | High | Medium | Graceful degradation, feature detection |
| Performance issues on mobile | High | Medium | Performance monitor, effect reduction |
| Accessibility compliance gaps | Medium | Low | axe-core testing, manual review |
| Shader compilation failures | Medium | Low | Error boundaries, fallback shaders |
| Content becomes outdated | Low | Medium | Easy updates via portfolio.ts |

## Future Enhancements

- Dark mode toggle with theme persistence
- Multi-language support (i18n)
- Blog/articles section
- Case studies for featured projects
- Live chat widget integration
- Newsletter signup
- Performance metrics dashboard
- A/B testing framework

## Success Definition

The project succeeds when:
1. All pages load in < 3 seconds
2. 60 FPS maintained on RTX 3060+ devices
3. WCAG 2.1 AA compliance verified via axe-core
4. All interactive elements keyboard-accessible
5. Visual effects work on 90%+ of target browsers
6. Positive recruiter feedback on visual design
7. Contact form receives quality inbound leads
