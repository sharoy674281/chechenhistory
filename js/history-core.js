(function attachHistoryCore(root, factory) {
  const i18n = typeof module === 'object' && module.exports ? require('./i18n.js') : root.HistoryI18n;
  const api = factory(i18n);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HistoryCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createHistoryCore(i18n) {
  const normalize = (value) => String(value || '').normalize('NFKD').toLocaleLowerCase();

  function filterEvents(events, filters = {}) {
    const query = normalize(filters.query).trim();
    return events.filter((event) => {
      if (filters.chapterId && filters.chapterId !== 'all' && event.chapterId !== filters.chapterId) return false;
      if (filters.confidence && filters.confidence !== 'all' && event.confidence !== filters.confidence) return false;
      if (!query) return true;
      const haystack = [
        i18n.pickTranslation(event.title, filters.lang),
        i18n.pickTranslation(event.summary, filters.lang),
        event.dateLabel,
      ].map(normalize).join(' ');
      return haystack.includes(query);
    });
  }

  function chapterProgress(chapters, id) {
    if (!Array.isArray(chapters) || chapters.length < 2) return 0;
    const index = chapters.findIndex((chapter) => chapter.id === id);
    return index < 0 ? 0 : index / (chapters.length - 1);
  }

  return { filterEvents, chapterProgress };
});
