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
const kinds = ['privacy', 'terms', 'support', 'imprint', 'delete-account'];
const dates = {};
const htmlFiles = [];
for (const locale of locales) {
  for (const kind of kinds) htmlFiles.push('legal/' + locale + '/' + kind + '.html', 'legal/' + locale + '/' + kind + '/index.html');
}
for (const name of ['privacy', 'terms', 'datenschutz', 'nutzungsbedingungen', 'agb', 'support', 'imprint', 'impressum', 'delete-account']) {
  htmlFiles.push(name + '.html', name + '/index.html');
}
const platforms = ['ios', 'android'];
const platformFiles = [];
for (const locale of locales) {
  for (const platform of platforms) {
    for (const kind of ['privacy', 'terms', 'support']) platformFiles.push('legal/' + locale + '/' + platform + '/' + kind + '/index.html');
  }
}
htmlFiles.push(...platformFiles);
const androidDate = '2026-11-09';
const sharedDate = '2026-11-09';
const plainText = (html) => html.replace(/<[^>]*>/g, ' ');
const mainText = (html) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));

// Android lists only what differs from iOS. Every language must follow the English structure.
for (const locale of locales) {
  for (const kind of ['privacy', 'terms']) {
    const doc = copies[locale].android[kind];
    const english = copies.en.android[kind];
    assert.equal(doc.summary.length, 4);
    assert.deepEqual(doc.sections.map((s) => s.id), english.sections.map((s) => s.id), locale + ': Android ' + kind + ' sections');
    assert.doesNotMatch(JSON.stringify(doc), /(?:"|[.!?]\s+)amen\b/, locale + ': sentence and heading starts must use Amen');
    doc.sections.forEach((section, i) => {
      assert.equal(Boolean(section.paragraphs), Boolean(english.sections[i].paragraphs), locale + ': Android reuse must match English: ' + section.id);
      if (!section.paragraphs) {
        assert.deepEqual(Object.keys(section), ['id'], locale + ': a reused section holds only its id');
        assert.ok(copies[locale][kind].sections.some((s) => s.id === section.id), locale + ': Android reuses a missing iOS section ' + section.id);
        return;
      }
      assert.equal(section.paragraphs.length, 2);
      section.paragraphs.forEach((paragraph, p) => {
        assert.ok(paragraph.length > 50, 'missing substantive Android paragraph in ' + locale + '/' + kind);
        if (locale !== 'en') assert.notEqual(paragraph, english.sections[i].paragraphs[p]);
        const tokens = (paragraph.match(/\{\{\w+\}\}/g) || []).sort();
        assert.deepEqual(tokens, (english.sections[i].paragraphs[p].match(/\{\{\w+\}\}/g) || []).sort(), 'Android paragraph preserves its links: ' + locale + '/' + kind + '/' + section.id);
      });
    });
  }
}
// The Android text must not describe iOS-only integrations or Apple billing.
for (const locale of locales) {
  for (const kind of ['privacy', 'terms', 'support']) {
    const html = read('legal/' + locale + '/android/' + kind + '/index.html');
    const text = mainText(html);
    assert.doesNotMatch(text, /SKAdNetwork|SKAN|IDFA|IDFV|App Tracking Transparency|apple\.com|reportaproblem/, locale + '/' + kind + ': Android page names an iOS-only practice');
    assert.doesNotMatch(text, /tiktok\.com/, locale + '/' + kind + ': Android page links TikTok');
    for (const url of ['https://play.google.com/about/play-terms/index.html', 'https://support.google.com/googleplay/answer/7018481', 'https://support.google.com/googleplay/answer/2479637']) {
      assert.ok(html.includes('href="' + url + '"'), locale + '/' + kind + ': missing Google Play reference ' + url);
    }
    assert.match(html, new RegExp('<link rel="canonical" href="https://amen-app.com/legal/' + locale + '/android/' + kind + '/">'));
    assert.match(html, /data-platform="android"/);
    assert.match(html, /data-platform-link="android" href="[^"]+" aria-current="page"/);
    // Links inside an Android document stay on Android.
    for (const other of ['privacy', 'terms']) assert.doesNotMatch(html, new RegExp('href="/legal/' + locale + '/' + other + '/"'), locale + '/' + kind + ': Android page links the shared ' + other + ' URL');
  }
  // The iOS URLs show exactly the iOS text that the shared URLs have always shown.
  for (const kind of ['privacy', 'terms', 'support']) {
    const shared = read('legal/' + locale + '/' + kind + '/index.html');
    const ios = read('legal/' + locale + '/ios/' + kind + '/index.html');
    assert.equal(mainText(ios).replaceAll('/legal/' + locale + '/ios/', '/legal/' + locale + '/'), mainText(shared), locale + '/' + kind + ': iOS text must match the shared page');
    assert.match(ios, /data-platform-link="ios" href="[^"]+" aria-current="page"/);
    assert.match(shared, /data-platform=""/);
    assert.match(shared, /class="platform-hint"/, locale + '/' + kind + ': the shared page explains the choice');
  }
}

// Every language contains complete documents even if scripts or the network fail.
for (const locale of locales) {
  assert.deepEqual(Object.keys(copies[locale].ui).sort(), Object.keys(copies.en.ui).sort());
  for (const kind of ['privacy', 'terms', 'deleteAccount']) {
    assert.doesNotMatch(JSON.stringify(copies[locale][kind]), /(?:"|[.!?]\s+)amen\b/, locale + ': sentence and heading starts must use Amen');
  }
  for (const kind of ['privacy', 'terms', 'deleteAccount']) {
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
  // The brand is always written Amen, and the documents use no em dashes.
  const visible = html.replace(/<[^>]*>/g, ' ').replace(/amenapphilfe@gmail\.com|amen-app\.com/g, '');
  assert.doesNotMatch(visible, /\bamen\b/, file + ': write Amen, not amen');
  assert.doesNotMatch(html, /\u2014/, file + ': no em dashes');
  assert.doesNotMatch(plainText(html), /German law|deutsches Recht|droit allemand|derecho alemán|diritto tedesco|legge tedesca|tysk lag/i, file + ': Hungarian law applies, not German law');
  const prose = html.replace(/<span class="section-number">[^<]*<\/span>/g, '').replace(/<[^>]*>/g, ' ');
  assert.ok(!/\b18\b|\bFSK\b/.test(prose), file + ': unexpected numeric age label');
  const language = file.startsWith('legal/') ? file.split('/')[1] : 'en';
  assert.match(html, new RegExp('<html lang="' + language + '"'));
  assert.ok(html.includes(copies[language].ui.skip));
  assert.ok(html.includes(copies[language].ui.more));
  assert.ok(html.includes('mailto:amenapphilfe@gmail.com'));
  const android = file.includes('/android/');
  if (!android) for (const url of [
    'https://www.apple.com/legal/internet-services/itunes/',
    'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
    'https://www.apple.com/legal/privacy/',
    'https://support.apple.com/en-us/118428',
    'https://support.apple.com/en-us/118223'
  ]) assert.ok(html.includes('href="' + url + '"'), file + ': missing official Apple reference ' + url);
  const kind = html.match(/data-document="([^"]+)"/)[1];
  assert.ok(html.includes('datetime="' + (android ? androidDate : dates[kind] || sharedDate) + '"'), file + ': wrong document date');
  if (['privacy', 'terms', 'support'].includes(kind)) assert.equal((html.match(/data-platform-link="/g) || []).length, 2, file + ': the platform choice is visible');
  else assert.doesNotMatch(html, /platform-switch/, file + ': only privacy, terms and support have platform versions');
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
// Google Play needs one public page with the deletion steps, the deleted data and the retained data.
for (const locale of locales) {
  const ids = copies[locale].deleteAccount.sections.map((s) => s.id);
  assert.deepEqual(ids, ['delete-in-app', 'delete-by-email', 'deleted-data', 'retained-data', 'subscription']);
  const page = read('legal/' + locale + '/delete-account/index.html');
  assert.ok(page.includes('href="https://support.google.com/googleplay/answer/7018481"'), locale + ': Google Play cancellation link');
  assert.match(page, /Amen - Bible Chat/, locale + ': page names the store listing');
  assert.match(page, /\b7\b/, locale + ': backup expiry is stated');
}
assert.match(read('assets/legal.css'), /@media print/);
assert.match(read('assets/legal.css'), /:focus-visible/);

function run({ languages = ['en-US'], browserLanguage = 'en-US', search = '', hash = '', pathname = '/privacy.html', auto = true, language = 'en', kind = 'privacy', platform, userAgent = '', userAgentData, maxTouchPoints = 0 } = {}) {
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
    documentElement: { lang: language, dataset: { document: kind, autoLanguage: String(auto), ...(platform === undefined ? {} : { platform }) } },
    getElementById: (id) => id === 'print-document' ? print : null,
    querySelectorAll: (selector) => selector.includes('.auto-language') ? [manualLink, autoLink] : [manualLink]
  };
  Object.defineProperty(document, 'cookie', { get() { throw new Error('cookies unavailable'); }, set() { throw new Error('cookies unavailable'); } });
  const context = vm.createContext({ window, document, navigator: { languages, language: browserLanguage, userAgent, userAgentData, maxTouchPoints }, URLSearchParams });
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

// Platform choice: an explicit /ios/ or /android/ URL always wins; the shared URL follows ?platform= or a phone.
const ua = {
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'
};
for (const kind of ['privacy', 'terms', 'support']) {
  const shared = { auto: false, pathname: '/legal/de/' + kind + '/', language: 'de', kind, platform: '' };
  assert.deepEqual(run({ ...shared, userAgent: ua.android, hash: '#rights' }).redirects, ['/legal/de/android/' + kind + '/#rights']);
  assert.deepEqual(run({ ...shared, userAgent: ua.iphone }).redirects, ['/legal/de/ios/' + kind + '/']);
  assert.deepEqual(run({ ...shared, userAgent: ua.mac, maxTouchPoints: 5 }).redirects, ['/legal/de/ios/' + kind + '/'], 'iPad requesting the desktop site');
  assert.deepEqual(run({ ...shared, userAgent: ua.windows, userAgentData: { platform: 'Android' } }).redirects, ['/legal/de/android/' + kind + '/']);
  for (const desktop of [ua.mac, ua.windows, '']) assert.deepEqual(run({ ...shared, userAgent: desktop }).redirects, [], 'a desktop keeps the shared page and its visible choice');
  assert.deepEqual(run({ ...shared, userAgent: ua.iphone, search: '?platform=android' }).redirects, ['/legal/de/android/' + kind + '/']);
  assert.deepEqual(run({ ...shared, userAgent: ua.android, search: '?platform=IOS' }).redirects, ['/legal/de/ios/' + kind + '/']);
  for (const value of ['windows', '', '../ios', '__proto__']) assert.deepEqual(run({ ...shared, userAgent: ua.android, search: '?platform=' + encodeURIComponent(value) }).redirects, []);
  for (const platform of ['ios', 'android']) {
    const explicit = '/legal/de/' + platform + '/' + kind + '/';
    for (const agent of Object.values(ua)) {
      assert.deepEqual(run({ ...shared, pathname: explicit, platform, userAgent: agent }).redirects, [], 'an explicit ' + platform + ' link survives any device');
      assert.deepEqual(run({ ...shared, pathname: explicit, platform, userAgent: agent, search: '?platform=' + (platform === 'ios' ? 'android' : 'ios') }).redirects, []);
    }
    assert.deepEqual(run({ ...shared, pathname: explicit, platform, search: '?lang=fr', hash: '#contact' }).redirects, ['/legal/fr/' + platform + '/' + kind + '/#contact'], 'a language change keeps the platform');
    assert.deepEqual(run({ ...shared, pathname: explicit + 'index.html', platform }).redirects, [explicit]);
  }
  // Older and automatic entry URLs, such as /datenschutz or /terms, resolve language and platform together.
  assert.deepEqual(run({ kind, platform: '', languages: ['de-AT'], userAgent: ua.android, pathname: '/' + kind + '/' }).redirects, ['/legal/de/android/' + kind + '/']);
  assert.deepEqual(run({ kind, platform: '', languages: ['it-IT'], search: '?platform=android', pathname: '/' + kind + '/' }).redirects, ['/legal/it/android/' + kind + '/']);
  assert.deepEqual(run({ kind, platform: '', languages: ['es-ES'], userAgent: ua.windows, pathname: '/' + kind + '/' }).redirects, ['/legal/es/' + kind + '/']);
}
for (const kind of ['imprint', 'delete-account']) {
  assert.deepEqual(run({ auto: false, pathname: '/legal/en/' + kind + '/', kind, userAgent: ua.android, search: '?platform=android' }).redirects, [], kind + ' has one version');
}

for (const locale of locales) {
  const support = read('legal/' + locale + '/android/support/index.html');
  for (const id of ['contact', 'account-deletion', 'renewal', 'refunds', 'chat-storage']) assert.ok(support.includes('id="' + id + '"'), locale + ': Android support section ' + id);
  assert.ok(mainText(support).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').includes(copies[locale].android.terms.sections.find((s) => s.id === 'renewal').paragraphs[0].split('{{')[0]), locale + ': Android support uses the Android renewal text');
}
const appLanguageArgument = process.argv.find((argument) => argument.startsWith('--app-languages='));
if (appLanguageArgument) {
  const swift = fs.readFileSync(appLanguageArgument.slice('--app-languages='.length), 'utf8');
  const enumBody = swift.split('enum SupportedLanguage:')[1].split('var displayName:')[0];
  const appLocales = Array.from(enumBody.matchAll(/case \w+ = "([a-z]{2})"/g), (m) => m[1]).sort();
  assert.deepEqual([...locales].sort(), appLocales, 'website languages must match the app');
}
console.log('Legal checks passed: ' + htmlFiles.length + ' pages, six languages, iOS and Android versions, clean routes, older URLs, content, fallback, explicit selections, restricted storage and print action.');
