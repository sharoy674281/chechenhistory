(function attachApp(root, factory) {
  const deps = typeof module === 'object' && module.exports
    ? { content: null, i18n: null, search: null, museum: null }
    : {
        content: root.HISTORY_CONTENT,
        i18n: root.HistoryI18n,
        search: root.SearchCore,
        museum: root.MuseumCore,
      };
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
      no: {
        '1st c. BCE–CE': '1. årh. f.Kr.–e.Kr.',
        'late 1500s': 'sent på 1500-tallet',
        '1400s–1700s': '1400–1700-tallet',
        'late 1980s': 'sent i 1980-årene',
      },
      ru: {
        '1st c. BCE–CE': 'I в. до н. э. — I в. н. э.',
        'late 1500s': 'конец XVI века',
        '1400s–1700s': 'XV–XVIII века',
        'late 1980s': 'конец 1980-х',
      },
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

  function targetFromHash(hash) {
    if (typeof hash !== 'string') return null;
    const value = hash.replace(/^#/, '');
    return /^(exhibition|chapter|event|person|place|media|source)-[a-z0-9][a-z0-9-]*$/i.test(value) ? value : null;
  }

  function safeHref(value) {
    if (typeof value !== 'string') return '#';
    if (value.startsWith('#') || /^https?:\/\//i.test(value)) return value;
    return '#';
  }

  function init() {
    const { content, i18n, search, museum } = deps;
    if (!content || !i18n || !search || !museum) return;

    const q = (selector, scope = document) => scope.querySelector(selector);
    const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
    const languages = ['no', 'en', 'ru'];
    const storedLanguage = localStorage.getItem('history-lang');
    const openingExhibition = museum.getOpeningExhibition(content);
    const state = {
      lang: languages.includes(storedLanguage) ? storedLanguage : 'no',
      chapterId: openingExhibition?.chapterId || content.chapters[0]?.id,
      periodId: content.periods.find((period) => period.id === 'aardakh-return')?.id || content.periods[0]?.id,
      eventId: 'deportation',
      searchIndex: [],
      searchSelection: -1,
    };

    const labels = {
      no: {
        museum: 'Digitalt museum', edition: 'Utgave 01 · 2026', exhibitions: 'Utstillinger', timeline: 'Tidslinje', people: 'Personer', places: 'Steder', sources: 'Kilder',
        collection: 'Fra samlingen', collectionTitle: 'Historier, mennesker og dokumenter', archive: 'Arkiv · ca. 1200 f.Kr.–2026', archiveTitle: 'Finn et navn, sted, årstall eller dokument', openSearch: 'Søk i arkivet',
        chronology: 'Kronologi', timelineIntro: 'Velg en periode og undersøk hendelsene i sammenheng.', readingRoom: 'Leserom', contents: 'I denne artikkelen', related: 'I arkivskuffen', events: 'Hendelser',
        openExhibition: 'Åpne utstillingen', readArticle: 'Les hele artikkelen', seeSource: 'Se originalkilden', evidence: 'Kildegrunnlag', image: 'Arkivobjekt', person: 'Person', place: 'Sted', media: 'Bilde og kart', chapter: 'Artikkel', event: 'Hendelse', exhibition: 'Utstilling', source: 'Kilde',
        noSearch: 'Ingen treff. Prøv et navn, sted, årstall eller dokument.', searchPlaceholder: 'Søk navn, steder, år og dokumenter…', methodLabel: 'Redaksjonell metode', sourcesLabel: 'Bibliografi og arkiver', register: 'Register', geography: 'Geografi',
        documented: 'Dokumentert i samtidige eller flere uavhengige kilder', probable: 'Sannsynlig etter krysslesning av kilder', possible: 'Mulig, men kildene er begrensede', oral: 'Bevart i muntlig minne', disputed: 'Omstridt i kildene', legend: 'Fortelling eller tradisjon',
      },
      en: {
        museum: 'Digital museum', edition: 'Edition 01 · 2026', exhibitions: 'Exhibitions', timeline: 'Timeline', people: 'People', places: 'Places', sources: 'Sources',
        collection: 'From the collection', collectionTitle: 'Stories, people, and documents', archive: 'Archive · c. 1200 BCE–2026', archiveTitle: 'Find a name, place, year, or document', openSearch: 'Search the archive',
        chronology: 'Chronology', timelineIntro: 'Choose a period and examine its events in context.', readingRoom: 'Reading room', contents: 'In this article', related: 'In the archive drawer', events: 'Events',
        openExhibition: 'Open the exhibition', readArticle: 'Read the full article', seeSource: 'View original source', evidence: 'Evidence basis', image: 'Archive object', person: 'Person', place: 'Place', media: 'Images and maps', chapter: 'Article', event: 'Event', exhibition: 'Exhibition', source: 'Source',
        noSearch: 'No results. Try a name, place, year, or document.', searchPlaceholder: 'Search names, places, years, and documents…', methodLabel: 'Editorial method', sourcesLabel: 'Bibliography and archives', register: 'Index', geography: 'Geography',
        documented: 'Documented in contemporary or multiple independent sources', probable: 'Probable after cross-reading the sources', possible: 'Possible, but the surviving evidence is limited', oral: 'Preserved in oral memory', disputed: 'Disputed in the sources', legend: 'Story or tradition',
      },
      ru: {
        museum: 'Цифровой музей', edition: 'Выпуск 01 · 2026', exhibitions: 'Выставки', timeline: 'Хронология', people: 'Люди', places: 'Места', sources: 'Источники',
        collection: 'Из собрания', collectionTitle: 'Истории, люди и документы', archive: 'Архив · ок. 1200 до н. э.–2026', archiveTitle: 'Найдите имя, место, год или документ', openSearch: 'Поиск по архиву',
        chronology: 'Хронология', timelineIntro: 'Выберите период и рассмотрите события в их контексте.', readingRoom: 'Читальный зал', contents: 'В этой статье', related: 'В архивном ящике', events: 'События',
        openExhibition: 'Открыть выставку', readArticle: 'Читать всю статью', seeSource: 'Открыть первоисточник', evidence: 'Основание', image: 'Архивный объект', person: 'Персона', place: 'Место', media: 'Изображения и карты', chapter: 'Статья', event: 'Событие', exhibition: 'Выставка', source: 'Источник',
        noSearch: 'Ничего не найдено. Попробуйте имя, место, год или документ.', searchPlaceholder: 'Поиск имён, мест, дат и документов…', methodLabel: 'Редакционный метод', sourcesLabel: 'Библиография и архивы', register: 'Указатель', geography: 'География',
        documented: 'Подтверждено современными или несколькими независимыми источниками', probable: 'Вероятно после сопоставления источников', possible: 'Возможно, но сохранившиеся данные ограничены', oral: 'Сохранено в устной памяти', disputed: 'Оспаривается в источниках', legend: 'Предание или традиция',
      },
    };

    const tx = () => labels[state.lang];
    const tr = (value) => i18n.pickTranslation(value, state.lang);
    const paragraph = (value) => tr(value).split(/\n\n+/).filter(Boolean).map((text) => `<p>${escape(text)}</p>`).join('');
    const findChapter = (id) => content.chapters.find((chapter) => chapter.id === id);
    const findEvent = (id) => content.events.find((event) => event.id === id);
    const findMedia = (id) => content.media.find((item) => item.id === id);
    const findSource = (id) => content.sources.find((source) => source.id === id);

    function evidenceText(key) {
      return ({ strong: tx().documented, probable: tx().probable, possible: tx().possible, oral: tx().oral, disputed: tx().disputed, legend: tx().legend })[key] || key;
    }

    function sourceLinks(ids, compact = false) {
      return (ids || []).map(findSource).filter(Boolean).map((source) => {
        const label = compact ? `${source.author}, ${source.year}` : source.title;
        return `<a href="#source-${escape(source.id)}" data-target="source-${escape(source.id)}">${escape(label)}</a>`;
      }).join('<span aria-hidden="true"> · </span>');
    }

    function provenance(item) {
      return [item.creator, item.date, item.collection, item.license].filter(Boolean).map(escape).join(' · ');
    }

    function renderStatic() {
      document.documentElement.lang = state.lang;
      document.title = `${tr(content.ui.siteTitle)} — ${tx().museum}`;
      q('#site-title').textContent = tr(content.ui.siteTitle);
      q('#site-subtitle').textContent = `${tx().museum} · ${tx().sources.toLocaleLowerCase()}`;
      q('#global-search').placeholder = tx().searchPlaceholder;
      q('#language-select').value = state.lang;
      q('#language-select').setAttribute('aria-label', state.lang === 'ru' ? 'Язык' : state.lang === 'en' ? 'Language' : 'Språk');
      qa('[data-lang]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === state.lang)));
      qa('[data-nav-label]').forEach((link) => { link.textContent = tx()[link.dataset.navLabel]; });
      q('.museum-edition span:first-child').textContent = tx().museum;
      q('.museum-edition span:last-child').textContent = tx().edition;
      q('.museum-section-heading p').textContent = tx().collection;
      q('#curated-heading').textContent = tx().collectionTitle;
      q('.archive-index').textContent = tx().archive;
      q('#archive-search-title').textContent = tx().archiveTitle;
      q('[data-focus-search]').innerHTML = `${escape(tx().openSearch)} <span aria-hidden="true">→</span>`;
      q('.timeline-heading > div > p').textContent = tx().chronology;
      q('#timeline-title').textContent = tx().timeline;
      q('#timeline-intro').textContent = tx().timelineIntro;
      q('#reader-room-kicker').textContent = tx().readingRoom;
      q('#people > header p').textContent = tx().register;
      q('#people-title').textContent = tx().people;
      q('#places > header p').textContent = tx().geography;
      q('#places-title').textContent = tx().places;
      q('#method > header p').textContent = tx().methodLabel;
      q('#method-title').textContent = tr(content.ui.methodTitle);
      q('#method-body').textContent = tr(content.ui.methodBody);
      q('#sources > header p').textContent = tx().sourcesLabel;
      q('#sources-title').textContent = tx().sources;
      q('#sources-intro').textContent = tr(content.ui.sourcesIntro);
      qa('[data-ui]').forEach((node) => {
        const value = content.ui[node.dataset.ui];
        if (value) node.textContent = tr(value);
      });
    }

    function renderOpening() {
      if (!openingExhibition) return;
      const hero = findMedia(openingExhibition.heroMediaId);
      q('#opening-exhibition').innerHTML = `<div class="exhibition-copy">
        <p class="exhibition-index">${escape(tx().exhibition)} ${escape(openingExhibition.number)} <span>${escape(openingExhibition.range)}</span></p>
        <h1>${escape(tr(openingExhibition.title))}</h1>
        <p class="exhibition-introduction">${escape(tr(openingExhibition.introduction))}</p>
        <button type="button" data-open-exhibition>${escape(tx().openExhibition)} <span aria-hidden="true">→</span></button>
        <p class="exhibition-sources">${sourceLinks(openingExhibition.sourceIds, true)}</p>
      </div>${hero ? `<figure class="exhibition-object" id="media-${escape(hero.id)}">
        <img src="${escape(hero.src)}" alt="${escape(tr(hero.alt))}">
        <figcaption><strong>${escape(tr(hero.caption))}</strong><span>${provenance(hero)}</span></figcaption>
      </figure>` : ''}`;
    }

    function renderPeriods() {
      q('#period-index').innerHTML = content.periods.map((period) => `<button type="button" data-select-period="${escape(period.id)}" aria-current="${period.id === state.periodId ? 'true' : 'false'}"><span>${escape(formatDateLabel(period.range, state.lang))}</span><strong>${escape(tr(period.title))}</strong></button>`).join('');
      q('#timeline-periods').innerHTML = content.periods.map((period) => `<button type="button" data-select-period="${escape(period.id)}" aria-pressed="${period.id === state.periodId ? 'true' : 'false'}"><span>${escape(formatDateLabel(period.range, state.lang))}</span>${escape(tr(period.title))}</button>`).join('');
    }

    function renderCuratedGallery() {
      const objects = [
        { kind: 'chapter', value: findChapter('durdzuk'), media: findMedia('khaibakh-1888'), className: 'collection-feature' },
        { kind: 'chapter', value: findChapter('caucasian-war'), media: findMedia('shamil-1859'), className: 'collection-portrait' },
        { kind: 'chapter', value: findChapter('imperial-rule'), media: findMedia('grozny-oil-1910'), className: 'collection-landscape' },
        { kind: 'person', value: content.people.find((person) => person.id === 'zelimkhan'), media: null, className: 'collection-person' },
      ].filter((item) => item.value);
      q('#curated-gallery').innerHTML = objects.map((item) => {
        const title = item.kind === 'person' ? tr(item.value.name) : tr(item.value.title);
        const note = item.kind === 'person' ? tr(item.value.summary) : tr(item.value.deck);
        const target = item.kind === 'person' ? `person-${item.value.id}` : `chapter-${item.value.id}`;
        return `<article class="collection-object ${item.className}">${item.media ? `<button type="button" class="collection-image" data-open-entity="${escape(target)}"><img src="${escape(item.media.src)}" alt="${escape(tr(item.media.alt))}" loading="lazy"></button>` : ''}<div><p>${escape(item.kind === 'person' ? tx().person : formatDateLabel(item.value.range, state.lang))}</p><h3><button type="button" data-open-entity="${escape(target)}">${escape(title)}</button></h3><p>${escape(note)}</p>${item.media ? `<small>${provenance(item.media)}</small>` : ''}</div></article>`;
      }).join('');
    }

    function renderEvent(event) {
      return `<article class="reader-event" id="event-${escape(event.id)}" tabindex="-1"><time>${escape(formatDateLabel(event.dateLabel || formatYear(event.year), state.lang))}</time><div><h4>${escape(tr(event.title))}</h4><p>${escape(tr(event.summary))}</p><p class="evidence-line" data-confidence="${escape(event.confidence)}"><strong>${escape(tx().evidence)}:</strong> ${escape(evidenceText(event.confidence))}</p><p class="reader-event-sources">${sourceLinks(event.sourceIds, true)}</p></div></article>`;
    }

    function renderReader() {
      const chapter = findChapter(state.chapterId);
      if (!chapter) return;
      q('#reader-room-title').textContent = tr(chapter.title);
      q('#reader-room-deck').textContent = tr(chapter.deck);
      q('#reader-contents').innerHTML = `<p>${escape(tx().contents)}</p><ol>${chapter.sections.map((section) => `<li><a href="#section-${escape(section.id)}" data-target="section-${escape(section.id)}">${escape(tr(section.title))}</a></li>`).join('')}</ol><p class="reader-range">${escape(formatDateLabel(chapter.range, state.lang))}</p>`;
      q('#reader-article').innerHTML = chapter.sections.map((section, index) => {
        const events = section.eventIds.map(findEvent).filter(Boolean);
        return `<section class="reader-section" id="section-${escape(section.id)}"><header><span>${String(index + 1).padStart(2, '0')}</span><h3>${escape(tr(section.title))}</h3></header>${paragraph(section.body)}${events.length ? `<div class="reader-events"><h4>${escape(tx().events)}</h4>${events.map(renderEvent).join('')}</div>` : ''}</section>`;
      }).join('');

      const media = content.media.filter((item) => item.chapterId === chapter.id);
      const people = content.people.filter((person) => person.chapterId === chapter.id);
      const places = content.places.filter((place) => place.chapterId === chapter.id);
      const usedSources = [...new Set(content.events.filter((event) => event.chapterId === chapter.id).flatMap((event) => event.sourceIds || []))].map(findSource).filter(Boolean);
      q('#reader-context').innerHTML = `<h3>${escape(tx().related)}</h3>
        ${media.map((item) => `<figure class="context-object" id="media-${escape(item.id)}"><img src="${escape(item.src)}" alt="${escape(tr(item.alt))}" loading="lazy"><figcaption><strong>${escape(tr(item.caption))}</strong><span>${provenance(item)}</span><a href="${escape(safeHref(item.sourceUrl))}" target="_blank" rel="noopener noreferrer">${escape(tx().seeSource)} ↗</a></figcaption></figure>`).join('')}
        ${people.map((person) => `<section class="context-entity" id="person-${escape(person.id)}"><p>${escape(tx().person)} · ${escape(person.lifespan)}</p><h4>${escape(tr(person.name))}</h4><p>${escape(tr(person.summary))}</p></section>`).join('')}
        ${places.map((place) => `<section class="context-entity" id="place-${escape(place.id)}"><p>${escape(tx().place)}</p><h4>${escape(tr(place.name))}</h4><p>${(place.aliases || []).map(escape).join(' · ')}</p></section>`).join('')}
        ${usedSources.length ? `<section class="context-sources"><p>${escape(tx().sources)}</p>${usedSources.map((source) => `<a href="#source-${escape(source.id)}" data-target="source-${escape(source.id)}">${escape(source.title)}</a>`).join('')}</section>` : ''}`;
    }

    function renderTimeline() {
      const events = museum.getPeriodEvents(content, state.periodId);
      if (!events.some((event) => event.id === state.eventId)) state.eventId = events[0]?.id || null;
      q('#timeline-track').innerHTML = events.length ? events.map((event) => `<button type="button" class="timeline-event" data-select-event="${escape(event.id)}" aria-pressed="${event.id === state.eventId ? 'true' : 'false'}"><time>${escape(formatDateLabel(event.dateLabel || formatYear(event.year), state.lang))}</time><strong>${escape(tr(event.title))}</strong><span>${escape(evidenceText(event.confidence))}</span></button>`).join('') : `<p>${escape(tx().noSearch)}</p>`;
      renderTimelineDetail();
    }

    function renderTimelineDetail() {
      const event = findEvent(state.eventId);
      const detail = q('#timeline-detail');
      if (!event) { detail.innerHTML = ''; return; }
      detail.innerHTML = `<div><time>${escape(formatDateLabel(event.dateLabel || formatYear(event.year), state.lang))}</time><p class="evidence-line" data-confidence="${escape(event.confidence)}">${escape(evidenceText(event.confidence))}</p></div><div><h3>${escape(tr(event.title))}</h3><p>${escape(tr(event.summary))}</p><p class="timeline-sources">${sourceLinks(event.sourceIds, true)}</p><button type="button" data-open-event="${escape(event.id)}">${escape(tx().readArticle)} →</button></div>`;
    }

    function renderEntityIndexes() {
      q('#people-index').innerHTML = content.people.map((person) => `<button type="button" data-open-entity="person-${escape(person.id)}"><span>${escape(person.lifespan)}</span><strong>${escape(tr(person.name))}</strong><small>${escape(tr(person.summary))}</small></button>`).join('');
      q('#places-index').innerHTML = content.places.map((place) => `<button type="button" data-open-entity="place-${escape(place.id)}"><span>${escape(tx().place)}</span><strong>${escape(tr(place.name))}</strong><small>${(place.aliases || []).map(escape).join(' · ')}</small></button>`).join('');
    }

    function renderSources() {
      const groups = content.sources.reduce((result, source) => {
        (result[source.type] ||= []).push(source);
        return result;
      }, {});
      q('#source-cabinet').innerHTML = Object.entries(groups).map(([type, sources]) => `<section class="source-group"><h3>${escape(tr(content.ui.sourceTypes[type]) || type)}</h3><ol>${sources.map((source) => `<li id="source-${escape(source.id)}"><a href="${escape(safeHref(source.url))}" target="_blank" rel="noopener noreferrer"><span>${escape(String(source.year))}</span><strong>${escape(source.title)}</strong><small>${escape(source.author)}</small></a></li>`).join('')}</ol></section>`).join('');
    }

    function renderSearchResults(query) {
      const container = q('#search-results');
      const input = q('#global-search');
      const results = search.searchIndex(state.searchIndex, query, 18);
      state.searchSelection = -1;
      if (query.trim().length < 2) {
        container.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      const grouped = search.groupSearchResults(results);
      const order = ['exhibition', 'person', 'place', 'event', 'chapter', 'media', 'source'];
      container.innerHTML = results.length ? order.filter((type) => grouped[type]?.length).map((type) => `<section class="search-group"><h3>${escape(tx()[type] || type)}</h3>${grouped[type].map((item) => `<button type="button" role="option" data-search-target="${escape(item.targetId)}" data-search-type="${escape(item.type)}" data-search-id="${escape(item.id)}" data-chapter-id="${escape(item.chapterId || '')}"><strong>${escape(item.label)}</strong><span>${escape(item.description)}</span></button>`).join('')}</section>`).join('') : `<p class="empty-search">${escape(tx().noSearch)}</p>`;
      container.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function renderAll() {
      renderStatic();
      renderOpening();
      renderPeriods();
      renderCuratedGallery();
      renderReader();
      renderTimeline();
      renderEntityIndexes();
      renderSources();
      state.searchIndex = search.buildSearchIndex(content, state.lang);
    }

    function scrollToTarget(target, behavior = 'smooth') {
      const node = document.getElementById(target);
      if (!node) return false;
      node.scrollIntoView({ behavior, block: 'start' });
      if (node.matches('[tabindex="-1"]')) node.focus({ preventScroll: true });
      return true;
    }

    function openChapter(chapterId, target = `chapter-${chapterId}`, updateHash = true) {
      if (!findChapter(chapterId)) return;
      state.chapterId = chapterId;
      renderReader();
      if (updateHash) history.replaceState(null, '', `#${target}`);
      requestAnimationFrame(() => scrollToTarget(target === `chapter-${chapterId}` ? 'reader-room' : target));
    }

    function openEntity(target) {
      const [type, ...idParts] = target.split('-');
      const id = idParts.join('-');
      if (type === 'chapter') return openChapter(id, target);
      if (type === 'event') {
        const event = findEvent(id);
        if (event) openChapter(event.chapterId, target);
        return;
      }
      if (type === 'person') {
        const person = content.people.find((item) => item.id === id);
        if (person) openChapter(person.chapterId, target);
        return;
      }
      if (type === 'place') {
        const place = content.places.find((item) => item.id === id);
        if (place) openChapter(place.chapterId, target);
        return;
      }
      if (type === 'media') {
        const item = findMedia(id);
        if (item) openChapter(item.chapterId, target);
        return;
      }
      if (type === 'exhibition') {
        openChapter(openingExhibition.chapterId, `chapter-${openingExhibition.chapterId}`);
        return;
      }
      if (type === 'source') scrollToTarget(target);
    }

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, a[data-target]');
      if (!button) return;
      if (button.matches('[data-open-exhibition]')) openChapter(openingExhibition.chapterId);
      if (button.matches('[data-focus-search]')) { q('#global-search').focus(); q('#global-search').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      if (button.dataset.selectPeriod) {
        state.periodId = button.dataset.selectPeriod;
        const periodEvents = museum.getPeriodEvents(content, state.periodId);
        state.eventId = periodEvents[0]?.id || null;
        renderPeriods(); renderTimeline();
        scrollToTarget('timeline');
      }
      if (button.dataset.selectEvent) { state.eventId = button.dataset.selectEvent; renderTimeline(); }
      if (button.dataset.openEvent) openEntity(`event-${button.dataset.openEvent}`);
      if (button.dataset.openEntity) openEntity(button.dataset.openEntity);
      if (button.dataset.target) { event.preventDefault(); scrollToTarget(button.dataset.target); }
      if (button.dataset.searchTarget) {
        const type = button.dataset.searchType;
        const target = (type === 'person' || type === 'place') ? `${type}-${button.dataset.searchId}` : button.dataset.searchTarget;
        q('#search-results').hidden = true;
        q('#global-search').setAttribute('aria-expanded', 'false');
        if ((type === 'person' || type === 'place') && button.dataset.chapterId) openChapter(button.dataset.chapterId, target);
        else openEntity(target);
      }
      if (button.matches('[data-timeline-previous]')) q('#timeline-track').scrollBy({ left: -360, behavior: 'smooth' });
      if (button.matches('[data-timeline-next]')) q('#timeline-track').scrollBy({ left: 360, behavior: 'smooth' });
    });

    q('#global-search').addEventListener('input', (event) => renderSearchResults(event.target.value));
    q('#global-search').addEventListener('keydown', (event) => {
      const options = qa('[role="option"]', q('#search-results'));
      if (event.key === 'Escape') { q('#search-results').hidden = true; event.currentTarget.setAttribute('aria-expanded', 'false'); return; }
      if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowDown') state.searchSelection = Math.min(state.searchSelection + 1, options.length - 1);
      if (event.key === 'ArrowUp') state.searchSelection = Math.max(state.searchSelection - 1, 0);
      if (event.key === 'Enter' && state.searchSelection >= 0) { options[state.searchSelection].click(); return; }
      options.forEach((option, index) => option.setAttribute('aria-selected', String(index === state.searchSelection)));
      options[state.searchSelection]?.scrollIntoView({ block: 'nearest' });
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.global-search-wrap')) { q('#search-results').hidden = true; q('#global-search').setAttribute('aria-expanded', 'false'); }
    });

    qa('[data-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
    q('#language-select').addEventListener('change', (event) => setLanguage(event.target.value));
    function setLanguage(lang) {
      if (!languages.includes(lang)) return;
      state.lang = lang;
      localStorage.setItem('history-lang', lang);
      renderAll();
    }

    q('#menu-toggle').addEventListener('click', (event) => {
      const open = event.currentTarget.getAttribute('aria-expanded') === 'true';
      event.currentTarget.setAttribute('aria-expanded', String(!open));
      q('#primary-nav').classList.toggle('is-open', !open);
    });
    qa('#primary-nav a').forEach((link) => link.addEventListener('click', () => { q('#primary-nav').classList.remove('is-open'); q('#menu-toggle').setAttribute('aria-expanded', 'false'); }));

    renderAll();
    const initialTarget = targetFromHash(location.hash);
    const initialChapter = chapterFromHash(location.hash, content.chapters);
    if (initialChapter) openChapter(initialChapter.id, `chapter-${initialChapter.id}`, false);
    else if (initialTarget) openEntity(initialTarget);
  }

  return { formatYear, formatDateLabel, chapterFromHash, targetFromHash, safeHref, init };
});
