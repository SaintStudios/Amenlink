# AMEN website

This is the AMEN website repository, named SaintStudios/Amenlink on GitHub. GitHub Pages serves the main branch at https://amen-app.com/. The deployment stays static: no runtime packages, account service, translation API or build service is needed.

## Legal pages

The privacy policy, terms, support and legal notice are fully rendered in English, German, Spanish, French, Italian and Swedish. Content is in content/<language>.json. Support reuses the relevant translated sections so its explanations cannot diverge from the policies. Legal HTML is generated and committed; edit the JSON sources and run:

    node scripts/build-legal.mjs

Validate with:

    node scripts/build-legal.mjs --check
    node tests/landing-page.test.mjs
    node tests/legal-pages.test.mjs

To compare with a local AMEN app checkout:

    node tests/legal-pages.test.mjs --app-languages="/absolute/path/to/AMEN/AMEN/Services/LocalizationManager.swift"

CI checks translation structure, paragraph links, generated files, internal links, metadata, fallback behavior, restricted-storage behavior and existing App Store routing. Shared CSS and JavaScript URLs include content hashes to prevent stale cached assets after an update. Updating content or assets without regenerating the HTML fails the check.

## Language behavior and compatibility

- Automatic entry pages read the browser’s primary language. Region never overrides that language. An unsupported primary language falls back to English even if a later preference is supported, matching the app.
- ?lang=de, for example, selects German. Invalid language values fall back to English.
- Explicit /legal/de/privacy.html links preserve that language regardless of browser preferences. Navigation among documents preserves the selection. Language links also preserve the current section.
- Pages contain all text before JavaScript runs. With JavaScript unavailable, automatic entry pages show complete English documents and all six explicit language links still work.
- The site does not store language preferences in cookies or browser storage. No translation request, external font, analytics SDK or advertising pixel is added.
- /privacy, /terms, /datenschutz, /nutzungsbedingungen and /agb, their .html versions and trailing-slash versions remain supported. /support, /imprint and /impressum work the same way.
- The current app and App Store description also refer to amenbible.app and amen-ai.com. This repository cannot redirect those other domains. The existing app links and store listing need to use the current domain or those domains must be configured separately.

## Local preview

From this directory:

    python3 -m http.server 8765 --bind 127.0.0.1

Then open http://127.0.0.1:8765/privacy.html or an explicit language page. Production deployment uses the committed HTML directly; .nojekyll prevents unrelated template processing.

## Legal review and implementation limits

See docs/legal-review.md. These are substantial original drafts grounded in app source and official references, not a certification of legal compliance. A privacy notice cannot create an absent consent flow, enforce an age limit or verify a provider’s production configuration. Do not treat passing website checks as proof of those conditions.
