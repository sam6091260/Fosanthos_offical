---
name: gsap
description: Use when adding, modifying, or debugging animations in the Fosanthos project. Covers GSAP setup in Next.js 13 App Router, ScrollTrigger scroll-driven animations, timeline orchestration, page transitions, and brand-consistent motion design. Also use when migrating existing IntersectionObserver/CSS animations to GSAP.
version: "1.0.0"
---

# GSAP Animation Skill — Fosanthos (心光卉)

This skill defines how to use GSAP (GreenSock Animation Platform) correctly within the Fosanthos Next.js 13 App Router project.

---

## 1. Core Setup Rules (Next.js 13 App Router)

### 1.1 Client Components Only

GSAP manipulates the DOM — it **cannot** run in Server Components.

```jsx
'use client'  // ← MANDATORY for any file that imports gsap
```

### 1.2 Plugin Registration (Top-Level, Once)

Register all GSAP plugins **outside** the component, at the module level:

```jsx
'use client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ONCE at module level — safe for re-renders
gsap.registerPlugin(ScrollTrigger)
```

**Available plugins** (all included in the `gsap` package):

| Import Path | Use Case |
|---|---|
| `gsap/ScrollTrigger` | Scroll-driven animations (replaces IntersectionObserver) |
| `gsap/ScrollToPlugin` | Smooth scroll to a target |
| `gsap/Flip` | Layout transition animations |
| `gsap/TextPlugin` | Text content animation |
| `gsap/MotionPathPlugin` | Animate along SVG paths |
| `gsap/Draggable` | Drag interaction |

### 1.3 Always Use `gsap.context()` for Cleanup

Every `useEffect` that creates GSAP animations **must** use `gsap.context()` scoped to a ref. This ensures all child animations and ScrollTriggers are killed on unmount — preventing memory leaks and ghost animations.

```jsx
export default function MySection() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // All gsap.to / gsap.from / ScrollTrigger.create here
      // are automatically scoped to containerRef
    }, containerRef)

    return () => ctx.revert()  // ← kills everything on unmount
  }, [])

  return <section ref={containerRef}>...</section>
}
```

### 1.4 `useEffect` vs `useLayoutEffect`

| Hook | When to Use |
|---|---|
| `useEffect` | ✅ Default choice — works with SSR, runs after paint |
| `useLayoutEffect` | ⚠️ Only if you see a visible flash (FOUC). Must guard with `typeof window !== 'undefined'` or use `useIsomorphicLayoutEffect` pattern |

**Rule: Always start with `useEffect`. Switch only if FOUC is confirmed.**

---

## 2. Brand Animation Tokens (Fosanthos 品牌動態語言)

These tokens ensure all GSAP animations feel consistent with the warm, spiritual, gentle brand identity.

### 2.1 Duration

| Token | Value | Use Case |
|---|---|---|
| `fast` | `0.4` | Micro-interactions: hover, button press |
| `base` | `0.7` | Standard reveal animations |
| `slow` | `1.0` | Hero entrance, section reveals |
| `gentle` | `1.4` | Decorative/ambient animations |

### 2.2 Easing

