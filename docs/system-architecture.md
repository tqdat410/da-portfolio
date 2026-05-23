# System Architecture

**Project:** DaPortfolio v4.0
**Last Updated:** 2026-03-14

## Overview

DaPortfolio v4.0 uses a modern full-stack architecture combining Next.js for SSR/SSG, React for UI components, Three.js for 3D rendering, and GPU-accelerated shaders for visual effects. The system is organized into distinct layers: presentation, component logic, data, and GPU compute.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│          Browser / Next.js               │ Presentation Layer
├─────────────────────────────────────────┤
│   React Components (TSX)                │ Component Layer
│   ├── Layout (Navbar, Section, Footer)  │
│   ├── Sections (About, Projects, Contact)│
│   ├── ProjectsPage (List, Detail, Client)│
│   ├── Story (Hero, Carousel)            │
│   └── Effects (Water, Rain, etc.)       │
├─────────────────────────────────────────┤
│   Custom Hooks (Business Logic)         │ Logic Layer
│   ├── useFluidSimulation                │
│   ├── useScrollStory                    │
│   ├── usePerformanceMonitor             │
│   └── useActiveSection                  │
├─────────────────────────────────────────┤
│   Content & Data                        │ Data Layer
│   ├── portfolio.ts (TypeScript)         │
│   └── GitHub yearly contribution calendar │
├─────────────────────────────────────────┤
│   GPU Shaders (GLSL)                    │ GPU Compute Layer
│   ├── Fluid Simulation                  │
│   ├── Water Rendering                   │
│   ├── Particle Systems                  │
│   └── Caustics Effect                   │
├─────────────────────────────────────────┤
│   WebGL / Three.js / React Three Fiber  │ Rendering Engine
└─────────────────────────────────────────┘
```

## Component Hierarchy

### Page Structure

```
RootLayout (src/app/layout.tsx)
  └── Providers (Next.js, GSAP)
      └── Navbar (Fixed/Sticky)
      └── MainContent
          ├── HeroStory
          │   ├── RoleCarousel
          │   └── StorySection
          ├── About
          │   ├── TerminalShell
          │   └── AboutGitHubContributionCalendar
          ├── Projects (Landing Grid)
          │   ├── ProjectCard[] (10 items)
          │   └── ProjectModal (Quick view)
          ├── Contact
          │   ├── AnimatedWaterCanvas
          │   └── SocialLinks (6 platforms) plus email, phone, and Linktree in Contact
          └── Footer
      ├── ProjectsPage (/projects)
      │   ├── ProjectListPanel
      │   └── ProjectDetailPanel
      ├── CertificatesPage (/certificates) [NEW]
      │   ├── CertificateListPanel
      │   └── CertificateDetailPanel
      └── BackgroundEffects
          ├── WaterCanvas
          ├── RainParticles
          ├── AmbientParticles
          └── Caustics
      └── PerformanceMonitor (dev-only)
```

### Component Relationships

```
Data Flow:
portfolio.ts ─────────────────┐
                              ├─→ About, Projects, Contact (components)
                              │
                              ├─→ AboutGitHubContributionCalendar (About terminal + internal API route)
                              │
                              ├─→ Navbar (nav labels)
                              │
                              └─→ HeroStory (hero content)

Animation Flow:
useScrollProgress ─→ useScrollStory ─→ GSAP Timeline ─→ Effects
                                                         ├─→ WaterCanvas
                                                         ├─→ RainParticles
                                                         └─→ AmbientParticles

Performance Flow:
usePerformanceMonitor ─→ FPS Check ─→ Effect Reduction ─→ useReducedMotion
```

## Data Flow

### Content Management

```
┌────────────────────────────────────────────┐
│ src/content/portfolio.ts (Single Source)   │
│ - NavLabels                                │
│ - Hero: { greeting, role, status, cvUrl } │
│ - About: { bio, location, education... }  │
│ - Projects: [{ title, desc, link... }]    │
│ - Contact: { email, phone, socials[] }    │
└─────────────┬────────────────────────────┘
              │
              ├─→ Components (import)
              │   ├── <Navbar /> uses NavLabels
              │   ├── <HeroStory /> uses Hero
              │   ├── <About /> uses About
              │   ├── <Projects /> uses Projects[]
              │   └── <Contact /> uses Contact
              │
              └─→ TypeScript Type Definitions
                  ├── HeroContent
                  ├── AboutContent
                  ├── ProjectItem
                  └── ContactContent
