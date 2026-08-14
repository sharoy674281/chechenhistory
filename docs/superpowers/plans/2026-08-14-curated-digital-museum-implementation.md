# Curated Digital Museum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current generic editorial landing page with a dark, curated Chechen digital museum entrance, an Aardakh opening exhibition, light archival reading rooms, grouped multilingual search, and a responsive museum timeline.

**Architecture:** Keep the dependency-free static HTML/CSS/JavaScript application. Extend `content.js` with exhibition and provenance records, keep pure catalogue logic in `search-core.js` and a new `museum-core.js`, and let `app.js` render and coordinate the browser UI. The home museum and timeline use dark gallery surfaces; articles and sources use a light reading-room surface.

**Tech Stack:** HTML5, CSS with custom properties and responsive media queries, browser-native JavaScript, Node.js built-in test runner.

## Global Constraints

- No React, bundler, package install, backend, database, or build command.
- Use only verified documentary media with creator, date, collection, license, original URL, and multilingual alt text.
- The opening exhibition is `Aardakh: Deportation and Return, 1944–1957`.
- Remove the generated mountain illustration from the museum entrance.
- No centred marketing hero, gradients, glassmorphism, pill UI, bento grids, universal rounded cards, decorative noise overlay, or ornamental motion.
- Preserve Norwegian, English, and Russian as first-class languages.
- Preserve normal document scrolling and avoid visible horizontal navigation scrollbars.
- Respect `prefers-reduced-motion` and provide full keyboard focus states.
- ChatGPT and Deep Research must never appear in the source catalogue.

---

## File Structure

- `index.html`: semantic museum, timeline, reader-room, method, and source shell.
- `styles.css`: the complete dark-gallery/light-reading-room visual system and responsive layouts.
- `js/content.js`: historical, exhibition, curatorial, and media data.
- `js/search-core.js`: multilingual catalogue indexing, ranking, and result grouping.
- `js/museum-core.js`: pure helpers for exhibitions, periods, related entities, and timeline windows.
- `js/app.js`: DOM rendering, navigation, language switching, search interaction, article opening, and timeline controls.
- `tests/history.test.js`: content integrity and provenance contracts.
- `tests/search.test.js`: exhibition/media search and grouping contracts.
- `tests/museum.test.js`: museum and timeline helper contracts.
- `tests/styles.test.js`: static shell and anti-slop visual contract.

---

### Task 1: Exhibition and Provenance Data

**Files:**
- Modify: `js/content.js`
- Modify: `tests/history.test.js`

**Interfaces:**
- Produces: `content.exhibitions: Exhibition[]`
- Produces: `content.periods: Period[]`
- Extends: `content.media[]` with `kind`, `creator`, `date`, and `collection`
- `Exhibition = { id, number, range, title, introduction, heroMediaId, chapterId, relatedChapterIds, relatedPersonIds, relatedMediaIds, sourceIds }`
- `Period = { id, range, title, chapterIds, leadMediaId }`

- [ ] **Step 1: Add failing content-contract tests**

```js
test('Aardakh is the curated opening exhibition with documentary media', () => {
  const exhibition = content.exhibitions[0];
  assert.equal(exhibition.id, 'aardakh-exhibition');
  assert.equal(exhibition.chapterId, 'aardakh');
  assert.ok(content.media.some((item) => item.id === exhibition.heroMediaId));
  assert.ok(exhibition.sourceIds.includes('ussr1944'));
});

test('every museum media record includes complete provenance', () => {
  for (const item of content.media) {
    for (const key of ['kind', 'creator', 'date', 'collection', 'license', 'sourceUrl']) {
      assert.ok(item[key], `${item.id}.${key} is missing`);
    }
  }
});
```

- [ ] **Step 2: Run the failing tests**

Run: `node --test tests/history.test.js`  
Expected: FAIL because `content.exhibitions`, `content.periods`, and provenance fields are missing.

- [ ] **Step 3: Add the curated records**

