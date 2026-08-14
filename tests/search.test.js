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

test('global search ranks canonical labels above prose matches', () => {
  const index = search.buildSearchIndex(content, 'en');
  const results = search.searchIndex(index, 'Shamil');
  assert.ok(results.some((item) => item.type === 'event'));
  assert.ok(results[0].score >= results.at(-1).score);
});

test('normalization handles punctuation and diacritics', () => {
  assert.equal(search.normalizeSearchText('Šeikh-Mansūr'), 'seikh mansur');
});

test('queries shorter than two characters return no results', () => {
  const index = search.buildSearchIndex(content, 'en');
  assert.deepEqual(search.searchIndex(index, 's'), []);
});

test('search indexes exhibitions and documentary objects', () => {
  const index = search.buildSearchIndex(content, 'en');
  assert.equal(search.searchIndex(index, 'deportation return')[0].type, 'exhibition');
  assert.ok(search.searchIndex(index, 'operation lentil').some((item) => item.type === 'media'));
});

test('groupSearchResults retains entity-type order', () => {
  const grouped = search.groupSearchResults([
    { type: 'person', id: 'p' },
    { type: 'event', id: 'e' },
    { type: 'person', id: 'p2' },
  ]);
  assert.deepEqual(Object.keys(grouped), ['person', 'event']);
  assert.equal(grouped.person.length, 2);
});