| Token | GSAP Value | Use Case |
|---|---|---|
| `brand` | `"power2.out"` | Default — matches existing CSS `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| `entrance` | `"power3.out"` | Elements entering the viewport |
| `exit` | `"power2.in"` | Elements leaving |
| `bounce` | `"back.out(1.2)"` | Playful emphasis (use sparingly) |
| `smooth` | `"sine.inOut"` | Continuous/looping animations (float, pulse) |

### 2.3 Stagger

For grouped child elements (cards, list items):

```javascript
stagger: {
  each: 0.15,       // matches existing reveal-delay intervals
  from: "start"     // top-to-bottom / left-to-right
}
```

### 2.4 ScrollTrigger Defaults

```javascript
scrollTrigger: {
  start: "top 85%",    // trigger when element's top hits 85% of viewport
  toggleActions: "play none none none",  // play once, don't reverse
}
```

---

## 3. Common Animation Patterns

### 3.1 Section Reveal (Replaces `.reveal` + IntersectionObserver)

This replaces the current manual `IntersectionObserver` + `.reveal` / `.visible` CSS class pattern.

```jsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Section() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate all elements with data-animate attribute
      gsap.utils.toArray('[data-animate]').forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })

      // Staggered children (e.g., cards)
      gsap.from('[data-animate-stagger] > *', {
        y: 32,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '[data-animate-stagger]',
          start: 'top 85%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef}>
      <h2 data-animate>Title</h2>
      <p data-animate>Description</p>
      <div data-animate-stagger>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </div>
    </section>
  )
}
```

### 3.2 Timeline (Orchestrated Entrance)

Use for Hero section or multi-step sequential animations:

```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.badge', { y: 20, opacity: 0, duration: 0.6 })
      .from('.brand-name', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.tagline', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
      .from('.divider', { scaleX: 0, duration: 0.6 }, '-=0.3')
      .from('.cta-buttons', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
  }, containerRef)

  return () => ctx.revert()
}, [])
```

### 3.3 Continuous / Looping Animation (Float, Pulse)

Replaces CSS `@keyframes float` and `@keyframes pulse`:

```javascript
// Float
gsap.to(element, {
  y: -10,
  duration: 1.5,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
})

// Pulse (scale)
gsap.to(element, {
  scale: 1.05,
  opacity: 0.8,
  duration: 1.25,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
})
```

### 3.4 Page Transition

For the existing `PageTransition` component pattern:

```jsx
// Fade-out before navigation
gsap.to(overlayRef.current, {
  opacity: 1,
  duration: 0.45,
  ease: 'power2.inOut',
  onComplete: () => router.push(href),
})

// Fade-in after navigation
gsap.to(overlayRef.current, {
  opacity: 0,
  duration: 0.45,
  ease: 'power2.inOut',
  delay: 0.08,  // buffer for render
})
```

### 3.5 Text / Counter Animation

```javascript
// Number counting
gsap.from(el, {
  textContent: 0,
  duration: 2,
  ease: 'power1.out',
  snap: { textContent: 1 },
  scrollTrigger: { trigger: el, start: 'top 85%' },
})
```

### 3.6 Parallax Effect

```javascript
gsap.to(imageRef.current, {
  yPercent: -15,
  ease: 'none',
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,   // ties animation progress to scroll position
  },
})
```

---

## 4. Integration with Existing CSS Modules

GSAP and CSS Modules can coexist. Follow these rules:

### 4.1 Let GSAP Handle Dynamic State, CSS Handle Static Style

```css
/* Component.module.css — static visual styling only */
.card {
  border-radius: var(--radius-md);
  background: var(--color-white);
  box-shadow: var(--shadow-soft);
  /* ❌ Do NOT put opacity/transform initial state here if GSAP controls it */
}

/* ✅ Keep hover effects in CSS — they are interaction-based, not scroll-based */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
```

### 4.2 Selecting CSS Module Elements in GSAP

Since CSS Modules mangle class names, use one of these strategies:

```jsx
// Strategy 1: Use refs (preferred for single elements)
const headingRef = useRef(null)
gsap.from(headingRef.current, { opacity: 0 })

// Strategy 2: Use data-attributes (preferred for groups)
<div data-animate>...</div>
gsap.from('[data-animate]', { opacity: 0 })

// Strategy 3: Use gsap.context selector scope (scoped to ref)
const ctx = gsap.context(() => {
  // This selects '.heading' ONLY within containerRef
  gsap.from('.heading', { opacity: 0 })
}, containerRef)
// ⚠️ Only works with non-module (global) classes or data-attributes
```

### 4.3 Avoid Style Conflicts

When GSAP animates a property, do NOT also set that property in CSS with `!important`. GSAP sets inline styles which will be overridden by `!important`.

```css
/* ❌ BAD — conflicts with GSAP */
.element {
  opacity: 1 !important;
}

/* ✅ GOOD — let GSAP control opacity */
.element {
  /* opacity managed by GSAP */
}
```

---

## 5. Migration Guide: From IntersectionObserver to ScrollTrigger

The current codebase has 5 components using a repeated IntersectionObserver pattern. When migrating:

### Before (Current Pattern)

```jsx
// Component.js
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.15 }
  )
  const reveals = sectionRef.current?.querySelectorAll('.reveal')
  reveals?.forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}, [])

