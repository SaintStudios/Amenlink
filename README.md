# amen website

This is the amen website repository, named SaintStudios/Amenlink on GitHub. GitHub Pages serves the main branch at https://amen-app.com/. The deployment stays static: no runtime packages, account service, translation API or build service is needed.

## Legal pages

The app privacy policy, terms, support and legal information are fully rendered in English, German, Spanish, French, Italian and Swedish. Content is in content/<language>.json. Support reuses the relevant translated sections so its explanations cannot diverge from the policies. Legal HTML is generated and committed; edit the JSON sources and run:

    node scripts/build-legal.mjs

Validate with:

    node scripts/build-legal.mjs --check
    node tests/landing-page.test.mjs
    node tests/legal-pages.test.mjs
    node tests/not-found.test.mjs

To compare with a local amen app checkout:

    node tests/legal-pages.test.mjs --app-languages="/absolute/path/to/AMEN/AMEN/Services/LocalizationManager.swift"

CI checks translation structure, paragraph links, generated files, internal links, metadata, fallback behavior, restricted-storage behavior and existing App Store routing. It also checks sentence capitalization, app-only privacy scope, support email, recipient categories and official Apple references. Shared CSS and JavaScript URLs include content hashes to prevent stale cached assets after an update. Updating content or assets without regenerating the HTML fails the check.

## Language behavior and compatibility

- Automatic entry pages read the browser’s primary language. Region never overrides that language. An unsupported primary language falls back to English even if a later preference is supported, matching the app.
- ?lang=de, for example, selects German. Invalid language values fall back to English.
- Explicit /legal/de/privacy.html links preserve that language regardless of browser preferences. Navigation among documents preserves the selection. Language links also preserve the current section.
- Pages contain all text before JavaScript runs. With JavaScript unavailable, automatic entry pages show complete English documents and all six explicit language links still work.
- The site does not store language preferences in cookies or browser storage. No translation request, external font, analytics SDK or advertising pixel is added.
- One compact language disclosure appears at the very bottom of each document, after the footer links. The language menu and contents list start collapsed and remain usable without JavaScript.
- /privacy, /terms, /datenschutz, /nutzungsbedingungen and /agb, their .html versions and trailing-slash versions remain supported. /support, /imprint and /impressum work the same way.
- The iOS source now uses localized amen-app.com privacy and terms URLs through AppLegalLinks (Amenapp commit f4730a1), including Profile → Legal and Contact, onboarding privacy and the deletion-offer paywall privacy link. Installed app versions and App Store metadata are separate from source changes. This repository cannot redirect the older amenbible.app or amen-ai.com domains.

## Document design

The legal document layout follows the app's DESIGN.md: system type, neutral light/dark surfaces, restrained bright teal, and a maximum 680-pixel reading column with 24-pixel side insets. Headings are compact and the contents list is an inline disclosure. The footer language menu uses native details/summary and 44-pixel targets. The print stylesheet removes navigation and keeps a plain document layout.

## Missing pages

GitHub Pages serves the generated root `404.html` for unknown URLs, including nested paths. The page keeps the requested URL and its real HTTP 404 response. An original lost-sheep illustration, inspired by the minimal compositions in [404s.design](https://www.404s.design/sites/hexful), uses the app's teal and neutral colors. Gentle animation respects Reduce Motion.

The error page uses the browser's primary language or an explicit `?lang=` selection, supports all six app languages, and falls back to complete English content if JavaScript is unavailable. Legal links follow the selected language. The compact footer selector changes language on the same URL; it uses no cookies, storage or external translation service. Its copy lives under `notFound` in the existing content files and is regenerated with the legal pages.

## Local preview

From this directory:

    python3 -m http.server 8765 --bind 127.0.0.1

Then open http://127.0.0.1:8765/privacy.html or an explicit language page. Production deployment uses the committed HTML directly; .nojekyll prevents unrelated template processing.

## Legal review and implementation limits

See docs/legal-review.md. The public copy uses amen branding and support email, describes infrastructure by recipient category, and covers app processing. It includes links to Apple's terms, license, privacy, cancellation and refund guidance, plus Google AI conditions and privacy information. The compatibility /imprint and /impressum routes now show general legal information, not an operator disclosure.

These are substantial original drafts grounded in app source and official references, not a certification of legal compliance. Operator identity was removed at the user's request and remains an unresolved legal disclosure requirement. A privacy notice cannot create an absent consent flow, change provider eligibility rules or verify production configuration. Passing website checks does not establish those conditions.
