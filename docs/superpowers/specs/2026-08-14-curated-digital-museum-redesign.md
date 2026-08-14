# Curated Digital Museum Redesign

Date: 2026-08-14  
Status: Approved design  
Project: Chechen Historical Archive

## Purpose

Turn the current digital book into a credible, navigable digital museum of Chechen history. The experience must foreground real historical material, make a large body of information easy to explore, and avoid the generic visual patterns associated with AI-generated landing pages.

The museum is the public entrance. Long-form articles remain the scholarly core.

## Goals

- Make the first visit feel like entering a curated museum exhibition rather than a marketing landing page.
- Give visitors fast paths into periods, people, places, events, images, maps, documents, and sources.
- Preserve long-form reading in Norwegian, English, and Russian.
- Use only documentary media with known provenance and rights.
- Present uncertainty, oral history, and disagreement without interrupting the reading experience.
- Make search and chronology useful enough for names such as Zelimkhan and their spelling variants.
- Remain understandable on desktop and mobile and usable with a keyboard or reduced motion.

## Non-goals

- Do not imitate Britannica branding or reproduce its interface pixel for pixel.
- Do not build a subscription, chatbot, login system, or AI summary feature.
- Do not use generated imagery as historical evidence or as the museum's principal visual identity.
- Do not make every article dark or cinematic at the expense of reading comfort.
- Do not represent the historical reconstruction as complete or uncontested.

## Experience Model

The site uses a **dark museum, light reading rooms** model.

1. The home page and exhibition entrances use a dark, cinematic gallery treatment.
2. Opening an exhibition or article transitions into a warm, light archival reading surface.
3. Timeline and map experiences may return to the darker museum palette.
4. Sources, captions, and provenance remain visible in both modes.

The transition is conceptual as well as visual: the visitor discovers material in the gallery and studies it in the reading room.

## Anti-slop Rules

The redesign explicitly prohibits the following defaults:

- Oversized centred marketing heroes.
- Vague poetic slogans used in place of factual headings.
- Purple, blue, or aurora gradients.
- Glassmorphism, glowing borders, floating panels, and blurred blobs.
- Repeated pill-shaped buttons and tags.
- Uniform three-card or bento-card grids without editorial hierarchy.
- Decorative noise, paper textures, or flourishes applied across every surface.
- Generic icon collections where text or a historical object is clearer.
- Large empty sections added only to make the page feel dramatic.
- Elastic, bouncing, parallax-heavy, or ornamental motion.
- AI-generated historical scenes, portraits, or documentary-looking imagery.
- Copy such as “history that survived” or “history in layers” as the main navigation language.

Every visual decision must support chronology, provenance, reading, or discovery.

## Information Architecture

The persistent top navigation contains:

- Chechen Historical Archive wordmark
- Exhibitions
- Timeline
- People
- Places / Map
- Sources
- Global search
- NO / EN / RU language switcher

The navigation remains compact. On mobile, the wordmark, search, language control, and menu receive priority.

Primary content entities are:

- Exhibition
- Article
- Chapter and section
- Person
- Place
- Event
- Photograph
- Map
- Document or object
- Oral-history record
- Source

Each entity has a stable identifier and may link to related entities.

## Curated Museum Home Page

### Header

A near-black green header carries the wordmark, primary navigation, search, and language control. It should feel institutional and restrained, with square geometry and thin rules.

### Opening Exhibition

The first screen is not a generic hero. It is the entrance to a named exhibition:

**Aardakh: Deportation and Return, 1944–1957**

The exhibition entrance uses:

- A large authentic archival photograph, document, or verified map occupying roughly sixty percent of the composition.
- Exhibition number, dates, factual title, and a concise curatorial introduction.
- Visible creator, date, collection, license, and source link.
- A single text-led action: `Open exhibition →`.
- No decorative mountain illustration or generated historical scene.

### Period Index

Immediately below the opening exhibition is a compact period index:

- Before written names
- Durdzuketi and Simsim
- Empire and conquest
- Revolution and Soviet transformation
- Aardakh and return
- Sovereignty and Ichkeria
- The wars
- Contemporary Chechnya and diaspora

