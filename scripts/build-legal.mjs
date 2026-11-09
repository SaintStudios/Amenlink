import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const languages = ['en', 'de', 'es', 'fr', 'it', 'sv'];
const names = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano', sv: 'Svenska' };
const date = '2026-10-14';
// A document added later carries its own date; the others keep the shared version.
const dates = { 'delete-account': '2026-11-07' };
// Privacy and terms exist once per app. The iOS text is the shared one; Android lists only what differs.
export const platforms = ['ios', 'android'];
const platformNames = { ios: 'iOS', android: 'Android' };
// Platform marks from Simple Icons (CC0). The link's aria-label names the platform for screen readers.
const platformIcons = {
  ios: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
  android: 'M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z'
};
const platformKinds = ['privacy', 'terms', 'support'];
// Support has no text of its own: it repeats sections of the privacy policy and terms for the same platform.
const androidTexts = ['privacy', 'terms'];
const androidDate = '2026-11-09';
// URL slug → content and UI key (delete-account → deleteAccount).
const key = (kind) => kind.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const origin = 'https://amen-app.com';
const check = process.argv.includes('--check');
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const english = JSON.parse(fs.readFileSync(path.join(root, 'content/en.json'), 'utf8'));
const asset = (name) => '/assets/' + name + '?v=' + createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', name))).digest('hex').slice(0, 12);
const external = {
  email: 'mailto:amenapphilfe@gmail.com',
  cancel: 'https://support.apple.com/en-us/118428',
  googlePlayCancel: 'https://support.google.com/googleplay/answer/7018481',
  googlePlayRefund: 'https://support.google.com/googleplay/answer/2479637',
  googlePlayTerms: 'https://play.google.com/about/play-terms/index.html',
  refund: 'https://support.apple.com/en-us/118223',
  appleEula: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  appleTerms: 'https://www.apple.com/legal/internet-services/itunes/',
  google: 'https://ai.google.dev/gemini-api/terms',
  applePrivacy: 'https://www.apple.com/legal/privacy/',
  googlePrivacy: 'https://policies.google.com/privacy',
  tiktokPrivacy: 'https://www.tiktok.com/legal/page/eea/privacy-policy/en',
  appleSKAN: 'https://developer.apple.com/documentation/storekit/skadnetwork'
};
const generated = new Map();

function validate(copy, locale) {
  for (const key of Object.keys(english.ui)) {
    if (typeof copy.ui?.[key] !== 'string' || !copy.ui[key].trim()) throw new Error(locale + ': missing UI key ' + key);
  }
  for (const key of Object.keys(english.notFound)) {
    if (typeof copy.notFound?.[key] !== 'string' || !copy.notFound[key].trim()) throw new Error(locale + ': missing 404 copy ' + key);
  }
  for (const kind of ['privacy', 'terms', 'deleteAccount']) {
    const document = copy[kind];
    if (!document?.intro || document.summary?.length !== english[kind].summary.length) throw new Error(locale + ': incomplete ' + kind);
    if (document.sections?.length !== english[kind].sections.length) throw new Error(locale + ': missing sections in ' + kind);
    document.sections.forEach((section, i) => {
      if (section.id !== english[kind].sections[i].id || !section.title || section.paragraphs?.length !== english[kind].sections[i].paragraphs.length) {
        throw new Error(locale + ': incomplete section ' + kind + '/' + english[kind].sections[i].id);
      }
      for (const paragraph of section.paragraphs) {
        if (typeof paragraph !== 'string' || !paragraph.trim()) throw new Error(locale + ': empty paragraph');
        if (locale !== 'en' && english[kind].sections[i].paragraphs.includes(paragraph)) throw new Error(locale + ': untranslated paragraph');
      }
    });
  }
  // Android: a section with paragraphs replaces or adds text; a section with only an id reuses the iOS section.
  for (const kind of androidTexts) {
    const document = copy.android?.[kind];
    const reference = english.android[kind];
    if (!document?.intro || document.summary?.length !== reference.summary.length) throw new Error(locale + ': incomplete Android ' + kind);
    if (document.sections?.length !== reference.sections.length) throw new Error(locale + ': missing sections in Android ' + kind);
    document.sections.forEach((section, i) => {
      const model = reference.sections[i];
      if (section.id !== model.id || Boolean(section.paragraphs) !== Boolean(model.paragraphs)) throw new Error(locale + ': Android section differs from English: ' + kind + '/' + model.id);
      if (!section.paragraphs) {
        if (!copy[kind].sections.some((s) => s.id === section.id)) throw new Error(locale + ': Android reuses a missing iOS section ' + kind + '/' + section.id);
        return;
      }
      if (!section.title || section.paragraphs.length !== model.paragraphs.length) throw new Error(locale + ': incomplete Android section ' + kind + '/' + model.id);
      for (const paragraph of section.paragraphs) {
        if (typeof paragraph !== 'string' || !paragraph.trim()) throw new Error(locale + ': empty Android paragraph');
        if (locale !== 'en' && model.paragraphs.includes(paragraph)) throw new Error(locale + ': untranslated Android paragraph');
      }
    });
  }
}

