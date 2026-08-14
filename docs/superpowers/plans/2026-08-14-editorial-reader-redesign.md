# Editorial Reader Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current one-page showcase as a calm, searchable, Wikipedia-like history reader with inline expansion, exact timeline navigation, sourced imagery, and a searchable Zelimkhan record.

**Architecture:** Keep the dependency-free static architecture and UMD modules. Add a pure search module, extend the content schema with people/sections/media, replace the dialog reader with semantic inline articles, and centralize scroll/focus/hash navigation in the app module. The page remains one document and works from the existing local server.

**Tech Stack:** Semantic HTML5, CSS layers with OKLCH tokens, vanilla JavaScript UMD modules, Node's built-in test runner, Wikimedia Commons documentary assets.

## Global Constraints

- No framework or build dependency.
- Norwegian, English, and Russian coverage for every new reader-facing string.
- Generated imagery is decorative only and never historical evidence.
- Documentary images require creator, date, license, source page, translated alt text, and caption.
- No dialog, pseudo-page, horizontal era scrollbar, top reading-progress strip, or oversized dual hero CTA.
- Preserve WCAG 2.2 AA intent, keyboard navigation, focus movement, reduced motion, and 320 px support.
- The workspace is not a Git repository; replace commit steps with a full targeted test checkpoint and do not initialize Git without user instruction.

---

## File structure

- Create `js/search-core.js`: pure search indexing, normalization, ranking, and result grouping.
- Modify `js/content.js`: chapter sections, person/place/media records, Zelimkhan event and sources, new interface translations.
- Modify `js/app.js`: inline reader rendering, global search UI, explicit scroll/focus/hash navigation, chapter expansion state.
- Modify `index.html`: compact masthead, search region, contents region, inline chronicle shell; remove dialog/era rail/read progress.
- Modify `styles.css`: editorial hierarchy, compact hero, search results, inline chapters, denser timeline, documentary figures.
- Create `assets/documentary/*`: locally served, verified historical media.
- Create `tests/search.test.js`: search behavior.
- Modify `tests/app.test.js`, `tests/history.test.js`, and `tests/styles.test.js`: navigation/content/structural contracts.

---

### Task 1: Global search domain

**Files:**
- Create: `js/search-core.js`
- Create: `tests/search.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: content objects shaped as `{ chapters, events, people, sources }` and active language `no | en | ru`.
- Produces: `SearchCore.buildSearchIndex(content, lang)` and `SearchCore.searchIndex(index, query, limit = 12)`.
- Search result shape: `{ id, type: 'person'|'event'|'chapter'|'source', label, description, chapterId, targetId, score }`.

- [ ] **Step 1: Write failing search tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const search = require('../js/search-core.js');
const content = require('../js/content.js');

test('global search finds Zelimkhan through Latin and Cyrillic aliases', () => {
  const noIndex = search.buildSearchIndex(content, 'no');
  const ruIndex = search.buildSearchIndex(content, 'ru');
  assert.equal(search.searchIndex(noIndex, 'zelimkhan')[0].id, 'zelimkhan');
  assert.equal(search.searchIndex(ruIndex, 'Зелимхан')[0].id, 'zelimkhan');
});

test('global search groups people before lower-scoring prose matches', () => {
  const index = search.buildSearchIndex(content, 'en');
  const results = search.searchIndex(index, 'Shamil');
  assert.ok(results.some((item) => item.type === 'event'));
  assert.ok(results[0].score >= results.at(-1).score);
});

test('normalization handles punctuation and diacritics', () => {
  assert.equal(search.normalizeSearchText('Šeikh-Mansūr'), 'seikh mansur');
});
```

- [ ] **Step 2: Run the new tests and verify the module/content failures**

Run: `node --test tests\search.test.js`

Expected: FAIL because `js/search-core.js` and `content.people` do not exist.

- [ ] **Step 3: Implement the pure UMD search module**

Implement:

```js
function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function searchIndex(index, query, limit = 12) {
  const needle = normalizeSearchText(query);
  if (needle.length < 2) return [];
  return index
    .map((item) => ({ ...item, score: scoreItem(item, needle) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit);
}
```

Ranking: exact canonical/alias match `100`, label prefix `80`, label inclusion `60`, keyword inclusion `35`, prose inclusion `15`; add `10` for person records.

- [ ] **Step 4: Add `js/search-core.js` before `js/app.js` in `index.html`**

```html
<script defer src="js/search-core.js"></script>
```