// JSX
<h2 className={`${styles.heading} reveal reveal-delay-1`}>...</h2>
```

```css
/* globals.css */
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.9s ease, transform 0.9s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-delay-1 { transition-delay: 0.15s; }
```

### After (GSAP ScrollTrigger)

```jsx
// Component.js
useEffect(() => {
  const ctx = gsap.context(() => {
    const elements = gsap.utils.toArray('[data-reveal]')
    elements.forEach((el, i) => {
      gsap.from(el, {
        y: 32,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      })
    })
  }, sectionRef)
  return () => ctx.revert()
}, [])

// JSX — replace class-based reveal with data-attributes
<h2 className={styles.heading} data-reveal>...</h2>
```

### Migration Checklist

- [ ] Add `'use client'` if not already present
- [ ] Import `gsap` and `ScrollTrigger`, register plugin
- [ ] Replace `IntersectionObserver` with `gsap.context()` + `ScrollTrigger`
- [ ] Replace `.reveal` / `.reveal-delay-N` classes with `data-reveal` attributes
- [ ] Remove the old `IntersectionObserver` `useEffect` block
- [ ] Keep CSS `transition` for hover/focus states (not managed by GSAP)
- [ ] Test: scroll to section, verify animation plays once
- [ ] Test: navigate away and back, verify no ghost animations

---

## 6. Performance Guidelines

### 6.1 Animate Only GPU-Friendly Properties

| ✅ Performant (GPU) | ❌ Avoid (Layout Thrash) |
|---|---|
| `opacity` | `width`, `height` |
| `transform` (x, y, scale, rotation) | `margin`, `padding` |
| `clipPath` | `top`, `left`, `right`, `bottom` |

### 6.2 `will-change` is Automatic

GSAP automatically adds `will-change: transform` during animations. **Do not** manually add `will-change` in CSS for GSAP-animated elements.

### 6.3 ScrollTrigger Refresh

After dynamic content loads (e.g., blog posts from API), refresh ScrollTrigger:

```javascript
ScrollTrigger.refresh()
```

### 6.4 Reduced Motion (Accessibility)

Always respect `prefers-reduced-motion`:

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Skip GSAP animations, set elements to final state
  gsap.set('[data-reveal]', { opacity: 1, y: 0 })
} else {
  // Normal GSAP animations
  gsap.from('[data-reveal]', { opacity: 0, y: 32, ... })
}
```

Or globally:

```javascript
gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
  // Disable all scroll-triggered animations
  ScrollTrigger.getAll().forEach(st => st.kill())
  gsap.globalTimeline.clear()
})
```

---

## 7. Debugging

### Browser Console Commands

```javascript
// List all active ScrollTriggers
ScrollTrigger.getAll()

// Visual debug markers (red/green lines in viewport)
ScrollTrigger.create({ ..., markers: true })

// Check GSAP version
gsap.version
```

### Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| Animation plays instantly, no scroll trigger | Forgot `gsap.registerPlugin(ScrollTrigger)` | Add registration at module top |
| Animation doesn't play at all | Element is in a Server Component | Add `'use client'` directive |
| Ghost animations after navigation | Missing cleanup | Add `return () => ctx.revert()` |
| Flicker on first load | CSS sets `opacity: 1`, GSAP resets to `0` | Remove conflicting CSS initial state, or use `gsap.set()` before `gsap.from()` |
| ScrollTrigger positions wrong | Dynamic content changed layout | Call `ScrollTrigger.refresh()` after content loads |
| `window is not defined` | Code runs during SSR | Wrap in `useEffect` (not at module top level) |

---

## 8. File Reference

| File | Role |
|---|---|
| `globals.css` | CSS variables (colors, easing, spacing) — GSAP reads these via `getComputedStyle` if needed |
| `app/components/*/Component.js` | Client components where GSAP animations live |
| `app/components/*/Component.module.css` | Static styling only — avoid animating GSAP-controlled properties here |
| `app/components/PageTransition/` | Page transition overlay — candidate for GSAP Timeline migration |
