import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const languages = ['en', 'de', 'es', 'fr', 'it', 'sv'];
const names = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano', sv: 'Svenska' };
const date = '2026-10-11';
const origin = 'https://amen-app.com';
const check = process.argv.includes('--check');
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const english = JSON.parse(fs.readFileSync(path.join(root, 'content/en.json'), 'utf8'));
const asset = (name) => '/assets/' + name + '?v=' + createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', name))).digest('hex').slice(0, 12);
const external = {
  email: 'mailto:amenapphilfe@gmail.com',
  cancel: 'https://support.apple.com/en-us/118428',
  refund: 'https://support.apple.com/en-us/118223',
  appleEula: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  appleTerms: 'https://www.apple.com/legal/internet-services/itunes/',
  google: 'https://ai.google.dev/gemini-api/terms',
  applePrivacy: 'https://www.apple.com/legal/privacy/',
  googlePrivacy: 'https://policies.google.com/privacy'
};
const generated = new Map();

function validate(copy, locale) {
  for (const key of Object.keys(english.ui)) {
    if (typeof copy.ui?.[key] !== 'string' || !copy.ui[key].trim()) throw new Error(locale + ': missing UI key ' + key);
  }
  for (const kind of ['privacy', 'terms']) {
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
}

function render(copy, locale, kind, auto = false) {
  const ui = copy.ui;
  const navigation = { privacy: ui.navPrivacy, terms: ui.navTerms, imprint: ui.navImprint, support: ui.navSupport };
  const doc = kind === 'support' ? {
    intro: ui.supportDescription,
    summary: [copy.privacy.summary[3], copy.terms.summary[1]],
    sections: [
      copy.terms.sections.find((s) => s.id === 'contact'),
      copy.privacy.sections.find((s) => s.id === 'account-deletion'),
      copy.terms.sections.find((s) => s.id === 'renewal'),
      copy.terms.sections.find((s) => s.id === 'refunds'),
      copy.privacy.sections.find((s) => s.id === 'chat-storage')
    ]
  } : kind === 'imprint' ? {
    intro: ui.imprintDescription,
    summary: [],
    sections: [
      copy.terms.sections.find((s) => s.id === 'provider'),
      copy.terms.sections.find((s) => s.id === 'disputes'),
      copy.terms.sections.find((s) => s.id === 'contact')
    ]
  } : copy[kind];
  const url = (type, lang = locale) => '/legal/' + lang + '/' + type + '.html';
  const links = { ...external, privacy: url('privacy'), terms: url('terms') };
  const rich = (s) => escape(s).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!links[key] || !ui[key]) throw new Error('Unknown link token: ' + key);
    return '<a href="' + escape(links[key]) + '">' + escape(ui[key]) + '</a>';
  });
  const localDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
  const title = escape(ui[kind]);
  const reference = (key) => '<li>' + escape(ui[key]) + ' · <a href="' + external[key] + '" aria-label="' + escape(ui[key]) + '">' + escape(ui.more) + '</a></li>';
  return '<!doctype html>\n' +
    '<html lang="' + locale + '" data-document="' + kind + '" data-auto-language="' + auto + '">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="description" content="' + escape(ui[kind + 'Description']) + '">\n' +
    '<meta name="referrer" content="strict-origin-when-cross-origin">\n' +
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;self&#39;; style-src &#39;self&#39;; img-src &#39;self&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;">\n' +
    '<title>' + title + ' · amen</title>\n<link rel="icon" href="/favicon.ico">\n' +
    '<link rel="canonical" href="' + origin + url(kind) + '">\n' +
    languages.map((l) => '<link rel="alternate" hreflang="' + l + '" href="' + origin + url(kind, l) + '">').join('\n') +
    '\n<link rel="alternate" hreflang="x-default" href="' + origin + '/' + kind + '.html">\n' +
    '<link rel="stylesheet" href="' + asset('legal.css') + '">\n<script src="' + asset('legal.js') + '" defer></script>\n</head>\n<body id="top">\n' +
    '<a class="skip" href="#document">' + escape(ui.skip) + '</a>\n' +
    '<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="' + escape(ui.home) + '"><img src="/amen-app-icon.webp" alt="" width="36" height="36"><span>amen</span></a>' +
    '<nav aria-label="' + escape(ui.documents) + '">' + ['privacy', 'terms', 'imprint', 'support'].map((type) =>
      '<a href="' + url(type) + '"' + (type === kind ? ' aria-current="page"' : '') + '>' + escape(navigation[type]) + '</a>').join('') +
    '</nav></div></header>\n' +
    '<div class="page"><div class="document-heading"><h1>' + title + '</h1>' +
    '<p class="intro">' + escape(doc.intro) + '</p><div class="metadata"><span>' + escape(ui.updated) + ': <time datetime="' + date + '">' + escape(localDate) + '</time></span><span>' + escape(ui.version) + ': ' + date + '</span><button type="button" id="print-document" hidden>' + escape(ui.print) + '</button></div></div>\n' +
    '<aside class="contents"><details><summary>' + escape(ui.contents) + '</summary><nav aria-label="' + escape(ui.contents) + '"><ol>' +
    doc.sections.map((s) => '<li><a href="#' + s.id + '">' + escape(s.title) + '</a></li>').join('') +
    '</ol></nav></details></aside><main id="document" tabindex="-1">' + (doc.summary.length ? '<section class="key-points" aria-labelledby="key-points"><h2 id="key-points">' + escape(ui.summary) + '</h2><ul>' +
    doc.summary.map((s) => '<li>' + escape(s) + '</li>').join('') + '</ul></section>\n' : '') +
    doc.sections.map((s, i) => '<section aria-labelledby="' + s.id + '"><h2 id="' + s.id + '"><span class="section-number">' + (i + 1) + '.</span> ' + escape(s.title) + '</h2>' +
      s.paragraphs.map((p) => '<p>' + rich(p) + '</p>').join('\n') + '</section>').join('\n') +
    '<section aria-labelledby="apple-information"><h2 id="apple-information">' + escape(ui.appleInformation) + '</h2><ul class="provider-links">' +
      ['appleTerms', 'appleEula', 'applePrivacy', 'cancel', 'refund'].map(reference).join('') + '</ul></section>' +
    (kind === 'privacy' ? '<section aria-labelledby="provider-links"><h2 id="provider-links">' + escape(ui.providers) + '</h2><ul class="provider-links">' +
      ['google', 'googlePrivacy'].map(reference).join('') + '</ul></section>' : '') +
    '<a class="back-top" href="#top">' + escape(ui.top) + ' ↑</a></main></div>\n' +
    '<footer><div class="footer-links"><span>' + escape(ui.copyright) + '</span>' + ['privacy', 'terms', 'imprint', 'support'].filter((type) => type !== kind).map((type) => '<a href="' + url(type) + '">' + escape(navigation[type]) + '</a>').join('') + '</div>' +
    '<details class="language-picker"><summary>' + escape(ui.language) + ' · <span>' + names[locale] + '</span></summary><nav class="languages" aria-label="' + escape(ui.language) + '">' +
    languages.map((l) => '<a data-language="' + l + '" lang="' + l + '" hreflang="' + l + '" href="' + url(kind, l) + '"' + (l === locale ? ' aria-current="true"' : '') + '>' + names[l] + '</a>').join('') +
    '<a class="auto-language" href="/' + kind + '.html">' + escape(ui.auto) + '</a></nav></details></footer>\n</body>\n</html>\n';
}

for (const locale of languages) {
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'content', locale + '.json'), 'utf8'));
  validate(copy, locale);
  for (const kind of ['privacy', 'terms', 'support', 'imprint']) generated.set('legal/' + locale + '/' + kind + '.html', render(copy, locale, kind));
}
const aliases = { privacy: ['privacy','datenschutz'], terms: ['terms','nutzungsbedingungen','agb'], support: ['support'], imprint: ['imprint','impressum'] };
for (const [kind, names] of Object.entries(aliases)) {
  for (const name of names) {
    const html = render(english, 'en', kind, true);
    generated.set(name + '.html', html);
    generated.set(name + '/index.html', html);
  }
}

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
else console.log((check ? 'Verified ' : 'Generated ') + generated.size + ' legal pages.');
