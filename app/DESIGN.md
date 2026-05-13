---
name: Leadfinder
description: AI-powered lead generation and outreach management for sales and growth teams.
colors:
  signal-blue: "oklch(0.62 0.22 240)"
  signal-blue-deep: "oklch(0.50 0.24 240)"
  link-blue: "oklch(0.74 0.18 240)"
  void: "oklch(0.135 0.006 240)"
  surface: "oklch(0.200 0.007 240)"
  surface-secondary: "oklch(0.238 0.007 240)"
  surface-tertiary: "oklch(0.272 0.006 240)"
  field-bg: "oklch(0.208 0.007 240)"
  field-border: "oklch(0.310 0.012 240)"
  border: "oklch(0.280 0.010 240)"
  text-muted: "oklch(0.55 0.012 240)"
  text-primary: "oklch(0.935 0.006 240)"
  accent-fg: "oklch(0.98 0 0)"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.18px"
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "oklch(0.68 0.22 240)"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip-signal:
    backgroundColor: "oklch(0.62 0.22 240 / 0.12)"
    textColor: "{colors.signal-blue}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
---

# Design System: Leadfinder

## 1. Overview

**Creative North Star: "The Command Center"**

Leadfinder is built for people who run operations. The interface functions like a command center: information appears precisely where it's needed, controls are unambiguous, and every surface serves the mission. There is no decoration that doesn't earn its place. A sales team running outreach shouldn't notice the UI — they should notice the lead.

The dark theme is not aesthetic preference, it's operational posture. Ambient low-light environments, long sessions, high information density — the dark surface reduces fatigue and keeps focus on the data. Signal Blue appears like an indicator light: rare, precise, and always meaningful. When it's on, something needs attention or is active. Overuse destroys its authority. A command center with every light blinking is useless.