Add `aardakh-exhibition` using `lentil-map` as the verified opening object, the `aardakh` chapter as the primary article, and `ussr1944`, `deport-study`, and `tishkov` as its source foundation. Add eight period records matching the approved period index. Add explicit provenance fields to all existing media records.

- [ ] **Step 4: Run the content tests**

Run: `node --test tests/history.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit the data contract**

```powershell
git add js/content.js tests/history.test.js
git commit -m "feat: add curated museum exhibition data"
```

---

### Task 2: Museum Catalogue and Timeline Helpers

**Files:**
- Modify: `js/search-core.js`
- Create: `js/museum-core.js`
- Modify: `tests/search.test.js`
- Create: `tests/museum.test.js`
- Modify: `index.html`

**Interfaces:**
- Extends: `buildSearchIndex(content, lang)` with `exhibition`, `media`, and `place` entries.
- Produces: `groupSearchResults(results): Record<string, SearchResult[]>`
- Produces: `MuseumCore.getOpeningExhibition(content): Exhibition`
- Produces: `MuseumCore.getPeriodEvents(content, periodId): Event[]`
- Produces: `MuseumCore.getRelatedEntities(content, exhibition): { chapters, people, media, sources }`

- [ ] **Step 1: Add failing search and museum tests**

```js
test('search indexes exhibitions and documentary objects', () => {
  const index = buildSearchIndex(content, 'en');
  assert.equal(searchIndex(index, 'deportation return')[0].type, 'exhibition');
  assert.ok(searchIndex(index, 'operation lentil').some((item) => item.type === 'media'));
});

test('groupSearchResults retains entity-type order', () => {
  const grouped = groupSearchResults([
    { type: 'person', id: 'p' }, { type: 'event', id: 'e' }, { type: 'person', id: 'p2' },
  ]);
  assert.deepEqual(Object.keys(grouped), ['person', 'event']);
  assert.equal(grouped.person.length, 2);
});

test('period events are chronological and stay inside the period chapters', () => {
  const events = museum.getPeriodEvents(content, 'aardakh-return');
  assert.deepEqual(events.map((event) => event.year), [...events.map((event) => event.year)].sort((a, b) => a - b));
  assert.ok(events.every((event) => ['aardakh', 'return'].includes(event.chapterId)));
});
```

- [ ] **Step 2: Run the failing tests**

Run: `node --test tests/search.test.js tests/museum.test.js`  
Expected: FAIL because the new entities and helpers are not implemented.

- [ ] **Step 3: Implement the pure helpers**

Use UMD exports consistent with the existing files. Media results target their chapter section, exhibitions target `exhibition-<id>`, and grouped results preserve first-seen entity order. Timeline helpers must not access the DOM.

- [ ] **Step 4: Load `museum-core.js` before `app.js`**

```html
<script defer src="js/museum-core.js"></script>
<script defer src="js/app.js"></script>
```

- [ ] **Step 5: Run the helper tests**

Run: `node --test tests/search.test.js tests/museum.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit the helper layer**

```powershell
git add js/search-core.js js/museum-core.js index.html tests/search.test.js tests/museum.test.js
git commit -m "feat: add museum catalogue helpers"
```

---

### Task 3: Semantic Museum and Reading-room Shell

**Files:**
- Modify: `index.html`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Provides DOM targets: `museum-home`, `opening-exhibition`, `period-index`, `curated-gallery`, `archive-search`, `timeline-track`, `timeline-detail`, `reader-room`, `reader-contents`, `reader-article`, `reader-context`, `people-index`, `places-index`, `source-cabinet`.

- [ ] **Step 1: Replace the old shell assertions with museum assertions**

```js
test('page shell is a curated museum with a separate reading room', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const id of ['museum-home', 'opening-exhibition', 'period-index', 'curated-gallery', 'reader-room', 'reader-contents', 'reader-article', 'reader-context', 'timeline-track']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /class="hero"/);
  assert.doesNotMatch(html, /chechen-mountain-chronicle\.png/);
});
```

