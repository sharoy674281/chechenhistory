# Design System — The Mountain Chronicle

## Direction

The physical scene is a family archive opened at night: a dark green cloth cover, pale documentary leaves, stone photographs, red pencil annotations, and brass library labels. The site moves between a committed dark landscape and neutral reading pages; it does not imitate parchment.

## Color

```css
:root {
  --cover: oklch(0.13 0.018 140);
  --mountain: oklch(0.35 0.11 140);
  --mountain-deep: oklch(0.235 0.07 140);
  --page: oklch(0.985 0 0);
  --page-muted: oklch(0.955 0.006 140);
  --ink: oklch(0.19 0.018 140);
  --ink-muted: oklch(0.43 0.022 140);
  --madder: oklch(0.48 0.14 31);
  --brass: oklch(0.70 0.105 83);
  --stone: oklch(0.67 0.015 220);
}
```

Strategy: committed. The cover and era transitions carry the mountain green; long reading surfaces remain chroma-neutral. Madder marks ruptures, conflict, and contested evidence. Brass marks archival material and strong evidence.

## Typography

- Display and chapter openings: Alegreya, chosen for calligraphic movement without fantasy styling and for Cyrillic coverage.
- Long-form reading: Literata, a typeface designed for digital books with extended Latin and Cyrillic support.
- Interface and source metadata: Arial Narrow / system sans fallback, sentence case rather than decorative all-caps.
- Prose width: 68ch maximum; headings use balanced wrapping and never exceed 5.8rem.

## Layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ wordmark        chronicle  timeline  sources        NO EN RU     │
├──────────────────────────────────────────────────────────────────┤
│ THE HISTORY              transparent mountain landscape          │
│ THAT SURVIVED            rises from the right edge                │
│ Deep past — today        era rail crosses the lower ridge         │
├──────────────────────────────────────────────────────────────────┤
│ book gutter │ chapter opening / evidence margin / source notes    │
├──────────────────────────────────────────────────────────────────┤
│ sticky era rail — a topographic line, not a row of cards          │
├──────────────────────────────────────────────────────────────────┤
│ source cabinet and methodology                                    │
└──────────────────────────────────────────────────────────────────┘
```

Desktop reading pages use a narrow temporal gutter, a generous main column, and a source margin. Mobile collapses these into one column while preserving chronology before prose.

## Signature Interaction

The “ridge of time” is a continuous SVG-like CSS line connecting eras. Choosing an era sends a dark contour wipe across the viewport, changes the environmental color, moves the year marker, and replaces the chapter without imitating a page curl. Reduced-motion mode uses an immediate crossfade.

## Components

- Cover navigation: restrained, transparent over the hero, solid after scroll.
- Era rail: dates and era names along one continuous ridge; selected era has a physical brass pin.
- Evidence seal: text plus shape for Strong, Probable, Possible, Oral memory, Disputed, and Legend.
- Chapter page: opening number/date, translated title, two-column long read, key-event index.
- Source cabinet: searchable list grouped by archaeology, chronicle, archive, scholarship, testimony, and legal record.
- Reading dialog: a real `<dialog>` with focus management and shareable chapter hash.

## Motion

One orchestrated cover reveal, the ridge transition between eras, and quiet hover/focus responses. No repeated fade-up animation on every block. All motion has a `prefers-reduced-motion` alternative.

## Imagery

Use the supplied transparent mountain-and-tower illustration as the cover thesis. Historical-image records appear in the source cabinet only when source and usage rights are known. Generated imagery is not used as documentary evidence.