This system explicitly rejects the neon/hacker aesthetic (glow-for-glow's-sake, cyberpunk overload, garish accents that turn a dashboard into a screensaver) and the Bloomberg terminal data-overload pattern (intimidating walls of information with no breathing room). Dense is fine. Overwhelming is a failure.

**Key Characteristics:**
- Dark-first, flat surface hierarchy — no drop shadows at rest
- Signal Blue used with restraint; its rarity is the point
- Confident, direct components: solid fills, unambiguous interactive states
- Tonal depth through background steps, not elevation shadows
- System-UI typography: functional, fast, no font personality competing with the data
- Hue consistency: every neutral carries hue 240°, binding the palette into a single tonal system

## 2. Colors: The Signal Palette

A monochromatic navy-indigo system with one vivid accent. Hue uniformity at 240° throughout creates cohesion; lightness steps create depth; Signal Blue's high chroma makes it unmissable precisely because nothing else competes with it.

### Primary
- **Signal Blue** (oklch(0.62 0.22 240)): The system's only vivid color. Active states, primary CTAs, focus rings, key data signals. Never decorative. Its rarity is what makes it mean something.
- **Signal Blue Deep** (oklch(0.50 0.24 240)): Light-mode variant. Higher chroma compensates for light-background contrast loss. Same role, adjusted posture.

### Secondary
- **Link Blue** (oklch(0.74 0.18 240)): Navigational intent only. Hyperlinks and secondary interactive text. Lower chroma than Signal Blue — clearly subordinate, never confused for a CTA.

### Neutral
- **Void** (oklch(0.135 0.006 240)): Page background in dark mode. The absolute floor. Everything lives above it.
- **Surface** (oklch(0.200 0.007 240)): Card and panel backgrounds. First step up from Void.
- **Surface Secondary** (oklch(0.238 0.007 240)): Hover states, table row hover, second-tier containers, active sidebar tint base.
- **Surface Tertiary** (oklch(0.272 0.006 240)): Topmost ambient elements. Tooltip resting state, deepest nested panel.
- **Border** (oklch(0.280 0.010 240)): All container edges and dividing lines.
- **Field Border** (oklch(0.310 0.012 240)): Input strokes. Slightly elevated from Border to signal interactive territory.
- **Muted Text** (oklch(0.55 0.012 240)): Secondary labels, metadata, section identifiers, placeholder context.
- **Primary Text** (oklch(0.935 0.006 240)): Body text and headings. Tinted into hue 240°, never pure white. Pure white breaks the tonal system.

**The One Signal Rule.** Signal Blue covers ≤10% of any given screen. It is a status light, not wallpaper. If it appears on more than one element without a deliberate reason, audit and remove until it means something again.

**The Tinted Neutral Rule.** All neutrals carry chroma 0.006–0.012 at hue 240°. Zero-chroma neutrals are prohibited. They sever the tonal relationship that makes the palette feel like a system rather than a collection of grays.

## 3. Typography

**Display / Body / UI Font:** system-ui, "Segoe UI", Roboto, sans-serif
**Mono Font:** ui-monospace, Consolas, monospace

**Character:** System-UI is the choice of a tool that respects the user's machine. No webfont loading lag, no font personality competing with the data. The hierarchy is built through weight and scale contrast, not decorative typefaces. The mono stack is used for identifiers, codes, and technical values — never for decorative purposes.

### Hierarchy
- **Display** (600, clamp(1.75rem, 3vw, 2.25rem), 1.2, −0.01em tracking): Page titles and section headers with maximum authority. Rare — one per view.
- **Headline** (600, 1.25rem, 1.3): Card headers, modal titles, key named entities within a panel.
- **Title** (600, 1rem, 1.4): Sub-section headers, named groups within a panel, table column headers.
- **Body** (400, 18px / 1.45, 0.18px tracking): Default reading size for all prose and data. 16px on screens ≤1024px. Max line length 65–75ch.
- **Label** (600, 0.75rem, 1.4, UPPERCASE, 0.12em tracking): Section identifiers inside cards and panels. Always uppercase. The system's signature detail. Never used for body copy or paragraph text.

**The Weight-Not-Size Rule.** Hierarchy is established through weight contrast (400 → 600) before size increases. Escalating both simultaneously produces visual noise. Increase size only when weight alone is insufficient.

## 4. Elevation

This system is flat by default. Depth is expressed entirely through tonal surface steps — Void → Surface → Surface Secondary → Surface Tertiary — not drop shadows. In a dark UI, drop shadows add noise and create unearned drama. Tonal steps communicate the same spatial information with precision.

Shadows appear in exactly two cases: (1) modals and dialogs, where a structural shadow marks genuine overlay above the document plane; (2) inset edge highlights on card headers (`box-shadow: 0 1px 0 oklch(1 0 0 / 0.04) inset`), a near-invisible material edge that adds depth without breaking the flat aesthetic.

One exception to the flat rule: active sidebar navigation items carry an inset ring via `color-mix(in oklch, var(--accent) 22%, transparent)`. This is a focus state indicator, not decoration.

### Shadow Vocabulary
- **Modal shadow** (`oklch(0 0 0 / 0.4) 0 10px 15px -3px, oklch(0 0 0 / 0.25) 0 4px 6px -2px`): Full modals and dialogs only. Never on cards or inline panels.
- **Card inset highlight** (`0 1px 0 oklch(1 0 0 / 0.04) inset`): Top edge of card header sections. Creates a subtle material lip.
- **Active ring** (`inset 0 0 0 1px color-mix(in oklch, var(--accent) 22%, transparent)`): Sidebar nav active state only.

**The Flat-First Rule.** If a shadow isn't on a modal, a dropdown, or an active-state ring, remove it. Floating cards, ambient glow effects, accent-colored drop shadows, and decorative `box-shadow` declarations are prohibited.

## 5. Components

### Buttons
Solid, unambiguous, direct. Buttons signal their interactivity through fills, not outlines. No ambiguity about what's clickable.

- **Shape:** 12px radius (`rounded-xl`). Consistent across all sizes.
- **Primary:** Signal Blue fill, white foreground, `10px 16px` padding. The highest-authority interactive element in any view. One per primary action group.
- **Secondary:** Surface-secondary fill, primary text. For cancellation and equal-weight alternative paths. Never more visually prominent than Primary.
- **Tertiary:** Transparent background, muted text. Inline and low-priority actions (edit, view, icon-only). Danger variant: `text-danger` foreground, same transparent background.
- **Hover:** Primary lightens to `oklch(0.68 0.22 240)`. All transitions `duration-200`.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-accent`. Signal Blue ring on keyboard navigation.
- **Sizes:** `sm` (table rows, toolbar actions) and default (modal footers, primary CTAs).

### Chips / Badges
- **Style:** Soft variant — semantic fill at 10–15% opacity with full-opacity matching foreground. HeroUI `variant="soft"`.
- **Shape:** 6px radius (`rounded-md`). Score badges: `h-6 min-w-9`, `text-xs font-semibold`.
- **Colors:** Semantic — success, warning, danger, and Signal Blue for primary category labels.
- **Rule:** Chips signal state and category. They are never used as navigation or primary actions.

### Cards / Containers
- **Corner style:** Major containers `rounded-2xl` (16px). Nested sub-panels `rounded-xl` (12px). Match corner radii to spatial hierarchy.
- **Background:** `bg-surface` base. Overlaid or floating panels: `bg-surface/80 backdrop-blur-sm`.
- **Shadow:** Inset edge highlight only. No drop shadows.
- **Border:** `border border-border/80`. Always present — defines the container edge.
- **Internal padding:** `p-4` standard; `p-6`–`p-8` for hero and profile panels.
- **Section headers inside cards:** `bg-surface-secondary/40`, `border-b border-border/60`, `px-4 py-3`. Label text is Label-style (0.75rem, 600, uppercase, 0.12em tracking, muted). Icon badge: `size-8 rounded-lg bg-accent/10 text-accent`.

**The No-Nested-Cards Rule.** A card inside a card is prohibited. Use tonal surface steps to create sub-sections. Nesting `rounded-2xl` containers creates redundant chrome.

### Inputs / Fields
- **Style:** `bg-field-background` fill (`oklch(0.208 0.007 240)`), `border-field-border` stroke (`oklch(0.310 0.012 240)`), `rounded-xl`.
- **Placeholder:** `oklch(0.46 0.012 240)` — distinctly dimmer than real content, never ambiguous.
- **Focus:** Signal Blue takes over: `ring-2 ring-accent`.
- **Error:** Danger-colored border and `FieldError` text beneath the field.
- **Layout:** Two-column grid (`grid gap-4 sm:grid-cols-2`) for modal and drawer forms.

### Navigation (Sidebar)
- **Container:** `rounded-2xl`, `bg-surface border border-border`, `my-3 ml-3`. Floats inside the page frame; not flush to edges.
- **Width:** 220px expanded, 64px collapsed. `transition-all duration-300 ease-in-out`.
- **Nav items:** `rounded-xl`, `py-[8px] px-2.5`. Active: Signal Blue icon tint, `color-mix(in oklch, var(--accent) 12%, transparent)` fill, inset Signal Blue ring. Hover: `bg-surface-secondary`. Inactive: muted text.
- **Icon feedback:** `group-hover:scale-[1.07]` — kinetic confirmation without layout shift.

### Pipeline View (Signature Component)
Status-aware Kanban with semantic tones. New → neutral surface, Contacted → warning-soft/30, Converted → success-soft/30, Archived → danger-soft/20. Each column `rounded-xl border border-border bg-surface`. Drag-over state: `bg-accent/10` fill. The accent tint appears only under the dragged card — purposeful Signal Blue use.

## 6. Do's and Don'ts

### Do:
- **Do** tint every neutral toward hue 240° (chroma 0.006–0.012). Zero-chroma grays break the tonal system.
- **Do** use Signal Blue only for active states, primary CTAs, focus rings, and key data signals. If it appears on more than ~10% of a surface, remove it until it means something again.
- **Do** establish hierarchy through weight contrast first (400 → 600), size second.
- **Do** keep card section headers at `text-xs font-semibold uppercase tracking-[0.12em] text-muted` — it's the system's signature detail.
- **Do** use `rounded-2xl` for major containers and `rounded-xl` for nested components. Radius signals hierarchy.
- **Do** use `duration-200` for all interactive state transitions. Speed is a design decision.
- **Do** let tonal surface steps carry spatial depth before reaching for shadows.
- **Do** keep maximum body line length at 65–75ch. Data tables are exempt; prose is not.

### Don't:
- **Don't** add glow effects, neon accents, colored drop shadows, or any `box-shadow` that uses Signal Blue as its shadow color. The dark theme must feel polished and purposeful, not terminal-themed. This is the first anti-reference from PRODUCT.md.
- **Don't** create views that overwhelm with data. Every screen has one primary action; secondary information is suppressed until needed. Dense ≠ overwhelming.
- **Don't** use `border-left` greater than 1px as a colored stripe on cards, list items, or callouts. Rewrite with background tints, leading icons, or full borders.
- **Don't** use gradient text (`background-clip: text` with a gradient). Single solid color only.
- **Don't** nest cards inside cards. Use surface step changes instead.
- **Don't** add drop shadows to cards or section panels. Shadows belong on modals, dropdowns, and active-state rings only.
- **Don't** use zero-chroma neutrals (`#808080`, `rgb(128,128,128)`, `oklch(0.5 0 0)`). They visually disconnect from the system.
- **Don't** animate layout properties (`width`, `height`, `padding`, `margin`). Animate `transform` and `opacity` only.
- **Don't** bounce or use elastic easing. Ease-out curves only (`ease-out-quart` or `cubic-bezier(0.25, 1, 0.5, 1)`).
- **Don't** use em dashes in any UI copy. Use commas, colons, semicolons, or parentheses.