export function androidDocument(copy, kind) {
  const document = copy.android[kind];
  return {
    intro: document.intro,
    summary: document.summary,
    sections: document.sections.map((section) => section.paragraphs ? section : copy[kind].sections.find((s) => s.id === section.id))
  };
}

// platform: 'ios' or 'android' for a platform URL, null for the shared URL, which shows iOS until the script picks a device.
function render(copy, locale, kind, auto = false, platform = null) {
  const ui = copy.ui;
  const navigation = { privacy: ui.navPrivacy, terms: ui.navTerms, imprint: ui.navImprint, support: ui.navSupport };
  const versioned = platformKinds.includes(kind);
  const shown = versioned ? platform || 'ios' : null;
  const privacy = shown === 'android' ? androidDocument(copy, 'privacy') : copy.privacy;
  const terms = shown === 'android' ? androidDocument(copy, 'terms') : copy.terms;
  const doc = kind === 'support' ? {
    intro: ui.supportDescription,
    summary: [privacy.summary[3], terms.summary[1]],
    sections: [
      terms.sections.find((s) => s.id === 'contact'),
      privacy.sections.find((s) => s.id === 'account-deletion'),
      terms.sections.find((s) => s.id === 'renewal'),
      terms.sections.find((s) => s.id === 'refunds'),
      privacy.sections.find((s) => s.id === 'chat-storage')
    ]
  } : kind === 'imprint' ? {
    intro: ui.imprintDescription,
    summary: [],
    sections: [
      copy.terms.sections.find((s) => s.id === 'provider'),
      copy.terms.sections.find((s) => s.id === 'disputes'),
      copy.terms.sections.find((s) => s.id === 'contact')
    ]
  } : kind === 'privacy' ? privacy : kind === 'terms' ? terms : copy[key(kind)];
  // Privacy and terms links stay on the platform being read; the other documents have one version.
  const url = (type, lang = locale, on = platform) => '/legal/' + lang + '/' + (on && platformKinds.includes(type) ? on + '/' : '') + type + '/';
  const links = { ...external, privacy: url('privacy'), terms: url('terms'), deleteAccount: url('delete-account') };
  const rich = (s) => escape(s).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!links[key] || !ui[key]) throw new Error('Unknown link token: ' + key);
    return '<a href="' + escape(links[key]) + '">' + escape(ui[key]) + '</a>';
  });
  const updated = shown === 'android' ? androidDate : dates[kind] || date;
  const localDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(updated + 'T12:00:00Z'));
  const title = escape(ui[key(kind)]);
  const reference = (key) => '<li>' + escape(ui[key]) + ' · <a href="' + external[key] + '" aria-label="' + escape(ui[key]) + '">' + escape(ui.more) + '</a></li>';
  const storeReferences = shown === 'android' ?
    '<section aria-labelledby="google-play-information"><h2 id="google-play-information">' + escape(ui.googlePlayInformation) + '</h2><ul class="provider-links">' +
      ['googlePlayTerms', 'googlePrivacy', 'googlePlayCancel', 'googlePlayRefund'].map(reference).join('') + '</ul></section>' :
    '<section aria-labelledby="apple-information"><h2 id="apple-information">' + escape(ui.appleInformation) + '</h2><ul class="provider-links">' +
      ['appleTerms', 'appleEula', 'applePrivacy', 'cancel', 'refund'].map(reference).join('') + '</ul></section>';
  const providerReferences = shown === 'android' ? ['google'] : ['google', 'googlePrivacy', 'tiktokPrivacy', 'appleSKAN'];
  // Plain links, so the choice works without JavaScript and every shared URL names its platform.
  const platformSwitch = versioned ? '<nav class="platform-switch" aria-label="' + escape(ui.platform) + '"><span class="platform-options">' +
    platforms.map((p) => '<a data-platform-link="' + p + '" href="' + url(kind, locale, p) + '"' + (p === shown ? ' aria-current="page"' : '') + ' aria-label="' + platformNames[p] + '" title="' + platformNames[p] + '">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + platformIcons[p] + '"/></svg></a>').join('') +
    '</span>' + (platform ? '' : '<span class="platform-hint">' + escape(ui.platformHint) + '</span>') + '</nav>' : '';
  // The shared URL keeps its old x-default; a platform URL points at its English page on the same platform.
  const fallback = platform ? url(kind, 'en') : '/' + kind + '/';
  return '<!doctype html>\n' +
    '<html lang="' + locale + '" data-document="' + kind + '" data-auto-language="' + auto + '"' + (versioned ? ' data-platform="' + (platform || '') + '"' : '') + '>\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="description" content="' + escape(ui[key(kind) + 'Description']) + '">\n' +
    '<meta name="referrer" content="strict-origin-when-cross-origin">\n' +
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;self&#39;; style-src &#39;self&#39;; img-src &#39;self&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;">\n' +
    '<title>' + title + (platform ? ' (' + platformNames[platform] + ')' : '') + ' · amen</title>\n<link rel="icon" href="/favicon.ico">\n' +
    '<link rel="canonical" href="' + origin + url(kind) + '">\n' +
    languages.map((l) => '<link rel="alternate" hreflang="' + l + '" href="' + origin + url(kind, l) + '">').join('\n') +
    '\n<link rel="alternate" hreflang="x-default" href="' + origin + fallback + '">\n' +
    '<link rel="stylesheet" href="' + asset('legal.css') + '">\n<script src="' + asset('legal.js') + '" defer></script>\n</head>\n<body id="top">\n' +
    '<a class="skip" href="#document">' + escape(ui.skip) + '</a>\n' +
    '<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="' + escape(ui.home) + '"><img src="/amen-app-icon.webp" alt="" width="36" height="36"><span>amen</span></a>' +
    '<nav aria-label="' + escape(ui.documents) + '">' + ['privacy', 'terms', 'imprint', 'support'].map((type) =>
      '<a href="' + url(type) + '"' + (type === kind ? ' aria-current="page"' : '') + '>' + escape(navigation[type]) + '</a>').join('') +
    '</nav></div></header>\n' +
    '<div class="page"><div class="document-heading"><h1>' + title + '</h1>' + platformSwitch +
    '<p class="intro">' + escape(doc.intro) + '</p><div class="metadata">' + (shown ? '<span class="print-only">' + escape(ui.platform) + ': ' + platformNames[shown] + '</span>' : '') + '<span>' + escape(ui.updated) + ': <time datetime="' + updated + '">' + escape(localDate) + '</time></span><span>' + escape(ui.version) + ': ' + updated + '</span><button type="button" id="print-document" hidden>' + escape(ui.print) + '</button></div></div>\n' +
    '<aside class="contents"><details><summary>' + escape(ui.contents) + '</summary><nav aria-label="' + escape(ui.contents) + '"><ol>' +
    doc.sections.map((s) => '<li><a href="#' + s.id + '">' + escape(s.title) + '</a></li>').join('') +
    '</ol></nav></details></aside><main id="document" tabindex="-1">' + (doc.summary.length ? '<section class="key-points" aria-labelledby="key-points"><h2 id="key-points">' + escape(ui.summary) + '</h2><ul>' +
    doc.summary.map((s) => '<li>' + escape(s) + '</li>').join('') + '</ul></section>\n' : '') +
    doc.sections.map((s, i) => '<section aria-labelledby="' + s.id + '"><h2 id="' + s.id + '"><span class="section-number">' + (i + 1) + '.</span> ' + escape(s.title) + '</h2>' +
      s.paragraphs.map((p) => '<p>' + rich(p) + '</p>').join('\n') + '</section>').join('\n') +
    storeReferences +
    (kind === 'privacy' ? '<section aria-labelledby="provider-links"><h2 id="provider-links">' + escape(ui.providers) + '</h2><ul class="provider-links">' +
      providerReferences.map(reference).join('') + '</ul></section>' : '') +
    '<a class="back-top" href="#top">' + escape(ui.top) + ' ↑</a></main></div>\n' +
    '<footer><div class="footer-links"><span>' + escape(ui.copyright) + '</span>' + ['privacy', 'terms', 'imprint', 'support'].filter((type) => type !== kind).map((type) => '<a href="' + url(type) + '">' + escape(navigation[type]) + '</a>').join('') + '</div>' +
    '<details class="language-picker"><summary>' + escape(ui.language) + ' · <span>' + names[locale] + '</span></summary><nav class="languages" aria-label="' + escape(ui.language) + '">' +
    languages.map((l) => '<a data-language="' + l + '" lang="' + l + '" hreflang="' + l + '" href="' + url(kind, l) + '"' + (l === locale ? ' aria-current="true"' : '') + '>' + names[l] + '</a>').join('') +
    '<a class="auto-language" href="/' + kind + '/' + (platform ? '?platform=' + platform : '') + '">' + escape(ui.auto) + '</a></nav></details></footer>\n</body>\n</html>\n';
}

