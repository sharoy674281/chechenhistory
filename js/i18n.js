(function attachI18n(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HistoryI18n = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createI18n() {
  function pickTranslation(value, lang = 'no') {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object') return String(value);
    if (value[lang]) return value[lang];
    if (value.en) return value.en;
    const first = Object.values(value).find(Boolean);
    return first ? String(first) : '';
  }

  return { pickTranslation };
});
