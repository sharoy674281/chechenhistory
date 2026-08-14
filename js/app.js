(function attachApp(root, factory) {
  const deps = typeof module === 'object' && module.exports
    ? { content: null, core: null, i18n: null, search: null }
    : { content: root.HISTORY_CONTENT, core: root.HistoryCore, i18n: root.HistoryI18n, search: root.SearchCore };
  const api = factory(deps);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.HistoryApp = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.init);
    else api.init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createApp(deps) {
  function formatYear(year, lang = 'no') {
    if (year >= 0) return String(year);
    const suffix = lang === 'ru' ? ' г. до н. э.' : lang === 'en' ? ' BCE' : ' f.Kr.';
    return `${Math.abs(year)}${suffix}`;
  }

  function formatDateLabel(label, lang = 'no') {
    if (!label || lang === 'en') return label || '';
    const exact = {
      no: { '1st c. BCE–CE': '1. årh. f.Kr.–e.Kr.', 'late 1500s': 'sent på 1500-tallet', '1400s–1700s': '1400–1700-tallet', 'late 1980s': 'sent i 1980-årene' },
      ru: { '1st c. BCE–CE': 'I в. до н. э. — I в. н. э.', 'late 1500s': 'конец XVI века', '1400s–1700s': 'XV–XVIII века', 'late 1980s': 'конец 1980-х' },
    };
    if (exact[lang]?.[label]) return exact[lang][label];
    if (lang === 'no') {
      const months = { May: 'mai', Nov: 'nov.', Feb: 'feb.', Mar: 'mars', Dec: 'des.', Aug: 'aug.', Sep: 'sep.' };
      let value = label.replace(/\b(May|Nov|Feb|Mar|Dec|Aug|Sep)\b/g, (month) => months[month]);
      value = value.replace(/^(\d{1,2}) (?=[a-zæøå])/i, '$1. ');
      return value.replace(/\bBCE\b/g, 'f.Kr.').replace(/\bCE\b/g, 'e.Kr.').replace(/\b(\d{4})s\b/g, '$1-årene');
    }
    const months = { May: 'мая', Nov: 'нояб.', Feb: 'февр.', Mar: 'марта', Dec: 'дек.', Aug: 'авг.', Sep: 'сент.' };
    let value = label.replace(/\b(May|Nov|Feb|Mar|Dec|Aug|Sep)\b/g, (month) => months[month]);
    return value.replace(/^ca\.\s*/i, 'ок. ').replace(/\bBCE\b/g, 'г. до н. э.').replace(/\bCE\b/g, 'н. э.').replace(/\b(\d{4})s\b/g, '$1-е');
  }

  function chapterFromHash(hash, chapters) {
    if (!hash) return null;
    let id = null;
    if (hash.startsWith('#chapter=')) id = decodeURIComponent(hash.slice(9));
    else if (hash.startsWith('#chapter-')) id = decodeURIComponent(hash.slice(9));
    return chapters.find((chapter) => chapter.id === id) || null;
  }

  function safeHref(value) {
    if (typeof value !== 'string') return '#';
    if (value.startsWith('#') || /^https?:\/\//i.test(value)) return value;
    return '#';
  }

  function init() {
    const { content, i18n, search } = deps;
    if (!content || !i18n || !search) return;
    const q = (selector, scope = document) => scope.querySelector(selector);
    const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const state = {
      lang: ['no', 'en', 'ru'].includes(localStorage.getItem('history-lang')) ? localStorage.getItem('history-lang') : 'no',
      expanded: new Set([content.chapters[0].id]),
      allExpanded: false,
      searchIndex: [],
    };
    const tr = (value) => i18n.pickTranslation(value, state.lang);
    const paragraph = (value) => tr(value).split(/\n\n+/).filter(Boolean).map((text) => `<p>${escape(text)}</p>`).join('');
    const text = {
      no: { contents: 'Innhold', openAll: 'Åpne alle', closeAll: 'Lukk alle', read: 'Les kapittel', hide: 'Skjul kapittel', events: 'Hendelser', sources: 'Kilder', person: 'Person', place: 'Sted', chapter: 'Kapittel', event: 'Hendelse', source: 'Kilde', noSearch: 'Ingen treff. Prøv et navn, sted, årstall eller tema.', search: 'Søk i hele historien…', imageSource: 'Bildekilde', eventCount: 'hendelser' },
      en: { contents: 'Contents', openAll: 'Open all', closeAll: 'Close all', read: 'Read chapter', hide: 'Hide chapter', events: 'Events', sources: 'Sources', person: 'Person', place: 'Place', chapter: 'Chapter', event: 'Event', source: 'Source', noSearch: 'No results. Try a name, place, year, or subject.', search: 'Search the whole history…', imageSource: 'Image source', eventCount: 'events' },
      ru: { contents: 'Содержание', openAll: 'Открыть все', closeAll: 'Закрыть все', read: 'Читать главу', hide: 'Скрыть главу', events: 'События', sources: 'Источники', person: 'Персона', place: 'Место', chapter: 'Глава', event: 'Событие', source: 'Источник', noSearch: 'Ничего не найдено. Попробуйте имя, место, год или тему.', search: 'Поиск по всей истории…', imageSource: 'Источник изображения', eventCount: 'событий' },
    };
    const tx = () => text[state.lang];

    function sourceLinks(ids) {
      return (ids || []).map((id) => content.sources.find((source) => source.id === id)).filter(Boolean)
        .map((source) => `<a href="#source-${escape(source.id)}" data-navigate="source-${escape(source.id)}">${escape(source.author)}, ${escape(source.year)}</a>`).join('<span aria-hidden="true"> · </span>');
    }

    function confidenceMark(key) {
      return `<span class="confidence-mark confidence-${escape(key)}"><i aria-hidden="true"></i>${escape(tr(content.confidence[key]))}</span>`;
    }

    function renderStatic() {
      document.documentElement.lang = state.lang;
      document.title = `${tr(content.ui.siteTitle)} — ${tr(content.ui.siteSubtitle)}`;
      q('#site-title').textContent = tr(content.ui.siteTitle);
      q('#site-subtitle').textContent = tr(content.ui.siteSubtitle);
      q('#hero-title').textContent = tr(content.ui.heroTitle);
      q('#hero-deck').textContent = tr(content.ui.heroDeck);
      q('#hero-image').alt = tr(content.ui.imageAlt);
      q('#method-title').textContent = tr(content.ui.methodTitle);
      q('#method-body').textContent = tr(content.ui.methodBody);
      q('#sources-intro').textContent = tr(content.ui.sourcesIntro);
      q('#contents-title').textContent = tx().contents;
      q('#global-search').placeholder = tx().search;
      q('#hero-note').textContent = `${content.chapters.length} ${tx().chapter.toLocaleLowerCase()} · ${content.events.length} ${tx().eventCount} · ${content.sources.length} ${tx().sources.toLocaleLowerCase()}`;
      const opening = {
        no: ['Historie overlever i lag.', 'Denne boken holder bevisene ved siden av fortellingen: arkeologi, skriftlige arkiver, materiell kultur og muntlig minne.'],
        en: ['History survives in layers.', 'This book keeps the evidence beside the story: archaeology, written archives, material culture, and oral memory.'],
        ru: ['История сохраняется слоями.', 'Эта книга держит свидетельства рядом с рассказом: археологию, письменные архивы, материальную культуру и устную память.'],
      }[state.lang];
      q('#opening-line').textContent = opening[0]; q('#opening-note').textContent = opening[1];
      qa('[data-ui]').forEach((node) => { const value = content.ui[node.dataset.ui]; if (value) node.textContent = tr(value); });
      qa('[data-lang]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === state.lang)));
      q('#language-select').value = state.lang;
    }

    function renderLegend() {
      q('#confidence-legend').innerHTML = ['strong', 'probable', 'possible', 'oral', 'disputed', 'legend'].map(confidenceMark).join('');
    }

    function renderContents() {
      q('#expand-all').textContent = state.allExpanded ? tx().closeAll : tx().openAll;
      q('#contents-nav').innerHTML = content.volumes.map((volume, volumeIndex) => {
        const chapters = volume.chapterIds.map((id) => content.chapters.find((chapter) => chapter.id === id)).filter(Boolean);
        return `<section class="contents-volume"><p><span>${String(volumeIndex + 1).padStart(2, '0')}</span>${escape(tr(volume.title))}</p><ol>${chapters.map((chapter) => `<li><button type="button" data-open-chapter="${escape(chapter.id)}" aria-current="${state.expanded.has(chapter.id) ? 'true' : 'false'}"><span>${escape(formatDateLabel(chapter.range, state.lang))}</span>${escape(tr(chapter.title))}</button></li>`).join('')}</ol></section>`;
      }).join('');
    }

    function renderMedia(item) {
      return `<figure class="documentary-image"><img src="${escape(item.src)}" alt="${escape(tr(item.alt))}" loading="lazy"><figcaption><span>${escape(tr(item.caption))}</span><a href="${escape(safeHref(item.sourceUrl))}" target="_blank" rel="noopener noreferrer">${escape(tx().imageSource)} ↗</a><small>${escape(item.attribution)} · ${escape(item.license)}</small></figcaption></figure>`;
    }

    function renderEvent(event) {
      return `<article class="event-note" id="event-${escape(event.id)}" tabindex="-1"><div class="event-date">${escape(formatDateLabel(event.dateLabel || formatYear(event.year), state.lang))}</div><div><h4>${escape(tr(event.title))}</h4><p>${escape(tr(event.summary))}</p><div class="event-meta">${confidenceMark(event.confidence)}<span class="event-sources">${sourceLinks(event.sourceIds)}</span></div></div></article>`;
    }

    function renderPeople(chapterId) {
      return content.people.filter((person) => person.chapterId === chapterId).map((person) => `<aside class="person-note"><p>${escape(tx().person)}</p><h3>${escape(tr(person.name))}</h3><small>${escape(person.lifespan)}</small><p>${escape(tr(person.summary))}</p></aside>`).join('');
    }

    function renderChapterBody(chapter) {
      return `<div class="chapter-body" id="chapter-body-${escape(chapter.id)}">${renderPeople(chapter.id)}${chapter.sections.map((section, index) => {
        const events = section.eventIds.map((id) => content.events.find((event) => event.id === id)).filter(Boolean);
        const media = content.media.filter((item) => item.sectionId === section.id);
        return `<section class="reader-section" id="section-${escape(section.id)}"><h3><span>${String(index + 1).padStart(2, '0')}</span>${escape(tr(section.title))}</h3>${paragraph(section.body)}${media.map(renderMedia).join('')}${events.length ? `<div class="section-events"><h4 class="events-label">${escape(tx().events)}</h4>${events.map(renderEvent).join('')}</div>` : ''}</section>`;
      }).join('')}</div>`;
    }

    function renderReader() {
      q('#chapter-reader').innerHTML = content.chapters.map((chapter) => {
        const open = state.expanded.has(chapter.id);
        return `<article class="chapter-entry${open ? ' is-open' : ''}" id="chapter-${escape(chapter.id)}" tabindex="-1"><header class="chapter-header"><p class="chapter-number">${String(chapter.order).padStart(2, '0')}</p><div><p class="chapter-range">${escape(formatDateLabel(chapter.range, state.lang))}</p><h2>${escape(tr(chapter.title))}</h2><p class="chapter-deck">${escape(tr(chapter.deck))}</p></div><button class="chapter-toggle" type="button" data-toggle-chapter="${escape(chapter.id)}" aria-expanded="${String(open)}" aria-controls="chapter-body-${escape(chapter.id)}"><span>${escape(open ? tx().hide : tx().read)}</span><i aria-hidden="true"></i></button></header>${open ? renderChapterBody(chapter) : ''}</article>`;
      }).join('');
    }

    function renderTimeline() {
      q('#timeline-list').innerHTML = content.events.map((event) => {
        const chapter = content.chapters.find((item) => item.id === event.chapterId);
        return `<button class="timeline-row" type="button" data-go-event="${escape(event.id)}" data-chapter-id="${escape(event.chapterId)}"><time>${escape(formatDateLabel(event.dateLabel || formatYear(event.year), state.lang))}</time><span><strong>${escape(tr(event.title))}</strong><small>${escape(tr(chapter.title))}</small></span>${confidenceMark(event.confidence)}<i aria-hidden="true">↗</i></button>`;
      }).join('');
    }

    function renderSources() {
      const groups = Object.groupBy ? Object.groupBy(content.sources, (source) => source.type) : content.sources.reduce((all, source) => ((all[source.type] ||= []).push(source), all), {});
      q('#source-cabinet').innerHTML = Object.entries(groups).map(([type, sources]) => `<section class="source-group"><h3>${escape(tr(content.ui.sourceTypes[type]))}</h3><ol>${sources.map((source) => `<li id="source-${escape(source.id)}" tabindex="-1"><a href="${escape(safeHref(source.url))}" target="_blank" rel="noopener noreferrer"><span>${escape(source.author)}</span><strong>${escape(source.title)}</strong><small>${escape(source.year)} ↗</small></a></li>`).join('')}</ol></section>`).join('');
    }

    function renderSearch() {
      state.searchIndex = search.buildSearchIndex(content, state.lang);
      const input = q('#global-search');
      const resultsNode = q('#search-results');
      const results = search.searchIndex(state.searchIndex, input.value, 10);
      const hasQuery = search.normalizeSearchText(input.value).length >= 2;
      resultsNode.hidden = !hasQuery;
      input.setAttribute('aria-expanded', String(hasQuery));
      if (!hasQuery) { resultsNode.innerHTML = ''; return; }
      if (!results.length) { resultsNode.innerHTML = `<p class="empty-search">${escape(tx().noSearch)}</p>`; return; }
      resultsNode.innerHTML = results.map((result) => `<button type="button" role="option" data-search-target="${escape(result.targetId)}" data-search-chapter="${escape(result.chapterId || '')}"><span class="result-type">${escape(tx()[result.type] || result.type)}</span><span><strong>${escape(result.label)}</strong><small>${escape(result.description)}</small></span><i aria-hidden="true">↗</i></button>`).join('');
    }

    function renderAll() {
      renderStatic(); renderLegend(); renderContents(); renderReader(); renderTimeline(); renderSources(); renderSearch();
    }

    function moveTo(targetId, chapterId, updateHash = true) {
      if (chapterId && !state.expanded.has(chapterId)) { state.expanded.add(chapterId); renderContents(); renderReader(); }
      requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!target) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
        if (updateHash) history.replaceState(null, '', `#${targetId}`);
      });
    }

    function openChapter(id, targetId = `chapter-${id}`) {
      state.expanded.add(id); state.allExpanded = state.expanded.size === content.chapters.length;
      renderContents(); renderReader(); moveTo(targetId, id);
    }

    document.addEventListener('click', (event) => {
      const open = event.target.closest('[data-open-chapter]');
      if (open) { openChapter(open.dataset.openChapter); return; }
      const toggle = event.target.closest('[data-toggle-chapter]');
      if (toggle) {
        const id = toggle.dataset.toggleChapter;
        if (state.expanded.has(id)) state.expanded.delete(id); else state.expanded.add(id);
        state.allExpanded = state.expanded.size === content.chapters.length;
        renderContents(); renderReader();
        if (state.expanded.has(id)) moveTo(`chapter-${id}`, id);
        return;
      }
      const timeline = event.target.closest('[data-go-event]');
      if (timeline) { openChapter(timeline.dataset.chapterId, `event-${timeline.dataset.goEvent}`); return; }
      const result = event.target.closest('[data-search-target]');
      if (result) {
        q('#global-search').value = ''; q('#search-results').hidden = true; q('#global-search').setAttribute('aria-expanded', 'false');
        moveTo(result.dataset.searchTarget, result.dataset.searchChapter || null);
        return;
      }
      const navigate = event.target.closest('[data-navigate]');
      if (navigate) { event.preventDefault(); moveTo(navigate.dataset.navigate, null); return; }
      if (!event.target.closest('.global-search-wrap')) { q('#search-results').hidden = true; q('#global-search').setAttribute('aria-expanded', 'false'); }
    });

    q('#expand-all').addEventListener('click', () => {
      state.allExpanded = !state.allExpanded;
      state.expanded = state.allExpanded ? new Set(content.chapters.map((chapter) => chapter.id)) : new Set();
      renderContents(); renderReader();
    });
    q('#global-search').addEventListener('input', renderSearch);
    q('#global-search').addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.currentTarget.value = ''; renderSearch(); event.currentTarget.blur(); }
      if (event.key === 'ArrowDown') { event.preventDefault(); q('#search-results button')?.focus(); }
      if (event.key === 'Enter') { const first = q('#search-results button'); if (first) { event.preventDefault(); first.click(); } }
    });
    q('#search-results').addEventListener('keydown', (event) => {
      const buttons = qa('button', q('#search-results')); const index = buttons.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); buttons[Math.min(index + 1, buttons.length - 1)]?.focus(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); if (index <= 0) q('#global-search').focus(); else buttons[index - 1]?.focus(); }
      if (event.key === 'Escape') { q('#global-search').value = ''; renderSearch(); q('#global-search').focus(); }
    });

    function setLanguage(lang) {
      if (!['no', 'en', 'ru'].includes(lang)) return;
      state.lang = lang; localStorage.setItem('history-lang', lang); renderAll();
    }
    qa('[data-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
    q('#language-select').addEventListener('change', (event) => setLanguage(event.target.value));
    q('#menu-toggle').addEventListener('click', () => {
      const next = q('#menu-toggle').getAttribute('aria-expanded') !== 'true';
      q('#menu-toggle').setAttribute('aria-expanded', String(next)); q('#primary-nav').classList.toggle('is-open', next);
    });
    qa('#primary-nav a').forEach((link) => link.addEventListener('click', () => { q('#menu-toggle').setAttribute('aria-expanded', 'false'); q('#primary-nav').classList.remove('is-open'); }));

    renderAll();
    const hashChapter = chapterFromHash(location.hash, content.chapters);
    if (hashChapter) openChapter(hashChapter.id);
    else if (location.hash.startsWith('#event-')) {
      const event = content.events.find((item) => `#event-${item.id}` === location.hash);
      if (event) openChapter(event.chapterId, `event-${event.id}`);
    }
  }

  return { init, formatYear, formatDateLabel, chapterFromHash, safeHref };
});