```

**Principles:**
- Centralized data in `portfolio.ts`
- Components consume via ES6 imports
- Types defined in `src/types/content.ts`
- No runtime data fetching for portfolio content
- Changes to portfolio propagate instantly

### GitHub Activity Data

```
content.social.github
  └─→ /api/github-contribution-calendar?year=YYYY
      └─→ extractGitHubUsername()
          └─→ server-side fetch("https://api.github.com/graphql")
              ├─→ Authorization: Bearer GITHUB_GRAPHQL_TOKEN | GITHUB_TOKEN
              ├─→ contributionCalendar
              └─→ normalized yearly snapshot model
                  ├─→ total contributions
                  ├─→ month labels
                  └─→ GitHub-style heatmap grid
```

**Rules:**
- GitHub token stays server-side only
- Missing/invalid token or invalid GitHub profile URL returns fallback UI instead of breaking the About section
- Activity data is fetched through an internal API route and cached with timed revalidation

## Effect Pipeline

### GPU-Accelerated Effects

```
┌─────────────────────────────────────┐
│    THREE.WebGLRenderer               │
│  (Manages GPU context, buffers)     │
└────────────┬────────────────────────┘
             │
             ├─→ WaterCanvas
             │   ├── useFluidSimulation hook
             │   │   ├── Simulation FBO (A, B)
             │   │   ├── Velocity/Pressure textures
             │   │   └── Force accumulation
             │   │
             │   ├── Simulation Pass (GPU compute)
             │   │   └── simulation.ts (GLSL shader)
             │   │       ├── Divergence calculation
             │   │       ├── Pressure projection
             │   │       └── Advection
             │   │
             │   ├── Render Pass (GPU render)
             │   │   └── water.ts (GLSL shader)
             │   │       ├── Heightmap sampling
             │   │       ├── Normal calculation
             │   │       └── Caustics lookup
             │   │
             │   └── RippleAPI
             │       └── addForce(x, y, vx, vy)
             │
             ├─→ RainParticles
             │   ├── ParticleBuffer (positions, velocities)
             │   │
             │   ├── Update Pass (GPU compute)
             │   │   └── rain.ts (GLSL)
             │   │       ├── Gravity simulation
             │   │       ├── Wind drift
             │   │       └── Collision detection
             │   │
             │   └── Render Pass
             │       └── Instanced geometry
             │
             ├─→ AmbientParticles
             │   ├── Particle buffer
             │   │
             │   ├── Update Pass (noise-based)
             │   │   └── particles.ts (GLSL)
             │   │       ├── Perlin noise sampling
             │   │       ├── Velocity update
             │   │       └── Position integration
             │   │
             │   └── Render Pass
             │       └── Floating particles with alpha
             │
             └─→ Caustics
                 ├── Caustics texture (pre-baked)
                 │
                 └── Render Pass
                     └── caustics.ts (GLSL)
                         ├── Animated UV scrolling
                         ├── Intensity variation
                         └── Underwater projection
```

## Hook Dependency Graph

### Initialization Order

```
App Mount
  ↓
useMounted
  ├─→ Client-side guard
  │
  ├─→ usePerformanceMonitor
  │   ├─→ requestAnimationFrame loop
  │   ├─→ FPS calculation
  │   └─→ Effect reduction state
  │
  ├─→ useFluidSimulation
  │   ├─→ WebGL context initialization
  │   ├─→ FBO creation
  │   ├─→ Shader compilation
  │   └─→ GPU memory allocation
  │
  ├─→ useScrollProgress
  │   └─→ window scroll listener
  │
  ├─→ useScrollStory
  │   ├─→ useGSAP hook
  │   ├─→ ScrollTrigger registration
  │   └─→ Timeline setup
  │
  ├─→ useActiveSection
  │   └─→ IntersectionObserver setup
  │
  ├─→ useReducedMotion
  │   └─→ prefers-reduced-motion media query
  │
  └─→ useMediaQuery
      └─→ Responsive breakpoint listeners
