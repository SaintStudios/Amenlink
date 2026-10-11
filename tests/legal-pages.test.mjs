import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['en', 'de', 'es', 'fr', 'it', 'sv'];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const script = read('assets/legal.js');
const copies = Object.fromEntries(locales.map((locale) => [locale, JSON.parse(read('content/' + locale + '.json'))]));
const kinds = ['privacy', 'terms', 'support', 'imprint'];
const htmlFiles = [];
for (const locale of locales) {
  for (const kind of kinds) htmlFiles.push('legal/' + locale + '/' + kind + '.html', 'legal/' + locale + '/' + kind + '/index.html');
}
for (const name of ['privacy', 'terms', 'datenschutz', 'nutzungsbedingungen', 'agb', 'support', 'imprint', 'impressum']) {
  htmlFiles.push(name + '.html', name + '/index.html');
}

// Every language contains complete documents even if scripts or the network fail.
for (const locale of locales) {
  assert.deepEqual(Object.keys(copies[locale].ui).sort(), Object.keys(copies.en.ui).sort());
  for (const kind of ['privacy', 'terms']) {
    assert.doesNotMatch(JSON.stringify(copies[locale][kind]), /(?:"|[.!?]\s+)amen\b/, locale + ': sentence and heading starts must use Amen');
  }
  for (const kind of ['privacy', 'terms']) {
    const doc = copies[locale][kind];
    assert.deepEqual(doc.sections.map((s) => s.id), copies.en[kind].sections.map((s) => s.id));
    assert.equal(doc.summary.length, 4);
    for (let i = 0; i < doc.sections.length; i++) {
      const section = doc.sections[i];
      assert.equal(section.paragraphs.length, 2);
      assert.ok(section.title.trim());
      for (let p = 0; p < section.paragraphs.length; p++) {
        assert.ok(section.paragraphs[p].length > 50, 'missing substantive paragraph in ' + locale + '/' + kind);
        if (locale !== 'en') assert.notEqual(section.paragraphs[p], copies.en[kind].sections[i].paragraphs[p]);
        const tokens = (section.paragraphs[p].match(/\{\{\w+\}\}/g) || []).sort();
        const englishTokens = (copies.en[kind].sections[i].paragraphs[p].match(/\{\{\w+\}\}/g) || []).sort();
        assert.deepEqual(tokens, englishTokens, 'translated paragraph preserves its links: ' + locale + '/' + kind + '/' + section.id);
      }
    }
  }
  assert.equal(copies[locale].ui.email, 'amenapphilfe@gmail.com');
  assert.ok(!copies[locale].privacy.sections.some((s) => ['website', 'browser-storage'].includes(s.id)), locale + ': app policy must not contain website-processing sections');
}
for (const file of htmlFiles) {
  const html = read(file);
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, file + ': IDs must be unique');
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.ok(html.includes('<main id="document" tabindex="-1">'));
  assert.doesNotMatch(html, /\{\{\w+\}\}|undefined|NEMA 2\.5|fonts\.googleapis|<script[^>]+src="https:/);
  assert.match(html, /Content-Security-Policy/);
  for (const name of ['legal.css', 'legal.js']) {
    const hash = createHash('sha256').update(read('assets/' + name)).digest('hex').slice(0, 12);
    assert.ok(html.includes('/assets/' + name + '?v=' + hash), file + ': stale asset URL');
  }
  assert.doesNotMatch(html, /AMEN|Supabase|RevenueCat|AppsFlyer|Ezra Maslaton|Gartenstraße|Oberschleißheim/);
  const prose = html.replace(/<span class="section-number">[^<]*<\/span>/g, '').replace(/<[^>]*>/g, ' ');
  assert.ok(!/\b18\b|\bFSK\b/.test(prose), file + ': unexpected numeric age label');
  const language = file.startsWith('legal/') ? file.split('/')[1] : 'en';
  assert.match(html, new RegExp('<html lang="' + language + '"'));
  assert.ok(html.includes(copies[language].ui.skip));
  assert.ok(html.includes(copies[language].ui.more));
  assert.ok(html.includes('mailto:amenapphilfe@gmail.com'));
  for (const url of [
    'https://www.apple.com/legal/internet-services/itunes/',
    'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
    'https://www.apple.com/legal/privacy/',
    'https://support.apple.com/en-us/118428',
    'https://support.apple.com/en-us/118223'
  ]) assert.ok(html.includes('href="' + url + '"'), file + ': missing official Apple reference ' + url);
  assert.ok(html.includes('datetime="2026-10-11"'));
  assert.equal((html.match(/data-language="/g) || []).length, 6);
  assert.equal((html.match(/class="language-picker"/g) || []).length, 1);
  assert.ok(html.indexOf('class="language-picker"') > html.indexOf('</main>'), file + ': language selection belongs below the document');
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/, file + ': contents and language selection start collapsed');
  assert.equal((html.match(/hreflang="x-default"/g) || []).length, 1);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1].replace(/&amp;/g, '&');
    if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), file + ': missing anchor ' + url);
    else if (url.startsWith('/')) {
      const local = url.split(/[?#]/)[0];
      assert.doesNotMatch(local, /\.html$/, file + ': public links must use clean routes');
      const target = path.join(root, local.endsWith('/') ? local.slice(1) + 'index.html' : local.slice(1));
      assert.ok(fs.existsSync(target), file + ': broken local link ' + local);
    } else {
      assert.match(url, /^(https:|mailto:|tel:)/, file + ': unsafe URL');
      if (url.startsWith('https://amen-app.com/')) assert.doesNotMatch(new URL(url).pathname, /\.html$/, file + ': metadata must use clean routes');
    }
  }
}
const englishPrivacy = read('privacy.html');
assert.match(englishPrivacy, /Google AI model/);
for (const category of ['cloud hosting', 'purchase validation', 'app measurement', 'advertising attribution']) assert.ok(englishPrivacy.includes(category), 'recipient category must still be disclosed: ' + category);
assert.doesNotMatch(copies.en.privacy.intro, /website|amen-app\.com/i);
assert.match(copies.en.privacy.intro, /Christian app/);
assert.match(copies.en.terms.intro, /Christian app/);
assert.match(copies.en.terms.summary.join(' '), /does not cancel Apple billing/);
assert.doesNotMatch(englishPrivacy, /No external AI|exclusively internally|only for the duration of the active session/);
assert.match(read('terms.html'), /Article|consumer/);
assert.match(read('assets/legal.css'), /@media print/);
assert.match(read('assets/legal.css'), /:focus-visible/);

function run({ languages = ['en-US'], browserLanguage = 'en-US', search = '', hash = '', pathname = '/privacy.html', auto = true, language = 'en', kind = 'privacy' } = {}) {
  const redirects = [];
  const events = {};
  const print = { hidden: true, addEventListener(type, handler) { events[type] = handler; } };
  const manualEvents = {};
  const manualLink = { hash: '', addEventListener(type, handler) { manualEvents[type] = handler; } };
  const autoEvents = {};
  const autoLink = { hash: '', addEventListener(type, handler) { autoEvents[type] = handler; } };
  const window = {
    location: { search, hash, pathname, replace: (url) => redirects.push(url) },
    print: () => events.printed = true
  };
  // A private/restricted browser may throw on any storage access.
  for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { get() { throw new Error('storage unavailable'); } });
  const document = {
    documentElement: { lang: language, dataset: { document: kind, autoLanguage: String(auto) } },
    getElementById: (id) => id === 'print-document' ? print : null,
    querySelectorAll: (selector) => selector.includes('.auto-language') ? [manualLink, autoLink] : [manualLink]
  };
  Object.defineProperty(document, 'cookie', { get() { throw new Error('cookies unavailable'); }, set() { throw new Error('cookies unavailable'); } });
  const context = vm.createContext({ window, document, navigator: { languages, language: browserLanguage }, URLSearchParams });
  vm.runInContext(script, context);
  return { redirects, events, print, manualEvents, manualLink, autoEvents, autoLink, window };
}
for (const locale of locales) {
  for (const kind of kinds) {
    const cleanPath = '/legal/' + locale + '/' + kind + '/';
    const automatic = run({ languages: [locale + '-DE'], kind, hash: '#contact' });
    assert.deepEqual(automatic.redirects, [cleanPath + '#contact']);
    const explicit = run({ auto: false, pathname: cleanPath, language: locale, kind });
    assert.deepEqual(explicit.redirects, [], 'explicit locale must survive a different browser preference');
    assert.equal(explicit.print.hidden, false);
    for (const pathname of [cleanPath.slice(0, -1) + '.html', cleanPath + 'index.html']) {
      assert.deepEqual(run({ auto: false, pathname, language: locale, kind, hash: '#contact' }).redirects, [cleanPath + '#contact'], 'older URLs must keep the explicit locale and section');
    }
    assert.equal(read('legal/' + locale + '/' + kind + '.html'), read('legal/' + locale + '/' + kind + '/index.html'), 'both routes must contain the complete document');
  }
}
for (const primary of ['pt-BR', 'zh-Hans', 'constructor', '__proto__', '', null]) {
  assert.deepEqual(run({ languages: [primary, 'de-DE'] }).redirects, ['/legal/en/privacy/']);
}
assert.deepEqual(run({ languages: ['SV_fi'] }).redirects, ['/legal/sv/privacy/']);
assert.deepEqual(run({ languages: [], browserLanguage: 'it-IT' }).redirects, ['/legal/it/privacy/']);
assert.deepEqual(run({ languages: undefined, browserLanguage: 'fr-FR' }).redirects, ['/legal/en/privacy/']);
assert.deepEqual(run({ search: '?lang=de', languages: ['es-ES'] }).redirects, ['/legal/de/privacy/']);
assert.deepEqual(run({ search: '?lang=es-MX', languages: ['de-DE'] }).redirects, ['/legal/es/privacy/']);
for (const value of ['ja', '', '<script>', '../de', '__proto__', 'https://evil.invalid']) {
  assert.deepEqual(run({ search: '?lang=' + encodeURIComponent(value), languages: ['de-DE'] }).redirects, ['/legal/en/privacy/']);
}
assert.deepEqual(run({ auto: true, pathname: '/legal/en/privacy/' }).redirects, [], 'English fallback must not loop');
assert.deepEqual(run({ auto: false, pathname: '/legal/de/privacy/', language: 'de', search: '?lang=no' }).redirects, ['/legal/en/privacy/']);
const manual = run({ auto: false, pathname: '/legal/en/privacy/', hash: '#rights' });
assert.equal(manual.manualLink.hash, '#rights');
assert.equal(manual.autoLink.hash, '#rights');
manual.window.location.hash = '#retention';
manual.manualEvents.click();
assert.equal(manual.manualLink.hash, '#retention');
manual.autoEvents.click();
assert.equal(manual.autoLink.hash, '#retention');
manual.events.click();
assert.equal(manual.events.printed, true);
assert.deepEqual(run({ kind: 'unexpected' }).redirects, []);

const appLanguageArgument = process.argv.find((argument) => argument.startsWith('--app-languages='));
if (appLanguageArgument) {
  const swift = fs.readFileSync(appLanguageArgument.slice('--app-languages='.length), 'utf8');
  const enumBody = swift.split('enum SupportedLanguage:')[1].split('var displayName:')[0];
  const appLocales = Array.from(enumBody.matchAll(/case \w+ = "([a-z]{2})"/g), (m) => m[1]).sort();
  assert.deepEqual([...locales].sort(), appLocales, 'website languages must match the app');
}
console.log('Legal checks passed: 64 pages, six languages, clean routes, older URLs, content, fallback, explicit selections, restricted storage and print action.');