- [ ] **Step 5: Run targeted tests**

Run: `node --test tests\search.test.js tests\history.test.js`

Expected: search tests still fail only because Zelimkhan content is not yet present; module normalization tests pass.

---

### Task 2: Structured chapters, people, and documentary media

**Files:**
- Modify: `js/content.js`
- Modify: `tests/history.test.js`
- Create: `assets/documentary/imam-shamil-1859.jpg`
- Create: `assets/documentary/operation-lentil-map.svg`
- Create: `assets/documentary/grozny-oil-1910.jpg`
- Create: `assets/documentary/khaibakh-towers-1888.jpg`

**Interfaces:**
- Produces `content.people`, `content.places`, and `content.media`.
- Person shape: `{ id, name, aliases: string[], lifespan, summary: Translation, chapterId, eventIds, sourceIds }`.
- Chapter `sections`: `[{ id, title: Translation, body: Translation, eventIds: string[], mediaId?: string }]`.
- Media shape: `{ id, src, sourceUrl, creator, date, license, alt: Translation, caption: Translation, width, height }`.

- [ ] **Step 1: Extend content tests before data changes**

```js
test('Zelimkhan is a sourced multilingual person linked to imperial rule', () => {
  const person = content.people.find((item) => item.id === 'zelimkhan');
  assert.equal(person.chapterId, 'imperial-rule');
  assert.ok(person.aliases.includes('Зелимхан Гушмазукаев'));
  assert.ok(person.sourceIds.length >= 1);
  for (const lang of ['no', 'en', 'ru']) assert.ok(person.summary[lang]);
});

test('chapter sections and documentary media reference known records', () => {
  const mediaIds = new Set(content.media.map((item) => item.id));
  for (const chapter of content.chapters) {
    assert.ok(chapter.sections.length >= 2, `${chapter.id} needs sections`);
    for (const section of chapter.sections) {
      for (const lang of ['no', 'en', 'ru']) assert.ok(section.title[lang] && section.body[lang]);
      if (section.mediaId) assert.ok(mediaIds.has(section.mediaId));
    }
  }
});
```

- [ ] **Step 2: Run tests and verify missing schema failure**

Run: `node --test tests\history.test.js tests\search.test.js`

Expected: FAIL on missing `content.people`, `content.media`, and `chapter.sections`.

- [ ] **Step 3: Add Zelimkhan source, event, person, and aliases**

Add source ID `badaeva-zelimkhan`, author L. A. Badaeva, title `К истории становления Зелимхана Гушмазукаева на путь абречества`, year 2018, URL `https://storage.ucomplex.org/files/users/-1/b56b97d680778322.pdf?t=1760563564`.

Add an `imperial-rule` event dated `1901–1913`, confidence `strong`, describing Zelimkhan as a Kharachoy peasant who became an abrek amid conflict with imperial administration, while distinguishing archival biography from later heroic memory. Do not flatten the debated term `abrek` into either “bandit” or “freedom fighter.”

Use aliases:

```js
[
  'Zelimkhan', 'Zelimkhan Gushmazukaev', 'Zelimkhan Kharachoevsky',
  'Zelimxan', 'Зелимхан', 'Зелимхан Гушмазукаев',
  'Зелимхан Харачоевский', 'Харачойн Зеламха', 'ГӀузмакъий Заьлмаха'
]
```

- [ ] **Step 4: Split every chapter into two explicit translated sections**

Use the existing two body paragraphs as section bodies and add these canonical section concepts in Norwegian/English/Russian:

| Chapter | Section 1 | Section 2 |
|---|---|---|
| deep-past | Material traces | Names and limits |
| durdzuk | Chronicle geography | Faith across the passes |
| simsim | Invasion and fortification | What Simsim can mean |
| frontiers | Plains, diplomacy and Islam | Sheikh Mansur |
| caucasian-war | Fortress and conquest | Imamate and 1859 |
| imperial-rule | Displacement and resistance | Oil and unequal modernity |
| revolution | Mountain Republic | Soviet consolidation |
| aardakh | Deportation | Exile and return |
| return | Rebuilt autonomy | Memory and sovereignty |
| ichkeria | Break with Moscow | The First Chechen War |
| second-war | Renewed invasion | Civilian harm and Chechenisation |
| today | Law and authoritarian rule | Diaspora and an open future |

Attach event IDs to the matching section; include the new Zelimkhan event in `imperial-rule` section 1.

- [ ] **Step 5: Download four verified documentary assets locally**

