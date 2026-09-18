# ScoreLift — Design System

## Visual World

**Garden / Growth** — Credit improvement is a garden you tend, not a quick fix. The visual language is warm, nurturing, and organic: off-white grounds, forest green as the primary presence, muted earth tones for support. Materials feel tactile — paper, soil, leaf surfaces. The aesthetic rewards patience and signals steady growth rather than financial hype.

---

## Direction Contract

<!-- direction:scorelift-garden-cormorant -->

**THESIS.** ScoreLift replaces opaque credit-bureau math with transparent, self-reported, garden-like tending. The category default is sterile financial dashboard or urgent "fix your credit" red-alert design. This surface refuses both: it meets the visitor with warmth, steady progress, and the quiet authority of something that works — like a well-kept garden.

**OWN-WORLD.** Palette: warm off-white ground (`#faf8f2`), forest green primary (`#4a7c59`), dark soil-green text (`#2d3a2a`), muted sage (`#6a7a65`), light moss tint (`#eaf0e8`), amber accent (`#d4a843`), red reserved exclusively for critical-factor alerts (`#c0392b`). Type: Cormorant Garamond (headlines, italic native, weights 400/600/700) + Outfit (body, weights 300/400/500/600). Corners: 12px on cards, 6px on buttons. Spacing: relaxed — generous whitespace above headings, tighter below, pacing that breathes.

**STORY.** A US adult with fair-to-good credit arrives worried their score is a black box. The hero tells them it isn't — in one italic line, "Grow your credit *where it's planted*." Below, a card shows a score of 642 with a clear band label (Fair) and a green delta (+18). Factor health indicators use garden-friendly icons (✓ good, ~ neutral, ! needs attention) — not red/yellow/green traffic lights. The visitor understands: this is a place that will explain, not intimidate.

**FIRST VIEWPORT.** Left half: headline (52px Cormorant Garamond italic on green), sub-text (16px Outfit, sage), green CTA button. Right half: white card with score number (56px Cormorant Garamond), four factor rows with colored dot indicators. Background: off-white. A subtle leaf-like floating emoji (`🌱`, 80px, 12% opacity) sits in the bottom-right corner as an atmospheric marker. Header bar: ScoreLift logo in Cormorant Garamond with green "Lift", four nav links in Outfit sage.

**FORM.** Position 4 (Garden/Growth) among the seven candidates presented to the user. Seed key: `garden-cormorant` — chosen variant 7 (Cormorant Garamond + Outfit) from the font iteration round.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#faf8f2` | Page background — warm off-white |
| `--text` | `#2d3a2a` | Body text — dark soil green |
| `--primary` | `#4a7c59` | CTAs, score numbers, active accents — forest green |
| `--primary-hover` | `#3d6b4d` | Button hover state |
| `--muted` | `#6a7a65` | Secondary text, nav links — sage |
| `--muted-bg` | `#eaf0e8` | Factor good-state, tag backgrounds — light moss |
| `--neutral-bg` | `#f5f0e0` | Factor neutral-state — warm sand |
| `--danger-bg` | `#fae8e8` | Factor attention-state — pale rose |
| `--amber` | `#d4a843` | Neutral indicator dot |
| `--danger` | `#c0392b` | Critical alerts only |
| `--card-bg` | `#ffffff` | Card surfaces |
| `--card-border` | `#e8e6dd` | Card borders, dividers |

## Typography

| Role | Face | Weight | Size | Style |
|------|------|--------|------|-------|
| Logo | Cormorant Garamond | 700 italic | 26px | — |
| H1 | Cormorant Garamond | 700 | 52px | Italic on emphasized phrases |
| H1 (mobile) | Cormorant Garamond | 700 | 34px | — |
| Score number | Cormorant Garamond | 700 | 56px | — |
| Small score | Cormorant Garamond | 400 | 20px | — |
| Body | Outfit | 300/400 | 16px | — |
| Nav | Outfit | 500 | 14px | — |
| CTA button | Outfit | 500 | 15px | — |
| Factor name | Outfit | 500 | 13px | — |
| Factor status | Outfit | 400 | 11px | — |
| Tag | Outfit | 500 | 12px | — |
| Date | Outfit | 400 | 13px | — |

## Spacing & Layout

- Page max-width: 1200px (hero section), 1280px (full pages)
- Section padding: 48px top/bottom, 40px sides
- Card padding: 32px
- Content grid: 2-column (1fr 1fr), 60px gap
- Border radius: 12px (cards), 6px (buttons)
- Factor-row gap: 12px
- Icon size: 32px × 32px (circular factor indicators)
- Dot indicator: 8px diameter

## Component Language

- **Cards** — White, 12px radius, subtle box-shadow (`0 2px 24px rgba(74,124,89,0.08)`), soft border (`1px solid #e8e6dd`)
- **Buttons** — Forest green fill, Outfit 500, 14px/32px padding, 6px radius, hover darkens to `#3d6b4d`
- **Factor indicators** — Circular 32px icons: green circle (good), yellow circle (neutral), red circle (needs attention)
- **Status dots** — Small 8px circles: green/amber/red per factor health
- **Score number** — Large Cormorant Garamond, forest green, with small gray fraction label
- **Divider** — 1px solid `#e8e6dd`

## Responsive

- **768px breakpoint**: Content grid collapses to single column, nav hides (replaced by mobile nav in Phase 2), H1 reduces to 34px
- **Mobile first**: All pages render correctly at 375px width
- Whitespace adjusts proportionally on smaller screens

## Iconography

- Lucide React icons throughout
- Factor status icons checked as part of build

## Accessibility

- Color contrast: `#2d3a2a` on `#faf8f2` body text = ~13:1 (exceeds AA)
- Green `#4a7c59` on `#faf8f2` = ~3.5:1 (meets AA for large text only; status dots use shape + color, not color alone)
- Roving tabindex on factor list items
- Form inputs associated with `<label>` elements
- Error messages in `aria-live` regions

## Open Decisions (for Phase 2)

- Mobile navigation pattern (burger menu vs bottom tab bar)
- Exact Lucide icon set
- Blog/calculator interior page layouts
- Form input styling details beyond the auth pages already built