```

### Hook Relationships

```
useFluidSimulation (GPU state)
  │
  ├─→ Used by: WaterCanvas
  │
  └─→ Requires: usePerformanceMonitor (for fallback)

useScrollProgress (Scroll position)
  │
  ├─→ Used by: useScrollStory
  │
  └─→ Drives: Animation progress

useScrollStory (GSAP timeline)
  │
  ├─→ Requires: useScrollProgress, useGSAP
  │
  └─→ Used by: Page-level animations

usePerformanceMonitor (FPS tracking)
  │
  ├─→ Monitors: requestAnimationFrame
  │
  └─→ Controls: Effect reduction flags
```

## Shader Compilation Pipeline

### Static Shader Loading

```
Build Time:
src/shaders/water.ts ─┐
src/shaders/rain.ts  ─┼─→ TypeScript compilation ─→ JS strings
src/shaders/*.ts ────┘

Runtime:
ComponentMount
  │
  ├─→ Import shader string
  │   └─→ THREE.ShaderMaterial creation
  │   │
  │   ├─→ Vertex shader compilation (GPU)
  │   │
  │   ├─→ Fragment shader compilation (GPU)
  │   │
  │   └─→ Uniform setup
  │       ├─→ Texture bindings
  │       ├─→ Float parameters
  │       └─→ Vector uniforms
  │
  └─→ Attach to geometry
      └─→ Scene add
```

**Shader Files:**
- `simulation.ts` - Fluid simulation (compute)
- `water.ts` - Water surface rendering
- `rain.ts` - Rain particle system
- `particles.ts` - Ambient particles

## Performance Monitoring Architecture

### FPS Tracking System

```
usePerformanceMonitor Hook
  │
  └─→ requestAnimationFrame Loop
      │
      ├─→ Frame timing measurement
      │   ├─→ Record timestamp
      │   ├─→ Calculate deltaTime
      │   └─→ Increment frame counter
      │
      ├─→ FPS calculation (every 30 frames)
      │   ├─→ Average frame times
      │   └─→ Update state
      │
      ├─→ Performance threshold check
      │   ├─→ If FPS < 30: triggerReduction()
      │   ├─→ If FPS < 50: reduceEffects()
      │   └─→ Update effectsEnabled state
      │
      └─→ Effect Reduction Strategy
          ├─→ Disable ambient particles
          ├─→ Reduce rain particle count
          ├─→ Lower simulation resolution
          └─→ Update useReducedMotion state
```

### Accessibility Integration

```
useReducedMotion Hook
  │
  └─→ window.matchMedia('prefers-reduced-motion')
      │
      ├─→ Respects OS-level accessibility preference
      │
      └─→ Disables:
          ├─→ Smooth scroll animations
          ├─→ Parallax effects
          ├─→ Fade-in transitions
          └─→ Particle animations
```

## State Management

### Global vs Local State

```
Global State (Hooks/Context):
  ├─→ usePerformanceMonitor
  │   └─→ fps, effectsEnabled
  │
  ├─→ useScrollProgress
  │   └─→ scrollPosition (0-1)
  │
  ├─→ useActiveSection
  │   └─→ activeSection: string
  │
  ├─→ useReducedMotion
  │   └─→ prefersReducedMotion: boolean
  │
  └─→ useMediaQuery
      └─→ isMobile, isTablet, isDesktop

Component Local State:
  ├─→ WaterCanvas
  │   ├─→ canvasRef
  │   └─→ rendererRef
  │
  ├─→ RoleCarousel
  │   └─→ currentRole: number
  │
  ├─→ ProjectModal
  │   └─→ selectedProject: ProjectItem | null
  │
  └─→ Contact
      └─→ formData: ContactForm
```

## Error Handling Strategy

### Error Boundaries

```
RootLayout (Server)
  │
  └─→ ErrorBoundary
      └─→ App Content
          │
          └─→ ErrorBoundary (per section)
              ├─→ WaterCanvas (catches GPU errors)
              ├─→ Projects (catches data errors)
              └─→ Contact (catches form errors)
```

**Error Handling Rules:**
- GPU errors → Graceful fallback to static layout
- Shader compilation timeout → Effects disabled, show warning
- Content errors → Show fallback text, log to console
- Network errors → Retry with exponential backoff

## Responsive Design System

### Breakpoints (Tailwind CSS v4)

```
Mobile-First Approach:
  base        (0px)      - Default styles
  sm          (640px)    - Tablets
  md          (768px)    - Small laptops
  lg          (1024px)   - Laptops
  xl          (1280px)   - Desktops
  2xl         (1536px)   - Large monitors
```

### Layout Changes

```
Mobile (base):
  ├─→ Single column layout
  ├─→ Horizontal navbar (top)
  ├─→ Smaller fonts
  └─→ Reduced padding

Tablet (sm):
  ├─→ Two-column grid
  ├─→ Horizontal navbar
  └─→ Medium fonts

Desktop (lg):
  ├─→ Multi-column grid
  ├─→ Vertical sidebar navbar
  └─→ Full-size fonts
```

## Deployment Architecture

### Build Process

```
Source Code (TypeScript/TSX)
  │
  ├─→ TypeScript Compilation
  │   └─→ Type checking (strict mode)
  │
  ├─→ Babel Transformation
  │   └─→ JSX → JavaScript
  │
  ├─→ Next.js Build
  │   ├─→ App Router compilation
  │   ├─→ Static generation (export)
  │   ├─→ Asset optimization
  │   └─→ Code splitting
  │
  ├─→ Tailwind CSS Processing
  │   ├─→ PurgeCSS (unused styles)
  │   └─→ Minification
  │
  ├─→ Webpack Bundling
  │   ├─→ Module bundling
  │   ├─→ Tree shaking
  │   └─→ Code splitting
  │
  └─→ Output
      ├─→ .next/ (build artifacts)
      ├─→ public/ (static assets)
      └─→ Optimized bundle
```

### Production Optimizations

```
Image Optimization:
  ├─→ Next.js Image component
  ├─→ Automatic format conversion (WebP)
  └─→ Responsive srcset generation

Font Optimization:
  ├─→ Google Fonts (CSS)
  ├─→ Self-hosting option
  └─→ Font-display: swap

JavaScript Optimization:
  ├─→ Code splitting per route
  ├─→ Lazy loading components
  └─→ Minification & compression

CSS Optimization:
  ├─→ Unused CSS removal
  ├─→ Minification
  └─→ Critical CSS extraction
```

## Security Architecture

### Client-Side Security

```
Content Security Policy (CSP):
  ├─→ Script sources: 'self', trusted CDNs
  ├─→ Style sources: 'self', Google Fonts
  └─→ Image sources: 'self', data:

Input Validation:
  ├─→ Form data validation
  ├─→ Type checking (TypeScript)
  └─→ Runtime validation

Data Protection:
  ├─→ No sensitive data in localStorage
  ├─→ Environment variables for secrets
  └─→ HTTPS-only in production
```

## Testing Architecture

### Test Pyramid

```
        /\
       /  \  E2E Tests (minimal)
      /    \
     /──────\
    /        \  Integration Tests (medium)
   /          \
  /────────────\
 /              \ Unit Tests (majority)
/________________\
```

**Test Structure:**
- Unit tests for utilities, hooks, components
- Integration tests for feature flows
- E2E tests for critical user journeys
- Jest for unit/integration
- Manual testing for visual effects

## Summary

**Key Architectural Principles:**
1. **Layered Architecture** - Clear separation of concerns
2. **Component Composition** - Reusable, testable components
3. **Hook-based Logic** - Business logic in custom hooks
4. **GPU Acceleration** - Visual effects via Three.js shaders
5. **Performance First** - Monitoring and adaptive quality
6. **Accessibility Always** - Built-in a11y support
7. **Type Safety** - TypeScript strict mode
8. **Single Source of Truth** - portfolio.ts for all content