Use Wikimedia Commons `Special:Redirect/file/` downloads and preserve unmodified originals:

```powershell
curl.exe -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shamil_by_Denier.jpg" -o "assets/documentary/imam-shamil-1859.jpg"
curl.exe -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Operation_Lentil_(Caucasus).svg" -o "assets/documentary/operation-lentil-map.svg"
curl.exe -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Grozny-j-neft-1915.jpg" -o "assets/documentary/grozny-oil-1910.jpg"
curl.exe -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Башенный_поселок_Хайбах._Рисунок_Вс_Миллера_(1888).jpg" -o "assets/documentary/khaibakh-towers-1888.jpg"
```

Recorded rights:

- Andrey Denyer, portrait of Imam Shamil, 1859, public domain, source page `https://commons.wikimedia.org/wiki/File:Shamil_by_Denier.jpg`.
- Takhirgeran Umar, Operation Lentil map, 2016, CC BY-SA 4.0, source page `https://commons.wikimedia.org/wiki/File:Operation_Lentil_(Caucasus).svg`.
- Unknown author, Grozny oil district, circa 1910, public domain, source page `https://commons.wikimedia.org/wiki/File:Grozny-j-neft-1915.jpg`.
- Vsevolod Miller, Khaibakh tower settlement drawing, 1888, public domain, source page `https://commons.wikimedia.org/wiki/File:Башенный_поселок_Хайбах._Рисунок_Вс_Миллера_(1888).jpg`.

- [ ] **Step 6: Add media records and attach them to sections**

Attach Khaibakh to `deep-past` or `durdzuk` as an architectural document with a caption explicitly dated 1888; Shamil to `caucasian-war`; Grozny oil to `imperial-rule`; Operation Lentil map to `aardakh`. Record actual pixel dimensions after download using an image metadata command.

- [ ] **Step 7: Run content and search tests**

Run: `node --test tests\history.test.js tests\search.test.js`

Expected: PASS.

---

### Task 3: Replace modal shell with same-page editorial structure

**Files:**
- Modify: `index.html`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Produces fixed containers: `#global-search`, `#global-search-results`, `#contents`, `#chronicle-articles`, `#timeline-results`, and `#source-cabinet`.
- Removes: `#chapter-dialog`, `#era-rail`, `#featured-chapter`, `.read-progress`, and `.hero-ridge`.

- [ ] **Step 1: Add failing structural tests**

```js
test('page shell uses global search and inline articles without modal-era UI', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="global-search"/);
  assert.match(html, /id="global-search-results"/);
  assert.match(html, /id="chronicle-articles"/);
  assert.doesNotMatch(html, /chapter-dialog|era-rail|read-progress|hero-ridge/);
});
```

- [ ] **Step 2: Run structural test and verify failure**

Run: `node --test tests\styles.test.js`

Expected: FAIL because the old shell remains.

- [ ] **Step 3: Rebuild the semantic HTML shell**

Create this order inside `<main>`:

```html
<section class="hero" id="top">…compact title…</section>
<section class="discovery" aria-labelledby="discovery-title">
  <label for="global-search" id="discovery-title">…</label>
  <input id="global-search" role="combobox" aria-autocomplete="list"
    aria-controls="global-search-results" aria-expanded="false">
  <div id="global-search-results" role="listbox"></div>
</section>
<nav class="contents" id="contents" aria-labelledby="contents-title"></nav>
<section class="chronicle" id="chronicle">
  <div id="chronicle-articles"></div>
</section>
<section class="timeline-section" id="timeline">…existing controls/results…</section>
<section class="method-section" id="method">…</section>
<section class="sources-section" id="sources">…</section>
```

Keep one hero action linking to `#contents` and a quiet inline link to `#timeline`.

- [ ] **Step 4: Remove dialog-specific and era-transition HTML**

Delete the dialog, curtain, ridge SVG, top progress bar, horizontal era nav container, featured chapter container, and duplicate volume article list.

- [ ] **Step 5: Run structural test**

Run: `node --test tests\styles.test.js`

Expected: PASS for shell contract; CSS legacy selectors may still exist until Task 5.

---

### Task 4: Inline reader, exact target navigation, and search UI

**Files:**
- Modify: `js/app.js`
- Modify: `tests/app.test.js`