- [ ] **Step 2: Run the shell test**

Run: `node --test tests/styles.test.js`  
Expected: FAIL against the current editorial shell.

- [ ] **Step 3: Replace `index.html` with the approved information architecture**

Use a dark museum header and home shell, a dark timeline section, and a light `reader-room` section with explicit left, centre, and right columns. Retain method, source cabinet, language controls, skip link, scripts, metadata, and noscript content. Use factual static fallback headings.

- [ ] **Step 4: Run the shell test**

Run: `node --test tests/styles.test.js`  
Expected: the semantic-shell test passes; visual-contract assertions may still fail until Task 6.

- [ ] **Step 5: Commit the semantic shell**

```powershell
git add index.html tests/styles.test.js
git commit -m "feat: replace landing page with museum shell"
```

---

### Task 4: Curated Home, Reading Room, and Grouped Search Rendering

**Files:**
- Modify: `js/app.js`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: `SearchCore.buildSearchIndex`, `SearchCore.searchIndex`, `SearchCore.groupSearchResults`
- Consumes: `MuseumCore.getOpeningExhibition`, `MuseumCore.getRelatedEntities`
- Produces DOM behaviour for `[data-open-exhibition]`, `[data-open-chapter]`, `[data-search-target]`, and `[data-open-entity]`.

- [ ] **Step 1: Add navigation-target tests**

```js
test('targetFromHash recognises exhibitions, chapters, events, people, places, and sources', () => {
  for (const value of ['#exhibition-aardakh-exhibition', '#chapter-aardakh', '#event-deportation', '#person-zelimkhan', '#place-grozny', '#source-ussr1944']) {
    assert.equal(app.targetFromHash(value), value.slice(1));
  }
  assert.equal(app.targetFromHash('#unknown-value'), null);
});
```

- [ ] **Step 2: Run the failing app test**

Run: `node --test tests/app.test.js`  
Expected: FAIL because `targetFromHash` is absent.

- [ ] **Step 3: Implement museum renderers**

Render the Aardakh exhibition with verified hero media and provenance, the eight-period index, and an asymmetric gallery built from related chapters, people, and media. Do not introduce a generic card abstraction.

- [ ] **Step 4: Implement reading-room rendering**

Opening an exhibition opens its primary chapter. The left column renders real section anchors, the centre renders article sections and events, and the right column renders provenance-rich media and related entities. Keep the destination visible by focusing and scrolling the explicit target after render.

- [ ] **Step 5: Implement grouped search rendering**

Render type headings and result rows for exhibitions, articles, people, places, events, media, and sources. Keep the Cyrillic/Latin alias behaviour and keyboard interactions. Empty search uses a translated suggestion message.

- [ ] **Step 6: Run app, search, and history tests**

Run: `node --test tests/app.test.js tests/search.test.js tests/history.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit rendering and interaction**

```powershell
git add js/app.js tests/app.test.js
git commit -m "feat: render curated museum and reading rooms"
```

---

### Task 5: Responsive Museum Timeline

**Files:**
- Modify: `js/app.js`
- Modify: `styles.css`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Consumes: `MuseumCore.getPeriodEvents(content, periodId)`
- Provides controls: `[data-timeline-previous]`, `[data-timeline-next]`, `[data-select-period]`, `[data-select-event]`
- Updates: `#timeline-detail` in place and navigates `Read full article` to the correct event anchor.

- [ ] **Step 1: Add the responsive timeline contract**

```js
assert.match(css, /\.timeline-track\s*\{[^}]*overflow-x:\s*auto/s);
assert.match(css, /\.timeline-track\s*\{[^}]*scrollbar-width:\s*none/s);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.timeline-track\s*\{[^}]*overflow:\s*visible/s);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.timeline-track\s*\{[^}]*display:\s*grid/s);
```

- [ ] **Step 2: Run the failing stylesheet test**

Run: `node --test tests/styles.test.js`  
Expected: FAIL until timeline styles are present.

- [ ] **Step 3: Implement timeline rendering and controls**

