const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../js/content.js');
const app = require('../js/app.js');

test('formatYear renders BCE and CE dates in each supported language', () => {
  assert.equal(app.formatYear(-700, 'en'), '700 BCE');
  assert.equal(app.formatYear(-700, 'no'), '700 f.Kr.');
  assert.equal(app.formatYear(-700, 'ru'), '700 г. до н. э.');
  assert.equal(app.formatYear(1991, 'en'), '1991');
});

test('formatDateLabel localizes historical date labels without changing English', () => {
  assert.equal(app.formatDateLabel('23 Feb 1944', 'en'), '23 Feb 1944');
  assert.equal(app.formatDateLabel('23 Feb 1944', 'no'), '23. feb. 1944');
  assert.equal(app.formatDateLabel('23 Feb 1944', 'ru'), '23 февр. 1944');
  assert.equal(app.formatDateLabel('ca. 700 BCE', 'no'), 'ca. 700 f.Kr.');
  assert.equal(app.formatDateLabel('ca. 700 BCE', 'ru'), 'ок. 700 г. до н. э.');
  assert.equal(app.formatDateLabel('ca. 1200 BCE–500 CE', 'no'), 'ca. 1200 f.Kr.–500 e.Kr.');
  assert.equal(app.formatDateLabel('ca. 1200 BCE–500 CE', 'ru'), 'ок. 1200 г. до н. э.–500 н. э.');
  assert.equal(app.formatDateLabel('late 1980s', 'no'), 'sent i 1980-årene');
  assert.equal(app.formatDateLabel('late 1980s', 'ru'), 'конец 1980-х');
});

test('chapterFromHash resolves only known chapter ids', () => {
  assert.equal(app.chapterFromHash('#chapter=caucasian-war', content.chapters).id, 'caucasian-war');
  assert.equal(app.chapterFromHash('#chapter=missing', content.chapters), null);
  assert.equal(app.chapterFromHash('', content.chapters), null);
});

test('source links permit http urls and local anchors only', () => {
  assert.equal(app.safeHref('https://example.com/a'), 'https://example.com/a');
  assert.equal(app.safeHref('#method'), '#method');
  assert.equal(app.safeHref('javascript:alert(1)'), '#');
});
