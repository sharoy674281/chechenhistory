(function attachSearchCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SearchCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createSearchCore() {
  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  function pick(value, lang) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return value[lang] || value.en || Object.values(value).find(Boolean) || '';
  }

  function createItem({ id, type, label, description, aliases = [], keywords = [], prose = '', chapterId = null, targetId }) {
    return {
      id,
      type,
      label,
      description,
      chapterId,
      targetId,
      canonical: normalizeSearchText(label),
      aliases: aliases.map(normalizeSearchText).filter(Boolean),
      keywords: normalizeSearchText(keywords.join(' ')),
      prose: normalizeSearchText(prose),
    };
  }

  function buildSearchIndex(content, lang = 'en') {
    const chapters = (content.chapters || []).map((chapter) => createItem({
      id: chapter.id,
      type: 'chapter',
      label: pick(chapter.title, lang),
      description: `${chapter.range} · ${pick(chapter.deck, lang)}`,
      keywords: [chapter.range, ...(chapter.searchAliases || [])],
      prose: [pick(chapter.deck, lang), pick(chapter.body, lang), ...(chapter.sections || []).flatMap((section) => [pick(section.title, lang), pick(section.body, lang)])].join(' '),
      chapterId: chapter.id,
      targetId: `chapter-${chapter.id}`,
    }));

    const events = (content.events || []).map((event) => createItem({
      id: event.id,
      type: 'event',
      label: pick(event.title, lang),
      description: `${event.dateLabel || event.year} · ${pick(event.summary, lang)}`,
      aliases: event.aliases || [],
      keywords: [event.dateLabel || String(event.year), event.confidence],
      prose: pick(event.summary, lang),
      chapterId: event.chapterId,
      targetId: `event-${event.id}`,
    }));

    const people = (content.people || []).map((person) => createItem({
      id: person.id,
      type: 'person',
      label: pick(person.name, lang),
      description: `${person.lifespan} · ${pick(person.summary, lang)}`,
      aliases: person.aliases || [],
      keywords: person.eventIds || [],
      prose: pick(person.summary, lang),
      chapterId: person.chapterId,
      targetId: person.eventIds?.length ? `event-${person.eventIds[0]}` : `chapter-${person.chapterId}`,
    }));

    const places = (content.places || []).map((place) => createItem({
      id: place.id,
      type: 'place',
      label: pick(place.name, lang),
      description: pick((content.chapters || []).find((chapter) => chapter.id === place.chapterId)?.title, lang),
      aliases: place.aliases || [],
      keywords: place.eventIds || [],
      chapterId: place.chapterId,
      targetId: place.eventIds?.length ? `event-${place.eventIds[0]}` : `chapter-${place.chapterId}`,
    }));

    const sources = (content.sources || []).map((source) => createItem({
      id: source.id,
      type: 'source',
      label: source.title,
      description: `${source.author} · ${source.year}`,
      keywords: [source.author, source.year, source.type],
      targetId: `source-${source.id}`,
    }));

    return [...people, ...places, ...events, ...chapters, ...sources];
  }

  function scoreItem(item, needle) {
    let score = 0;
    if (item.canonical === needle || item.aliases.includes(needle)) score = 100;
    else if (item.canonical.startsWith(needle) || item.aliases.some((value) => value.startsWith(needle))) score = 80;
    else if (item.canonical.includes(needle) || item.aliases.some((value) => value.includes(needle))) score = 60;
    else if (item.keywords.includes(needle)) score = 35;
    else if (item.prose.includes(needle)) score = 15;
    if (score && item.type === 'person') score += 10;
    return score;
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

  return { normalizeSearchText, buildSearchIndex, searchIndex, scoreItem };
});