function renderNotFound(copies) {
  const ui = english.ui;
  const copy = english.notFound;
  const labels = { privacy: 'navPrivacy', terms: 'navTerms', imprint: 'navImprint', support: 'navSupport' };
  const navigation = Object.entries(labels).map(([kind, key]) => '<a data-legal-document="' + kind + '" data-copy="ui.' + key + '" href="/legal/en/' + kind + '/">' + escape(ui[key]) + '</a>').join('');
  const data = JSON.stringify(copies).replace(/</g, '\\u003c');
  const artwork = fs.readFileSync(path.join(root, 'assets/error-404.svg'), 'utf8');
  return '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="robots" content="noindex">\n<meta name="description" content="' + escape(copy.description) + '">\n' +
    '<meta name="referrer" content="strict-origin-when-cross-origin">\n' +
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;self&#39;; style-src &#39;self&#39;; img-src &#39;self&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;">\n' +
    '<title>' + escape(copy.title) + ' · amen</title>\n<link rel="icon" href="/favicon.ico">\n' +
    '<link rel="stylesheet" href="' + asset('legal.css') + '">\n<link rel="stylesheet" href="' + asset('not-found.css') + '">\n' +
    '<script src="' + asset('not-found.js') + '" defer></script>\n</head>\n<body class="not-found-page">\n' +
    '<a class="skip" href="#document" data-copy="ui.skip">' + escape(ui.skip) + '</a>\n' +
    '<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="' + escape(ui.home) + '"><img src="/amen-app-icon.webp" alt="" width="32" height="32"><span>amen</span></a><nav aria-label="' + escape(ui.documents) + '">' + navigation + '</nav></div></header>\n' +
    '<main id="document" class="not-found-main" tabindex="-1">\n' + artwork +
    '<h1><span class="sr-only">404: </span><span data-copy="notFound.title">' + escape(copy.title) + '</span></h1>\n' +
    '<p class="error-description" data-copy="notFound.description">' + escape(copy.description) + '</p>\n' +
    '<a class="home-action" href="/"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-copy="notFound.homeAction">' + escape(copy.homeAction) + '</span></a>\n' +
    '<p class="verse-note"><span data-copy="notFound.verse">' + escape(copy.verse) + '</span><span class="scripture-reference" data-copy="notFound.verseReference">' + escape(copy.verseReference) + '</span></p>\n</main>\n' +
    '<footer><div class="footer-links"><span>amen</span>' + navigation + '</div>' +
    '<details class="language-picker"><summary><span data-copy="ui.language">' + escape(ui.language) + '</span> · <span id="current-language">English</span></summary><nav class="languages" aria-label="' + escape(ui.language) + '">' +
    languages.map((locale) => '<a data-error-language="' + locale + '" lang="' + locale + '" hreflang="' + locale + '" href="?lang=' + locale + '"' + (locale === 'en' ? ' aria-current="true"' : '') + '>' + names[locale] + '</a>').join('') +
    '<a class="auto-language" href="?" data-copy="ui.auto">' + escape(ui.auto) + '</a></nav></details></footer>\n' +
    '<script type="application/json" id="not-found-copy">' + data + '</script>\n</body>\n</html>\n';
}

