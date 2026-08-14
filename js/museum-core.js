(function attachMuseumCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MuseumCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createMuseumCore() {
  function getOpeningExhibition(content) {
    return (content.exhibitions || [])[0] || null;
  }

  function getPeriod(content, periodId) {
    return (content.periods || []).find((period) => period.id === periodId) || null;
  }

  function getPeriodEvents(content, periodId) {
    const period = getPeriod(content, periodId);
    if (!period) return [];
    const chapterIds = new Set(period.chapterIds || []);
    return (content.events || [])
      .filter((event) => chapterIds.has(event.chapterId))
      .slice()
      .sort((a, b) => a.year - b.year || String(a.id).localeCompare(String(b.id)));
  }

  function resolveByIds(items, ids) {
    const index = new Map((items || []).map((item) => [item.id, item]));
    return (ids || []).map((id) => index.get(id)).filter(Boolean);
  }

  function getRelatedEntities(content, exhibition) {
    if (!exhibition) return { chapters: [], people: [], media: [], sources: [] };
    return {
      chapters: resolveByIds(content.chapters, exhibition.relatedChapterIds),
      people: resolveByIds(content.people, exhibition.relatedPersonIds),
      media: resolveByIds(content.media, exhibition.relatedMediaIds),
      sources: resolveByIds(content.sources, exhibition.sourceIds),
    };
  }

  return { getOpeningExhibition, getPeriod, getPeriodEvents, getRelatedEntities };
});
