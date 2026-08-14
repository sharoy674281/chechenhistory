const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('stylesheet carries the accessibility and responsive visual contract', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /oklch\(/);
  assert.doesNotMatch(css, /background-clip:\s*text/);
  assert.doesNotMatch(css, /border-radius:\s*(3[2-9]|[4-9]\d)px/);
  assert.match(css, /\.hero::after\s*\{[^}]*z-index:\s*1/s, 'hero art needs a foreground scrim behind copy');
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.site-header\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+auto/s, 'mobile header must reserve columns for all language and menu controls');
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.wordmark small\s*\{[^}]*display:\s*none/s, 'very narrow screens should prioritize the title and controls');
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.language-buttons\s*\{[^}]*display:\s*none/s, 'mobile should replace the three language buttons with one compact control');
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.language-select\s*\{[^}]*display:\s*block/s, 'mobile compact language control must be visible');
});

test('page shell is a curated museum with a separate reading room', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const id of ['museum-home', 'opening-exhibition', 'period-index', 'curated-gallery', 'archive-search', 'reader-room', 'reader-contents', 'reader-article', 'reader-context', 'timeline-track']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /class="hero"/);
  assert.doesNotMatch(html, /chechen-mountain-chronicle\.png/);
});