**Interfaces:**
- Produces `parseTargetHash(hash)`, `resolveArticleTarget(content, result)`, and exported pure helper `getScrollBehavior(prefersReducedMotion)`.
- Runtime functions: `openArticle(chapterId, targetId, { updateHistory = true } = {})`, `scrollToTarget(targetId, { updateHistory = true } = {})`, `toggleChapter(chapterId, forceOpen)`.

- [ ] **Step 1: Write failing navigation helper tests**

```js
test('parseTargetHash resolves chapter and event hashes', () => {
  assert.deepEqual(app.parseTargetHash('#event=zelimkhan-1901'), { type: 'event', id: 'zelimkhan-1901' });
  assert.deepEqual(app.parseTargetHash('#chapter=imperial-rule'), { type: 'chapter', id: 'imperial-rule' });
  assert.equal(app.parseTargetHash('#sources'), null);
});

test('reduced motion disables smooth programmatic scrolling', () => {
  assert.equal(app.getScrollBehavior(true), 'auto');
  assert.equal(app.getScrollBehavior(false), 'smooth');
});
```

- [ ] **Step 2: Run tests and verify missing helpers**

Run: `node --test tests\app.test.js`

Expected: FAIL because the new helpers are absent.

- [ ] **Step 3: Replace dialog state with expanded chapter state**

Use:

```js
const state = {
  lang: persistedLanguage,
  expandedChapterIds: new Set(),
  filters: { chapterId: 'all', confidence: 'all', query: '' },
  globalQuery: '',
  activeSearchIndex: [],
};
```

Remove `lastFocus`, `renderDialog`, `openChapter`, `closeDialog`, `selectChapter`, and all dialog/era-transition listeners.

- [ ] **Step 4: Render typographic contents and inline chapter articles**

Each article must include:

```html
<article class="chapter-article" id="chapter-{id}" data-chapter-id="{id}">
  <header>…volume, range, title, deck…</header>
  <nav class="chapter-contents">…section links…</nav>
  <div class="chapter-preview">…first section opening…</div>
  <div class="chapter-full" id="chapter-body-{id}" hidden>…all sections and sources…</div>
  <button data-toggle-chapter="{id}" aria-expanded="false"
    aria-controls="chapter-body-{id}">Continue reading</button>
</article>
```

Every event gets `<span id="event-{event.id}" class="event-anchor" tabindex="-1">` immediately before the paragraph or event list item it targets.

- [ ] **Step 5: Implement exact scroll/focus behaviour**

```js
function openArticle(chapterId, targetId, options = {}) {
  toggleChapter(chapterId, true);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    scrollToTarget(targetId || `chapter-${chapterId}`, options);
  }));
}
```

`scrollToTarget` must call `element.scrollIntoView({ block: 'start', behavior })`, then `element.focus({ preventScroll: true })`; CSS `scroll-margin-top` handles the fixed header. Add `.is-targeted` for 2.4 seconds and remove it with a single timeout.

- [ ] **Step 6: Implement global search rendering and keyboard behaviour**

- Input updates results after every keystroke of length 2+.
- ArrowDown/ArrowUp moves the active option.
- Enter opens the active result.
- Escape clears results and returns focus to the input.
- Result click calls `openArticle` for people/events/chapters or scrolls to a source row for sources.
- Update `aria-expanded`, `aria-activedescendant`, and a polite result-count status.

- [ ] **Step 7: Change timeline actions to exact article targets**

Replace `data-open-chapter` with `data-open-article="{chapterId}" data-target-id="event-{event.id}"`. Bind one delegated click listener on `#timeline-results` rather than rebinding every result after render.

- [ ] **Step 8: Make hero/navigation links explicit**

Intercept `[data-scroll-target]` clicks and call `scrollToTarget`. Use `#contents` for the primary hero action and `#timeline` for the quiet link.

- [ ] **Step 9: Implement history restoration**

Use `history.pushState` for user-selected chapter/event results and a `popstate` listener that resolves the current hash and calls `openArticle(..., { updateHistory: false })`.

- [ ] **Step 10: Run app, search, and history tests**

Run: `node --test tests\app.test.js tests\search.test.js tests\history.test.js`

Expected: PASS.

---

### Task 5: Editorial visual redesign

**Files:**
- Modify: `styles.css`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Styles the fixed HTML and state classes from Tasks 3–4.
- State classes: `.is-open`, `.is-targeted`, `.is-search-open`, and `[hidden]`.

- [ ] **Step 1: Replace old visual contract tests with editorial constraints**

