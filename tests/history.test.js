const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { pickTranslation } = require('../js/i18n.js');
const { filterEvents, chapterProgress } = require('../js/history-core.js');
const content = require('../js/content.js');

test('pickTranslation returns the requested language', () => {
  assert.equal(pickTranslation({ no: 'Fjell', en: 'Mountain', ru: 'Гора' }, 'ru'), 'Гора');
});

test('pickTranslation falls back to English and then the first available value', () => {
  assert.equal(pickTranslation({ en: 'Archive', no: 'Arkiv' }, 'ru'), 'Archive');
  assert.equal(pickTranslation({ no: 'Minne' }, 'ru'), 'Minne');
  assert.equal(pickTranslation(null, 'no'), '');
});

const sampleEvents = [
  {
    id: 'koban',
    chapterId: 'deep-past',
    year: -700,
    confidence: 'strong',
    title: { no: 'Koban-horisonten', en: 'Koban horizon', ru: 'Кобанская культура' },
    summary: { no: 'Arkeologi', en: 'Archaeology', ru: 'Археология' },
  },
  {
    id: 'simsim',
    chapterId: 'medieval',
    year: 1395,
    confidence: 'probable',
    title: { no: 'Simsim', en: 'Simsim', ru: 'Симсим' },
    summary: { no: 'Timurs felttog', en: "Timur's campaign", ru: 'Поход Тимура' },
  },
];

test('filterEvents combines chapter, confidence, and translated search filters', () => {
  assert.deepEqual(
    filterEvents(sampleEvents, { chapterId: 'deep-past', confidence: 'strong', query: 'arkeologi', lang: 'no' }).map((e) => e.id),
    ['koban'],
  );
  assert.deepEqual(filterEvents(sampleEvents, { query: 'тимура', lang: 'ru' }).map((e) => e.id), ['simsim']);
});

test('filterEvents returns every event for empty filters', () => {
  assert.equal(filterEvents(sampleEvents, {}).length, 2);
});

test('chapterProgress returns stable progress with unknown ids handled', () => {
  const chapters = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(chapterProgress(chapters, 'a'), 0);
  assert.equal(chapterProgress(chapters, 'b'), 0.5);
  assert.equal(chapterProgress(chapters, 'c'), 1);
  assert.equal(chapterProgress(chapters, 'missing'), 0);
});

test('content defines four volumes and twelve chronological chapters through 2026', () => {
  assert.equal(content.volumes.length, 4);
  assert.equal(content.chapters.length, 12);
  assert.deepEqual(content.chapters.map((chapter) => chapter.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.ok(Math.max(...content.events.map((event) => event.year)) >= 2026);
});

test('chapter and event reader-facing fields cover Norwegian, English, and Russian', () => {
  const required = ['no', 'en', 'ru'];
  for (const chapter of content.chapters) {
    for (const field of ['title', 'deck', 'body']) {
      for (const lang of required) assert.ok(chapter[field][lang], `${chapter.id}.${field}.${lang} is missing`);
    }
  }
  for (const event of content.events) {
    for (const field of ['title', 'summary']) {
      for (const lang of required) assert.ok(event[field][lang], `${event.id}.${field}.${lang} is missing`);
    }
  }
});

test('every static interface label covers Norwegian, English, and Russian', () => {
  const required = ['no', 'en', 'ru'];
  const labels = [
    'scopeSpan', 'chronicleIntro', 'timelineIntro', 'evidenceLabel', 'volume',
    'earth', 'earthNote', 'textLayer', 'textLayerNote', 'voice', 'voiceNote',
    'crossReading', 'crossReadingNote', 'footerText', 'backToTop', 'imageAlt',
    'imageCaption', 'menu', 'language', 'sourceTypes',
  ];
  for (const label of labels) {
    assert.ok(content.ui[label], `ui.${label} is missing`);
    if (label === 'sourceTypes') continue;
    for (const lang of required) assert.ok(content.ui[label][lang], `ui.${label}.${lang} is missing`);
  }
  for (const value of Object.values(content.ui.sourceTypes)) {
    for (const lang of required) assert.ok(value[lang], `source type translation is missing ${lang}`);
  }
});

test('every event belongs to a chapter and references listed sources', () => {
  const chapterIds = new Set(content.chapters.map((chapter) => chapter.id));
  const sourceIds = new Set(content.sources.map((source) => source.id));
  for (const event of content.events) {
    assert.ok(chapterIds.has(event.chapterId), `${event.id} has an unknown chapter`);
    assert.ok(event.sourceIds.length > 0, `${event.id} has no sources`);
    for (const id of event.sourceIds) assert.ok(sourceIds.has(id), `${event.id} references unknown source ${id}`);
  }
  for (const source of content.sources) {
    assert.ok(content.ui.sourceTypes[source.type], `source type ${source.type} has no translation`);
  }
  assert.ok(content.events.some((event) => event.confidence === 'oral'), 'the record should include explicitly labelled oral-memory evidence');
});

test('research tools and generated reports are never presented as historical sources', () => {
  assert.equal(content.sources.some((source) => /chatgpt|deep research/i.test(`${source.author} ${source.title}`)), false);
  assert.equal(content.sources.some((source) => source.id === 'report'), false);
  assert.equal(content.events.some((event) => event.sourceIds.includes('report')), false);
});

test('the catalogue includes Zelimkhan as a searchable historical person with a sourced event', () => {
  const person = content.people.find((item) => item.id === 'zelimkhan');
  assert.ok(person, 'Zelimkhan person record is missing');
  assert.ok(person.aliases.some((alias) => /zelimkhan/i.test(alias)));
  assert.ok(person.aliases.some((alias) => /Зелимхан/u.test(alias)));
  const event = content.events.find((item) => item.id === 'zelimkhan-1901');
  assert.ok(event, 'Zelimkhan event is missing');
  assert.ok(event.sourceIds.includes('badaeva-zelimkhan'));
  assert.ok(content.sources.some((source) => source.id === 'badaeva-zelimkhan'));
});

test('every chapter is divided into readable sections linked to known events', () => {
  const eventIds = new Set(content.events.map((event) => event.id));
  for (const chapter of content.chapters) {
    assert.equal(chapter.sections.length, 2, `${chapter.id} should have two reading sections`);
    for (const section of chapter.sections) {
      for (const lang of ['no', 'en', 'ru']) {
        assert.ok(section.title[lang], `${section.id}.title.${lang} is missing`);
        assert.ok(section.body[lang], `${section.id}.body.${lang} is missing`);
      }
      for (const eventId of section.eventIds) {
        assert.ok(eventIds.has(eventId), `${section.id} references unknown event ${eventId}`);
      }
    }
  }
});

test('documentary media records have licensing, attribution, and valid chapter placement', () => {
  const chapterIds = new Set(content.chapters.map((chapter) => chapter.id));
  assert.ok(content.media.length >= 4);
  for (const item of content.media) {
    assert.ok(chapterIds.has(item.chapterId), `${item.id} has an unknown chapter`);
    assert.ok(item.src && item.sourceUrl && item.license && item.attribution);
    assert.ok(fs.existsSync(path.join(__dirname, '..', item.src)), `${item.src} is missing from disk`);
    for (const lang of ['no', 'en', 'ru']) assert.ok(item.alt[lang], `${item.id}.alt.${lang} is missing`);
  }
});
