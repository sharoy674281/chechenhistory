# Chechen History Digital Book — Design Specification

## Objective

Build a complete multilingual web book covering Chechen history from the archaeological deep past to August 2026. It must combine a readable narrative with an interactive chronology and a transparent evidence model.

## Scope

The first release contains four volumes in one continuous experience:

1. Deep history to 1800: Koban-period archaeology, Nakh language history, Durdzuketi, Mongol-era disruption, Simsim, tower societies, Islamisation, early Russian records, and Sheikh Mansur.
2. Conquest and empire, 1800–1917: the Caucasian War, the Imamate, Russian conquest, population transfer to the Ottoman Empire, uprisings, imperial administration, urbanisation, and Grozny oil.
3. Revolution, Soviet rule, and exile, 1917–1991: the Mountain Republic, civil war, autonomous institutions, collectivisation and resistance, the 1944 deportation, exile, rehabilitation, return, and late-Soviet memory.
4. Independence, war, and the present, 1991–2026: the Chechen Republic of Ichkeria, two wars, documented abuses by all sides, de facto reintegration under Moscow, reconstruction and authoritarian rule, diaspora, memory politics, and Chechen participation on opposing sides of the Russo-Ukrainian war.

## Editorial Model

Every claim carries one of six labels: Strong, Probable, Possible, Oral memory, Disputed, or Legend. Labels describe evidence status, not cultural value. Oral testimony remains visible beside archival and archaeological sources, with recording date and provenance where known. Contested casualty estimates are presented as ranges with attributed sources.

The site distinguishes event date, source date, and publication date. Modern actors are described with precise institutional language. Human-rights findings use court judgments and documented investigations rather than anonymous summaries wherever possible.

## Information Architecture

- Cover: purpose, temporal span, primary “Begin reading” action, language control.
- Chronicle: four volumes and twelve chapters in reading order.
- Timeline: filterable evidence-led events with search and confidence filters.
- Method: why reconstruction is layered; limits of ethnicity projected into antiquity.
- Source cabinet: bibliography and archival portals grouped by source family.
- Reading dialog: full chapter article with event notes and direct source links.

## Localization

Norwegian is the initial language. Every navigation label, chapter title, summary, article paragraph, event, confidence label, and method text has Norwegian, English, and Russian variants. Proper titles retain original-language forms where useful. The selected language persists in local storage.

## Visual and Interaction Requirements

Follow `DESIGN.md`. The supplied transparent mountain illustration anchors the cover. Era changes use the ridge transition. The site avoids fake parchment, glassmorphism, nested cards, generic statistic heroes, and decorative “01/02/03” numbering unrelated to chronology.

## Technical Architecture

A dependency-free static site using semantic HTML, CSS, and browser JavaScript. Content lives in a focused UMD data module; pure filtering and localization logic live in independently testable modules. The site runs from any static server and needs no build step. Node’s built-in test runner verifies content invariants and interaction logic.

## Error and Edge Handling

- Missing translation falls back to English, then the first available value.
- Empty timeline filters show a useful reset action.
- External sources open safely in a new tab.
- If remote fonts fail, system serif/sans fallbacks preserve hierarchy.
- Historical-image records include attribution links; the reading experience does not depend on a remote image host.
- Unsupported dialog behavior falls back to an inline open state.

## Accessibility and Performance

Semantic landmarks, skip link, full keyboard operation, focus return from dialog, AA contrast, non-color evidence labels, 44px mobile controls, reduced motion, lazy image loading below the fold, no render-blocking application dependency, and no content hidden behind JavaScript-only reveal states.

## Research Foundations

The supplied report provides the pre-1800 spine. Later volumes draw on academic work from Cambridge and Oxford, Russian archival decrees, OSCE records, European Court of Human Rights judgments, Human Rights Watch and Memorial documentation, and recent scholarship on diaspora and Ukraine. Every cited source is represented in the source cabinet.

## Acceptance Criteria

- All four volumes and twelve chapters are readable in Norwegian, English, and Russian.
- Era, search, confidence filter, source cabinet, chapter dialog, and language controls work with keyboard and pointer.
- Each event links to at least one listed source.
- The evidence legend remains visible and comprehensible without color.
- Mobile layout works at 360px; desktop layout works at 1440px.
- Tests pass and local browser review shows no console errors or broken core interactions.
