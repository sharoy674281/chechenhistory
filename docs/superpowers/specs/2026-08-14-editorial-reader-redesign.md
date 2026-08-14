# Editorial Reader Redesign

## Goal

Turn the current one-page historical showcase into a calm, searchable, Wikipedia-like digital history book. Readers should understand the structure immediately, find people such as Zelimkhan, expand deeper reading without leaving the page, and always land at the exact content they selected.

## Problems to solve

- The cover behaves like a promotional landing page: oversized headline, competing buttons, and decorative motion dominate the history.
- The sticky horizontal era rail exposes a scrollbar and repeats navigation already present elsewhere.
- Timeline actions open a reused dialog that can retain its previous scroll position.
- Hero anchors depend on default hash behaviour and give weak feedback.
- Search covers events only; it does not search chapters, people, places, aliases, or sources.
- The same content is repeated across the volume index, era rail, featured chapter, volume list, timeline, and dialog.
- Articles lack visual documentary material and internal section navigation.

## Chosen direction

Use a continuous editorial reading page rather than a modal-driven museum experience. The page combines a compact book-cover masthead, a global search, a typographic table of contents, a chronological event index, and expandable chapters. It should feel closer to a carefully designed historical encyclopedia than a product landing page.

## Information architecture

1. **Compact masthead**
   - Wordmark, navigation, language selection, and global search access.
   - Hero height is reduced. The supplied mountain illustration remains, but acts as a restrained landscape plate rather than the main interface.
   - One primary action: start reading. Timeline becomes a normal text link, not a second CTA block.

2. **Find and explore**
   - A large global search input appears directly below the title.
   - Search covers chapter titles, chapter prose, events, people, places, aliases, dates, and source metadata in the active language.
   - Results are grouped by People, Events, Chapters, and Sources.
   - Selecting a result expands the relevant chapter and scrolls its target heading into view with header offset and focus.

3. **Contents**
   - Four typographic volume rows show date range, title, and chapter links.
   - Topic shortcuts provide Origins, Society and faith, Conquest, Aardakh, Ichkeria, War and memory, and Today.
   - No horizontally scrolling era rail.

4. **Chronicle reader**
   - All twelve chapters live on the same page as semantic `<article>` elements.
   - Each chapter initially shows title, deck, key dates, and opening paragraph.
   - “Continue reading” expands the full prose inline. It changes to “Show less” and does not move the reader unexpectedly.
   - A compact local contents list links to chapter subsections where available.
   - Source notes remain attached to each chapter.

5. **Timeline**
   - Timeline stays as a filterable chronological index, but uses denser typography and less empty vertical space.
   - Event actions say “Go to article.” Clicking expands the chapter and scrolls to a highlighted event anchor within it.
   - Event targets receive temporary visual emphasis so readers understand what opened.

6. **Source library**
   - Source cabinet remains on the same page and becomes searchable through the global search.
   - Generated research reports and AI tools are never listed as historical sources.

## Content model

Add optional structured fields without breaking existing chapter data:

- `sections`: translated subsection headings and paragraphs.
- `people`: canonical name, translated display name, aliases, lifespan, summary, chapter ID, event IDs, and source IDs.
- `places`: canonical name and aliases for search.
- `media`: local or remote image, translated alt text, caption, creator, date, license, and source URL.
- `event.anchorId`: stable target inside its chapter.

Zelimkhan Gushmazukaev is added as the first dedicated person record and linked to an appropriately sourced event/article passage. Search aliases include common Latin, Norwegian, English, and Cyrillic spellings.

## Images and evidence

- Documentary images may appear only when their source and usage status are recorded.
- Prefer public-domain or clearly licensed material from Wikimedia Commons, Library of Congress, national libraries, museums, and archival institutions.
- Every image receives creator, approximate date, institution/source, license status, and a direct source link.
- Generated images remain decorative and are never presented as historical evidence.
- When no verified image exists, typography and documentary excerpts are preferred over invented illustration.

## Interaction behaviour

- Hero and navigation links use an explicit `scrollToTarget` helper that accounts for the fixed header and moves keyboard focus.
- `openArticle(chapterId, targetId)` expands the correct chapter, waits for layout completion, then scrolls and focuses the requested heading.
- Inline expansion state is stored in memory; language changes preserve which chapters are open.
- URL hashes identify chapter or event targets so links remain shareable.
- Browser back restores the previous target without opening a dialog.
- The chapter dialog and its hash-specific code are removed.
- The top reading-progress strip and visible era-rail scrollbar are removed. Normal page scrolling remains usable.

## Visual system changes

- Reduce the hero title to an editorial display scale with a wider measure and fewer forced line breaks.
- Remove the dual boxed CTA treatment and ridge-line decoration from the cover.
- Replace large section headings and oversized whitespace with a consistent book rhythm: kicker, title, introduction, rule, content.
- Use Literata for article prose at approximately 17–19 px with 65–72 character line length.
- Use Alegreya selectively for volume and chapter titles, not for every label.
- Preserve deep green, paper white, brass, and madder, but use brass as a restrained annotation color.
- Avoid cards where a simple list, rule, or table-of-contents row communicates hierarchy better.

## Responsive behaviour

- Mobile keeps the compact language selector and menu.
- Search results fill the available width and remain keyboard navigable.
- Contents and chapter metadata collapse to one column.
- Article controls are at least 44 px high.
- Images use width and height attributes to avoid layout shift.
- No component creates horizontal page scrolling at 320 px.

## Accessibility

- Search uses a labelled combobox/listbox pattern with announced result counts.
- Expansion controls expose `aria-expanded` and `aria-controls`.
- Programmatic scrolling also moves focus to the destination using `tabindex="-1"` where required.
- Temporary event highlighting is not the only indication of the selected target.
- Reduced-motion mode uses immediate navigation without smooth scrolling or highlight animation.
- All new interface strings cover Norwegian, English, and Russian.

## Testing

- Unit tests for the global search index, aliases, grouping, language matching, and empty results.
- Unit tests for target resolution and URL-hash parsing.
- Content tests ensure Zelimkhan is searchable and every person/media record references known sources.
- DOM/static-contract tests ensure the dialog, era rail, and read-progress strip are removed.
- DOM/static-contract tests ensure global search, inline chapter expansion, and section anchors exist.
- CSS tests cover readable type scale, no horizontal scrollbar UI, mobile layout, focus state, and reduced motion.
- Manual checks: hero links, global search, timeline-to-article navigation, expansion, back navigation, all three languages, keyboard navigation, 320 px mobile, and desktop.

## Success criteria

- A reader can search “Zelimkhan” or “Зелимхан,” select the result, and land on an expanded sourced passage on the same page.
- Timeline selections always reveal and position the chosen content without manual corrective scrolling.
- No chapter interaction opens a modal or pseudo-page.
- The first viewport reads as a historical publication, not a marketing template.
- Readers can identify the four volumes and begin a chapter without understanding the timeline interface.
- Historical images are visibly attributed and never confused with generated decorative art.