The labels and date ranges remain visible without horizontal browser scrollbars.

### Curated Gallery

The remainder of the home page uses an asymmetric editorial grid rather than cards:

- One large featured story with a wide documentary image.
- Two smaller related stories.
- One map or document fragment.
- One person profile.
- A direct entrance to the full archive.

Hierarchy comes from image scale, typography, and placement. Items are separated by whitespace and thin rules, not rounded containers or drop shadows.

## Visual System

### Palette

- Near-black green for museum spaces.
- Warm off-white for reading rooms.
- Charcoal for primary text.
- Muted rust as the main accent.
- Archival blue-green for textual links.
- Warm grey for metadata and rules.

No gradient is required. Colour changes mark mode or historical period only when they improve orientation.

### Typography

- A serious book serif for article titles and reading text.
- A neutral museum sans serif for navigation, metadata, captions, dates, and controls.
- Normal reading sizes and line lengths take priority over display typography.
- Factual titles replace promotional or poetic headlines.

### Geometry

- Square or minimally rounded corners.
- Thin dividers and aligned columns.
- No universal card component.
- Real images may break the grid selectively when the editorial composition calls for it.

## Exhibition and Article Reading Rooms

Articles use a three-column desktop layout:

1. A sticky section table of contents on the left.
2. A readable central article column.
3. A contextual media and facts rail on the right.

The article header includes:

- Title and date range
- Subject classification
- Editor or author information when known
- Last reviewed date
- Source foundation
- A short, factual introduction

The main text contains direct links to related people, places, events, and terms. Selecting a linked entity either reveals a compact contextual panel on the same page or navigates to the relevant anchored section. It must never leave the reader at an unexplained scroll position.

The right rail may contain:

- Documentary photographs
- Maps
- Document excerpts
- Object records
- Person summaries
- Quick facts

Every media record displays its provenance and source.

On mobile, the section menu becomes a compact contents control and contextual media flows into the article at editorially chosen positions.

## Evidence and Historical Uncertainty

Evidence status is expressed with calm editorial notes rather than colourful badges. Approved labels include:

- Documented in contemporary records
- Supported by later scholarship
- Preserved in oral tradition
- Historians disagree
- Identification remains uncertain

The wording must be translated consistently. The underlying structured confidence values remain available for filtering and machine-readable data.

Oral history is treated as a historical source category with its own context, not as inferior decoration and not as automatically equivalent to contemporary documentary evidence.

## Timeline

The desktop timeline is a museum instrument inspired by a horizontal exhibition table:

- Events are arranged on a stable chronological scale.
- Years, authentic thumbnails, and concise factual titles remain visible.
- The selected period expands while neighbouring periods remain compact.
- Left and right controls, keyboard navigation, and wheel/trackpad navigation are supported.
- No visible browser scrollbar is used as the primary control.
- Selecting an event reveals its summary, evidence note, image, and source links below the timeline.
- `Read full article` opens the correct article and anchored section.

The mobile version is a vertical chronology. It does not compress the desktop horizontal presentation.

## Search

Search indexes:

- Exhibitions
- Articles and sections
- People and aliases
- Places and aliases
- Events and dates
- Photographs, maps, and documents
- Sources and authors

Results are grouped by entity type and include a date or lifespan, short explanation, and documentary thumbnail where available.

Search normalisation supports Norwegian, English, Russian, Cyrillic, common transliterations, punctuation differences, and diacritics. Queries such as `Zelimkhan`, `Зелимхан`, and `Kharachoy` must converge on related records.

An empty result suggests spelling variants, associated periods, or nearby topics instead of displaying a generic error.

## Motion

Motion is reserved for orientation:

- Slow crossfade between verified exhibition images.
- Restrained text reveal when entering an exhibition.
- Directional transition when changing timeline period.
- Smooth anchored movement only when the destination is explicit.

All effects respect `prefers-reduced-motion`. Content and controls remain fully functional with motion disabled.

## Media and Provenance Policy

Permitted visual material:

- Historical photographs
- Public-domain historical drawings and engravings
- Maps with documented authorship and rights
- Scans of primary documents
- Museum or archive objects with permitted reuse
- Clearly labelled modern documentary photography when licensed

