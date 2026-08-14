const test = require('node:test');
const assert = require('node:assert/strict');

const content = require('../js/content.js');
const museum = require('../js/museum-core.js');

test('opening exhibition resolves to the first curated record', () => {
  assert.equal(museum.getOpeningExhibition(content).id, 'aardakh-exhibition');
});

test('period events are chronological and stay inside the period chapters', () => {
  const events = museum.getPeriodEvents(content, 'aardakh-return');
  assert.deepEqual(events.map((event) => event.year), [...events.map((event) => event.year)].sort((a, b) => a - b));
  assert.ok(events.every((event) => ['aardakh', 'return'].includes(event.chapterId)));
});

test('related exhibition entities resolve without dangling ids', () => {
  const exhibition = museum.getOpeningExhibition(content);
  const related = museum.getRelatedEntities(content, exhibition);
  assert.deepEqual(related.chapters.map((chapter) => chapter.id), ['aardakh', 'return']);
  assert.deepEqual(related.media.map((item) => item.id), ['lentil-map']);
  assert.deepEqual(related.sources.map((source) => source.id), ['ussr1944', 'deport-study', 'tishkov']);
});