Desktop uses a horizontally scrollable track with hidden scrollbar plus previous/next controls. Each event has a date, documentary thumbnail when available, title, and confidence text. Selecting an event updates `timeline-detail`; it does not open a modal.

- [ ] **Step 4: Implement the mobile chronology**

At 720px and below, disable horizontal scrolling, use a single-column vertical chronology, hide previous/next controls, and keep every event keyboard reachable.

- [ ] **Step 5: Run the stylesheet and app tests**

Run: `node --test tests/styles.test.js tests/app.test.js tests/museum.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit the timeline**

```powershell
git add js/app.js styles.css tests/styles.test.js
git commit -m "feat: add responsive museum timeline"
```

---

### Task 6: Dark-gallery / Light-reading-room Visual System

**Files:**
- Modify: `styles.css`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Styles the semantic targets introduced in Task 3 without changing their IDs.

- [ ] **Step 1: Add anti-slop stylesheet assertions**

```js
assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
assert.doesNotMatch(css, /backdrop-filter|background-clip:\s*text/);
assert.doesNotMatch(css, /border-radius:\s*(1[7-9]|[2-9]\d)px/);
assert.match(css, /\.museum-home\s*\{[^}]*background:\s*var\(--gallery/s);
assert.match(css, /\.reader-room\s*\{[^}]*background:\s*var\(--paper/s);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
```

- [ ] **Step 2: Run the failing visual-contract test**

Run: `node --test tests/styles.test.js`  
Expected: FAIL against the previous CSS.

- [ ] **Step 3: Replace the visual system**

Create near-black-green museum surfaces, warm off-white reading surfaces, rust accents, archival blue-green links, square geometry, thin rules, factual display typography, an asymmetric curated gallery, and a three-column reading room. Remove the fixed paper-noise overlay, old hero rules, universal card styling, detached inverse timeline styling, and decorative transitions.

- [ ] **Step 4: Add responsive layouts**

At 980px, reduce the gallery and reading room to two columns. At 720px, use a compact header, stacked gallery, one-column reading room, collapsible contents control, inline contextual media, and vertical timeline. At 420px, preserve 16px page gutters and readable controls.

- [ ] **Step 5: Run all automated tests**

Run: `node --test tests/*.test.js`  
Expected: all tests pass with zero failures.

- [ ] **Step 6: Commit the visual redesign**

```powershell
git add styles.css tests/styles.test.js
git commit -m "feat: apply archival museum visual system"
```

---

### Task 7: Final Verification, Preview, and Push

**Files:**
- Verify all modified project files.

**Interfaces:**
- Local site: `http://127.0.0.1:4173/`
- Production branch: `main`

- [ ] **Step 1: Verify syntax and all tests**

Run:

```powershell
node --check js/app.js
node --check js/content.js
node --check js/search-core.js
node --check js/museum-core.js
node --test tests/*.test.js
```

Expected: exit code 0 and zero test failures.

- [ ] **Step 2: Verify resources and anti-slop removal**

```powershell
rg -n "chechen-mountain-chronicle|class=\"hero\"|backdrop-filter|linear-gradient|radial-gradient" index.html styles.css js
```

Expected: no output for removed visual patterns or the generated hero asset reference.

- [ ] **Step 3: Verify the live server shell**

Fetch `http://127.0.0.1:4173/` and confirm HTTP 200 plus `museum-home`, `opening-exhibition`, `reader-room`, and `timeline-track` in the returned HTML.

- [ ] **Step 4: Perform manual browser checks when browser control is available**

Check 1440px, 768px, and 390px widths; open the Aardakh exhibition; search `Zelimkhan` and `Зелимхан`; select a timeline event; switch all three languages; tab through interactive controls; enable reduced motion. If direct browser control remains unavailable, report that limitation and do not claim visual verification.

- [ ] **Step 5: Confirm a clean repository and push**

```powershell
git status --short
git push origin main
```

Expected: clean worktree and `main` updated on GitHub.
