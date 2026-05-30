---
name: tailwind-design
description: Best practices for Tailwind CSS 4 design — tokens, utilities, consistency, and responsive layouts. Use when building UI, reviewing styles, or improving design consistency.
---

# Tailwind CSS 4 Design Best Practices

## Core Principle: Utilities in Components, Tokens in `@theme`

Tailwind 4 uses a CSS-first configuration. There is no `tailwind.config.js`. Design decisions live in the `@theme {}` block in `globals.css`. Component styles are utility classes in JSX.

```css
/* globals.css — design tokens only */
@import "tailwindcss";

@theme {
  --color-brand: #667eea;
  --color-brand-dark: #764ba2;
  --color-accent: #ff6b6b;
  --color-accent-warm: #ff8e53;
  --color-text: #333333;
  --color-text-muted: #666666;
  --color-text-subtle: #888888;
  --color-surface: #f8f9fa;
  --radius-card: 12px;
  --shadow-card: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-card-hover: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

Once defined in `@theme`, these become Tailwind utilities automatically: `text-brand`, `bg-surface`, `rounded-card`.

## Use Utilities Directly in JSX

```tsx
// Good
<div className="rounded-card shadow-card bg-white p-6 flex flex-col gap-4">

// Bad — custom class for trivial styles
<div className="tour-card">
```

Reserve `globals.css` classes for:
- Base resets (`html`, `body`, `*`)
- Animation `@keyframes` and `@theme` tokens
- Third-party component overrides (e.g. FullCalendar event styles) that can't be targeted with utilities

## Design Tokens: Define Once, Use Everywhere

Never hardcode hex values or magic numbers in components. If you find yourself writing `#667eea` or `rgba(0,0,0,0.1)` in a component, it belongs in `@theme` first.

```tsx
// Bad
<button style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>

// Also bad
<button className="bg-[#667eea]">

// Good — token defined in @theme, utility used in JSX
<button className="bg-gradient-to-r from-brand to-brand-dark text-white">
```

## Consistent Spacing

Use Tailwind's spacing scale — do not invent pixel values:
- `p-4` = 1rem, `p-6` = 1.5rem, `p-8` = 2rem
- `gap-4`, `gap-6` for grid/flex gaps
- `mb-4`, `mt-8` for vertical rhythm

If a design requires a spacing value not on the scale (e.g. `13px`), that's a sign the design needs adjusting, not a reason to use `p-[13px]`.

## Responsive Design

Mobile-first. Write the mobile style as the base, then layer up:

```tsx
<h1 className="text-2xl font-bold md:text-4xl lg:text-5xl">
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

Breakpoints to use:
- `md:` = 768px — tablet, two-column layouts
- `lg:` = 1024px — desktop, full layout
- Avoid `sm:` unless targeting very small phones specifically

## Interactive States

Always define hover and focus states with Tailwind variants:

```tsx
// Button
<button className="
  bg-gradient-to-r from-brand to-brand-dark text-white
  px-6 py-3 rounded-full font-semibold
  transition-all duration-300
  hover:-translate-y-0.5 hover:shadow-lg
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
">

// Card
<div className="
  rounded-card shadow-card bg-white
  transition-all duration-300
  hover:-translate-y-1 hover:shadow-card-hover
">
```

`focus-visible:` (not `focus:`) — only shows focus ring for keyboard navigation, not mouse clicks.

## Typography Scale

```tsx
// Section headings
<h2 className="text-3xl font-bold text-text text-center">

// Card titles
<h3 className="text-xl font-bold text-text">

// Body text
<p className="text-text-muted leading-relaxed">

// Muted / meta
<span className="text-sm text-text-subtle">
```

## Pseudo-elements and Complex Animations

For `::before`/`::after` decorators (e.g. the section title underline) use `@layer components` in `globals.css`:

```css
@layer components {
  .section-title {
    @apply text-3xl font-bold text-text text-center relative pb-4;
  }
  .section-title::after {
    content: '';
    @apply absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full;
    background: linear-gradient(45deg, var(--color-accent), var(--color-accent-warm));
  }
}
```

Use `@apply` only in `@layer components` for patterns that genuinely cannot be expressed as a single utility — not as a shortcut to avoid writing utilities in JSX.

## What to Avoid

- Inline `style={{}}` for anything achievable with utilities
- Arbitrary values like `w-[347px]` or `text-[13px]` — fix the design instead
- Mixing custom CSS class names and utilities on the same element
- Defining the same color in both `@theme` and a hardcoded hex value elsewhere
- `!important` — if you need it, the specificity structure is wrong
