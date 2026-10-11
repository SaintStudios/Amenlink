import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('404.html');
const script = read('assets/not-found.js');
const data = html.match(/<script type="application\/json" id="not-found-copy">([^]*?)<\/script>/)?.[1];
assert.ok(data, 'translations must be included without an external request');
const copies = JSON.parse(data);
const locales = ['en', 'de', 'es', 'fr', 'it', 'sv'];
assert.deepEqual(Object.keys(copies).sort(), [...locales].sort());
for (const locale of locales) {
  const source = JSON.parse(read('content/' + locale + '.json'));
  assert.deepEqual(copies[locale].notFound, source.notFound);
  assert.deepEqual(Object.keys(copies[locale].notFound).sort(), Object.keys(copies.en.notFound).sort());
  for (const [key, value] of Object.entries(copies[locale].notFound)) {
    assert.ok(value.trim(), locale + ': empty error-page copy');
    if (locale !== 'en') assert.notEqual(value, copies.en.notFound[key], locale + ': untranslated ' + key);
  }
}
assert.match(html, /<html lang="en">/);
assert.ok(html.includes(copies.en.notFound.title), 'English must remain visible without JavaScript');
assert.ok(html.includes(copies.en.notFound.description));
assert.match(html, /name="robots" content="noindex"/);
assert.match(html, /<a class="home-action" href="\/">/);
assert.equal((html.match(/class="language-picker"/g) || []).length, 1);
assert.ok(html.indexOf('class="language-picker"') > html.indexOf('</main>'));
assert.doesNotMatch(html, /<details[^>]*\bopen\b|<base\b|<script[^>]+src="https:/);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert.match(read('assets/not-found.css'), /prefers-reduced-motion: reduce/);
for (const asset of ['legal.css', 'not-found.css', 'not-found.js']) {
  const hash = createHash('sha256').update(read('assets/' + asset)).digest('hex').slice(0, 12);
  assert.ok(html.includes('/assets/' + asset + '?v=' + hash), 'stale error-page asset ' + asset);
}
for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
  assert.ok(fs.existsSync(path.join(root, match[1] === '/' ? 'index.html' : match[1].slice(1))), 'broken recovery link or asset ' + match[1]);
}

function element(dataset = {}) {
  return { dataset, textContent: '', attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } };
}
function run({ languages = ['en-US'], browserLanguage = 'en-US', url = 'https://amen-app.com/missing/deep/page?old=value#top' } = {}) {
  const copyElements = Array.from(html.matchAll(/data-copy="([^\"]+)"/g), (match) => element({ copy: match[1] }));
  const legalLinks = Array.from(html.matchAll(/data-legal-document="([^\"]+)"/g), (match) => element({ legalDocument: match[1] }));
  const languageLinks = locales.map((locale) => element({ errorLanguage: locale }));
  const auto = element();
  const named = { '.brand': element(), '.site-header nav': element(), '.languages': element(), '.auto-language': auto, 'meta[name="description"]': element() };
  const current = element();
  const document = {
    documentElement: { lang: 'en' }, title: '',
    getElementById: (id) => id === 'not-found-copy' ? { textContent: data } : current,
    querySelector: (selector) => named[selector],
    querySelectorAll: (selector) => ({ '[data-copy]': copyElements, '[data-legal-document]': legalLinks, '[data-error-language]': languageLinks })[selector]
  };
  Object.defineProperty(document, 'cookie', { get() { throw new Error('cookies unavailable'); }, set() { throw new Error('cookies unavailable'); } });
  const parsed = new URL(url);
  const window = { location: { href: parsed.href, search: parsed.search, replace() { throw new Error('404 must not redirect'); }, assign() { throw new Error('404 must not redirect'); } } };
  for (const storage of ['localStorage', 'sessionStorage']) Object.defineProperty(window, storage, { get() { throw new Error('storage unavailable'); } });
  vm.runInNewContext(script, { window, document, navigator: { languages, language: browserLanguage }, URL, URLSearchParams });
  return { document, copyElements, legalLinks, languageLinks, auto, current, url: parsed };
}
for (const locale of locales) {
  const state = run({ languages: [locale.toUpperCase() + '_CH'] });
  assert.equal(state.document.documentElement.lang, locale);
  assert.equal(state.document.title, copies[locale].notFound.title + ' · amen');
  assert.equal(state.current.textContent, copies[locale].languageName);
  assert.equal(state.copyElements.find((element) => element.dataset.copy === 'notFound.title').textContent, copies[locale].notFound.title);
  for (const link of state.legalLinks) assert.equal(link.attributes.href, '/legal/' + locale + '/' + link.dataset.legalDocument + '.html');
  for (const link of state.languageLinks) {
    const target = new URL(link.attributes.href);
    assert.equal(target.origin, state.url.origin);
    assert.equal(target.pathname, state.url.pathname, 'language changes must keep the missing path');
    assert.equal(target.search, '?lang=' + link.dataset.errorLanguage, 'drop unrelated URL parameters');
    assert.equal(link.attributes['aria-current'], link.dataset.errorLanguage === locale ? 'true' : undefined);
  }
  assert.equal(state.auto.attributes.href, 'https://amen-app.com/missing/deep/page');
}
for (const primary of ['pt-BR', 'zh-Hans', '__proto__', 'constructor', null]) {
  assert.equal(run({ languages: [primary, 'de-DE'] }).document.documentElement.lang, 'en', 'unsupported primary must fall back to English');
}
assert.equal(run({ languages: [], browserLanguage: 'fr-CA' }).document.documentElement.lang, 'fr');
assert.equal(run({ languages: [null, 'de-DE'], browserLanguage: 'fr-CA' }).document.documentElement.lang, 'en');
assert.equal(run({ languages: ['it-IT'], url: 'https://amen-app.com/missing?lang=de-AT' }).document.documentElement.lang, 'de');
for (const language of ['', 'ja', '__proto__', '<script>', '../de']) {
  assert.equal(run({ languages: ['de-DE'], url: 'https://amen-app.com/missing?lang=' + encodeURIComponent(language) }).document.documentElement.lang, 'en');
}
const unusual = run({ url: 'https://amen-app.com//other.example/missing?lang=sv' });
for (const link of unusual.languageLinks) assert.equal(new URL(link.attributes.href).origin, 'https://amen-app.com', 'language links must not become external URLs');
console.log('404 checks passed: six translations, English fallback, nested URLs, recovery links, restricted storage and reduced-motion stylesheet.');