Every media object requires:

- Creator or `unknown`
- Date or approximate date
- Holding collection or original host
- Rights/license statement
- Original source URL
- Descriptive alt text in all supported languages
- Caption that distinguishes what the image shows from how it is interpreted

If provenance or reuse rights cannot be established, the image is not published. Missing imagery is replaced by a document excerpt, date composition, map, or typography—not synthetic documentary imagery.

ChatGPT, generated reports, and “Deep Research” are never listed as historical sources. Only the primary and secondary sources discovered during research are cited.

## Internationalisation

Norwegian, English, and Russian remain first-class languages.

- Navigation, metadata, evidence notes, search labels, captions, and error states are translated.
- Entity aliases are language-independent and searchable across language modes.
- Language changes preserve the current exhibition, article, section, or event.
- Layouts must tolerate longer Russian labels without truncating essential meaning.

## Accessibility and Performance

- Full keyboard access for menus, search results, timeline controls, contents navigation, and contextual panels.
- Strong visible focus states.
- Semantic headings, landmarks, lists, figures, captions, and time elements.
- Sufficient contrast in both museum and reading-room modes.
- No information communicated by colour alone.
- Responsive images with known dimensions to prevent layout shifts.
- Lazy loading below the fold and appropriately sized thumbnails.
- Reduced-motion support.
- Normal document scrolling remains available; nested and decorative scrollbars are avoided.

## Error and Fallback Behaviour

- Missing image: render the article without an empty frame and retain the provenance text only where useful.
- Broken external source: keep the citation metadata and mark the link unavailable without removing the historical claim automatically.
- Unknown hash or entity: return to the archive index with a clear message.
- Empty timeline period: explain that the current catalogue has no indexed event and provide adjacent periods.
- JavaScript unavailable: retain an index, article summaries, and source links in document order where practical.

## Initial Implementation Scope

The first implementation pass will:

1. Replace the current home page with the dark curated museum entrance.
2. Make Aardakh the opening exhibition.
3. Replace remaining generic landing-page patterns and decorative generated imagery.
4. Create the light three-column reading-room template.
5. Rebuild search results around grouped entity types.
6. Rebuild the timeline as a responsive museum tool.
7. Reuse the existing multilingual history, sources, people, places, events, and verified documentary media.
8. Add the required curatorial and provenance fields to the content model.
9. Verify desktop, mobile, keyboard, reduced motion, source navigation, and media loading.

The initial pass does not need to finish every future exhibition. It must establish a durable system through which the complete historical reconstruction can grow.

## Acceptance Criteria

- The first screen is recognisably a curated historical exhibition, not a centred marketing hero.
- Aardakh is the named opening exhibition and uses only verified documentary media.
- The generated mountain illustration is absent from the museum entrance.
- Visitors can reach any major period, global search, timeline, people, places, and sources from the persistent navigation.
- Long articles use a light, readable layout with visible section navigation and contextual documentary material.
- Search finds Zelimkhan through Latin and Cyrillic aliases and groups results by type.
- Timeline event selection reveals content in place and full-article navigation lands at the correct section.
- No horizontal browser scrollbar is exposed as a navigation device.
- No prohibited anti-slop pattern appears in the final interface.
- Image provenance and rights are visible and linked.
- Norwegian, English, and Russian work across the redesigned interface.
- Automated tests cover core search, navigation targets, entity integrity, and local media resources.
- Manual checks cover responsive layouts, keyboard access, reduced motion, readability, and visual hierarchy.

## Reference Interpretation

The supplied references are used for principles, not copying:

- Britannica screenshots: search prominence, persistent navigation, section contents, readable articles, contextual media.
- Editorial generations layout: restrained serif typography, factual statistics, asymmetric documentary photography.
- Digital archive museum layout: large archival media, strong grid, black/white institutional character, captions.
- Pandemic timeline layout: compact horizontal chronology with a selected period.
- American Revolution timeline: portraits and images tied directly to dated events.

The resulting identity must remain specifically Chechen, archival, and evidence-led.
