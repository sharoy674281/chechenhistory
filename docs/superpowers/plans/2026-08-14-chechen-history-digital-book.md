# Chechen History Digital Book Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished multilingual digital history book from deep antiquity to August 2026 with chapter reading, an evidence timeline, and a source cabinet.

**Architecture:** A dependency-free static web app. UMD modules expose translated content and pure functions to both the browser and Node’s built-in test runner; the UI renders from one normalized history dataset.

**Tech Stack:** HTML5, modern CSS, vanilla JavaScript, Node `node:test`, Python static server for local review.

## Global Constraints

- Norwegian, English, and Russian content coverage.
- WCAG 2.2 AA target and reduced-motion support.
- No undocumented historical imagery presented as evidence.
- Every timeline event references a listed source.
- No framework or runtime dependency.

---

### Task 1: Pure history and localization contracts

**Files:**
- Create: `tests/history.test.js`
- Create: `js/history-core.js`
- Create: `js/i18n.js`

**Interfaces:**
- Produces: `pickTranslation(value, lang)`, `filterEvents(events, filters)`, `chapterProgress(chapters, id)`.

- [ ] Write failing Node tests for language selection, fallback, text/confidence/era filtering, and chapter progress.
- [ ] Run `node --test tests/history.test.js` and confirm module-not-found failure.
- [ ] Implement the UMD pure-function modules.
- [ ] Run the tests and confirm all assertions pass.

### Task 2: Historical dataset and invariants

**Files:**
- Create: `js/content.js`
- Modify: `tests/history.test.js`

**Interfaces:**
- Produces: `HISTORY_CONTENT` with `ui`, `volumes`, `chapters`, `events`, `sources`, and `confidence`.

- [ ] Add failing tests requiring four volumes, twelve chronological chapters, all three languages, valid event source references, and coverage through 2026.
- [ ] Run the focused test and confirm the missing-data failure.
- [ ] Add the researched multilingual dataset and source cabinet.
- [ ] Run all tests and confirm invariants pass.

### Task 3: Semantic shell and book rendering

**Files:**
- Create: `index.html`
- Create: `js/app.js`

**Interfaces:**
- Consumes: `HISTORY_CONTENT`, `HistoryCore`, `HistoryI18n`.
- Produces: rendered cover, chronicle, timeline, method, source cabinet, and reading dialog.

- [ ] Add a failing smoke test that loads the page modules in a DOM-light VM and checks required render exports.
- [ ] Run the smoke test and confirm missing app export.
- [ ] Build the semantic HTML shell and application renderer with language persistence, filters, hash navigation, and dialog focus return.
- [ ] Run the tests and confirm the exported behavior passes.

### Task 4: Distinctive visual system and motion

**Files:**
- Create: `styles.css`
- Copy: `assets/chechen-mountain-chronicle.png`
- Add: `assets/imam-shamil-public-domain.jpg`

**Interfaces:**
- Produces the responsive visual and motion layer described by `DESIGN.md`.

- [ ] Add a static quality test for focus style, reduced motion, responsive breakpoint, OKLCH tokens, and no banned gradient text.
- [ ] Run it and confirm missing stylesheet failure.
- [ ] Implement the cover, ridge timeline, book pages, evidence seals, dialog, and mobile layouts.
- [ ] Copy the supplied image and fetch the public-domain portrait with attribution data in content.
- [ ] Run tests and verify the quality contract passes.

### Task 5: Browser verification and polish

**Files:**
- Modify only files implicated by browser findings.

- [ ] Start `python -m http.server 4173` in the project directory.
- [ ] Inspect 1440px and 390px screenshots, keyboard navigation, all language toggles, era changes, filters, dialog behavior, and console output.
- [ ] Write a failing regression test for every discovered functional defect before changing production code.
- [ ] Fix defects, rerun tests, and re-inspect affected views.
- [ ] Run `node --test tests/*.test.js` and verify zero failures.

## Self-review

All specification sections map to a task. The interfaces use consistent names. The plan contains no deferred implementation placeholders; editorial expansion remains content work through the established dataset schema rather than unfinished application behavior.