const notFoundCopies = {};
for (const locale of languages) {
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'content', locale + '.json'), 'utf8'));
  validate(copy, locale);
  notFoundCopies[locale] = { ui: copy.ui, notFound: copy.notFound, languageName: names[locale] };
  for (const kind of ['privacy', 'terms', 'support', 'imprint', 'delete-account']) {
    const html = render(copy, locale, kind);
    generated.set('legal/' + locale + '/' + kind + '.html', html);
    generated.set('legal/' + locale + '/' + kind + '/index.html', html);
  }
  for (const platform of platforms) {
    for (const kind of platformKinds) generated.set('legal/' + locale + '/' + platform + '/' + kind + '/index.html', render(copy, locale, kind, false, platform));
  }
}
const aliases = { privacy: ['privacy','datenschutz'], terms: ['terms','nutzungsbedingungen','agb'], support: ['support'], imprint: ['imprint','impressum'], 'delete-account': ['delete-account'] };
for (const [kind, names] of Object.entries(aliases)) {
  for (const name of names) {
    const html = render(english, 'en', kind, true);
    generated.set(name + '.html', html);
    generated.set(name + '/index.html', html);
  }
}
generated.set('404.html', renderNotFound(notFoundCopies));
generated.set('404/index.html', renderNotFound(notFoundCopies));

let stale = false;
for (const [name, html] of generated) {
  const filename = path.join(root, name);
  if (check) {
    if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== html) {
      console.error('Generated page is stale: ' + name);
      stale = true;
    }
  } else {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, html);
  }
}
if (stale) process.exitCode = 1;
else console.log((check ? 'Verified ' : 'Generated ') + generated.size + ' pages, including clean routes and compatible older URLs.');