```js
assert.doesNotMatch(css, /\.era-rail|\.chapter-dialog|\.read-progress|\.hero-ridge/);
assert.match(css, /\.hero\s*\{[^}]*min-height:\s*min\(/s);
assert.match(css, /\.chapter-prose\s*\{[^}]*max-width:\s*7[02]ch/s);
assert.match(css, /\.global-search-results/);
assert.match(css, /\.event-anchor\.is-targeted/);
assert.match(css, /@media\s*\(max-width:\s*720px\)/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
```

- [ ] **Step 2: Run CSS tests and verify legacy-selector failure**

Run: `node --test tests\styles.test.js`

Expected: FAIL on legacy selectors and missing editorial classes.

- [ ] **Step 3: Rebuild hero styling**

- Desktop hero uses `min-height: min(680px, 78svh)` and a two-column editorial composition.
- Title scale is `clamp(3.4rem, 7vw, 6.4rem)` with `max-width: 10ch`; do not force three lines.
- Mountain art occupies the lower/right plate with opacity `0.82`; remove animated ridge and multi-panel reveal.
- One filled brass text action and one underlined inline link.
- Disable cover blur animation; use at most a 400 ms opacity transition.

- [ ] **Step 4: Style discovery and contents as publication tools**

- Search region sits on paper white, overlaps the hero edge by no more than `2rem`, and uses a plain ruled input.
- Results are a bordered editorial list, not floating rounded cards.
- Contents use volume rows with date gutter, title, and chapter links separated by rules.

- [ ] **Step 5: Style inline articles for reading**

- Article grid: `180px minmax(0, 72ch)` on desktop; one column below 800 px.
- Prose uses `clamp(1.03rem, 1.2vw, 1.16rem)` and line-height `1.78`.
- Section headings are `clamp(1.9rem, 3vw, 2.8rem)`, not hero-sized.
- Expansion button is a text control with a rule and 44 px minimum height.
- Documentary figures alternate between inline wide and right-margin placements; captions remain visible.

- [ ] **Step 6: Densify timeline**

- Reduce event vertical padding to `1.5–2.25rem`.
- Event titles max at `2rem` desktop and `1.7rem` mobile.
- Keep evidence labels, date line, summary, “Go to article,” and source link.

- [ ] **Step 7: Remove visible horizontal scrollbar UI**

No horizontally scrollable navigation remains. Do not hide the normal vertical page scrollbar; the removed component, not scrolling itself, is the problem.

- [ ] **Step 8: Add target, focus, mobile, and reduced-motion states**

Use a madder left rule plus pale background for `.is-targeted`, a visible brass focus outline, and `scroll-margin-top: calc(var(--header) + 1.5rem)` on chapters/sections/events.

- [ ] **Step 9: Run CSS and full tests**

Run: `node --test tests\*.test.js`

Expected: PASS.

---

### Task 6: Integration verification and cleanup

**Files:**
- Modify only if verification exposes a defect.

**Interfaces:**
- Verifies the finished local site at `http://127.0.0.1:4173/`.

- [ ] **Step 1: Run syntax and full automated checks**

```powershell
node --test tests\*.test.js
Get-ChildItem js -Filter '*.js' | ForEach-Object { node --check $_.FullName }
```

Expected: all tests and syntax checks pass.

- [ ] **Step 2: Check all local resources**

Request `/`, `/styles.css`, every script, the hero image, and all four documentary assets from the local server. Every response must be HTTP 200 with non-zero bytes.

- [ ] **Step 3: Run the Impeccable detector**

Run the bundled `detect.mjs` against `index.html styles.css`. Fix any generic-UI or layout-transition findings that conflict with the approved spec.

- [ ] **Step 4: Verify the user journeys**

Check:

1. “Start reading” lands at contents.
2. “Timeline” lands at timeline.
3. `Zelimkhan`, `Zelimxan`, and `Зелимхан` return the person record.
4. Selecting Zelimkhan expands `imperial-rule` and focuses the Zelimkhan event.
5. Timeline actions expand and focus their exact event without corrective scrolling.
6. “Continue reading” and “Show less” preserve sensible viewport position.
7. Browser back restores prior chapter/event target.
8. Norwegian, English, and Russian preserve expanded state.
9. Keyboard-only search and chapter controls work.
10. Layout has no horizontal overflow at 320, 500, 1024, and 1440 px.

- [ ] **Step 5: Final evidence checkpoint**

Record test count, content counts, asset counts, and any remaining limitation in the handoff. Do not claim visual browser verification if direct browser control is unavailable; state exactly which automated and manual checks were completed.
