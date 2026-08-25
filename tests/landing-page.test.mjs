import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'index.html must contain one inline application script');
new vm.Script(scriptMatch[1], { filename: 'index.inline.js' });

const bootMarker = "document.getElementById('copyButton').addEventListener";
const bootIndex = scriptMatch[1].indexOf(bootMarker);
assert.ok(bootIndex > 0, 'application boot marker must be present');
const functionSource = scriptMatch[1].slice(0, bootIndex);

const context = vm.createContext({
    navigator: { languages: ['en-US'], language: 'en-US', userAgent: '', platform: '', maxTouchPoints: 0 },
    window: {},
    document: {},
    console
});
vm.runInContext(functionSource, context, { filename: 'index.inline.js' });

const detectLanguage = context.detectLanguage;
const detectPlatform = context.detectPlatform;
const detectInAppBrowser = context.detectInAppBrowser;

assert.equal(detectLanguage(['de-DE']), 'de');
assert.equal(detectLanguage(['en-AT']), 'de');
assert.equal(detectLanguage(['fr-CH']), 'de');
assert.equal(detectLanguage(['en-SE']), 'sv');
assert.equal(detectLanguage(['sv-FI']), 'sv');
assert.equal(detectLanguage(['fr-CA']), 'fr');
assert.equal(detectLanguage(['es-ES']), 'en');
assert.equal(detectLanguage([]), 'en');

assert.equal(detectPlatform('Mozilla/5.0 (Linux; Android 15; Pixel Tablet)', 'Linux armv8l', 10), 'android');
assert.equal(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5), 'ios');
assert.equal(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 5), 'ios');
assert.equal(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32', 0), 'other');

assert.equal(detectInAppBrowser('Mozilla/5.0 TikTok 38.1.0'), 'tiktok');
assert.equal(detectInAppBrowser('Mozilla/5.0 musical_ly'), 'tiktok');
assert.equal(detectInAppBrowser('Mozilla/5.0 Instagram 348.0'), 'inApp');
assert.equal(detectInAppBrowser('Mozilla/5.0 FBAV/500.0'), 'inApp');
assert.equal(detectInAppBrowser('Mozilla/5.0 Version/18.0 Mobile Safari/604.1'), null);

const localeKeys = vm.runInContext('Object.fromEntries(Object.entries(translations).map(([locale, value]) => [locale, Object.keys(value).sort()]))', context);
assert.deepEqual(Object.keys(localeKeys).sort(), ['de', 'en', 'fr', 'sv']);
for (const locale of ['de', 'fr', 'sv']) {
    assert.deepEqual(Array.from(localeKeys[locale]), Array.from(localeKeys.en), `${locale} must have the same copy keys as English`);
}

assert.match(html, /https:\/\/apps\.apple\.com\/app\/id6744241928/);
assert.doesNotMatch(html, /play\.google\.com\/store\/apps\/details/);
assert.match(html, /location\.replace\(IOS_APP_STORE_URL\)/);
assert.doesNotMatch(html, /window\.location\.href\s*=/);
assert.match(html, /Coming soon on Google Play/);
assert.match(html, /<link rel="canonical" href="https:\/\/amenbible\.app\/">/);
assert.match(html, /<meta property="og:image" content="https:\/\/amenbible\.app\/og-image\.png">/);
assert.match(html, /min-height: 100dvh/);
assert.match(html, /overflow-y: auto/);
assert.match(html, /prefers-reduced-motion: reduce/);
assert.match(html, /env\(safe-area-inset-top\)/);
assert.doesNotMatch(html, /fonts\.googleapis\.com/);

const iconPath = path.join(repoRoot, 'amen-app-icon.webp');
const socialImagePath = path.join(repoRoot, 'og-image.png');
assert.ok(fs.existsSync(iconPath), 'optimized app icon must exist');
assert.ok(fs.statSync(iconPath).size < 20_000, 'optimized app icon should remain under 20 KB');
assert.ok(fs.existsSync(socialImagePath), 'Open Graph image must exist');
assert.ok(fs.statSync(socialImagePath).size < 200_000, 'Open Graph image should remain under 200 KB');

for (const legalFile of ['privacy.html', 'datenschutz.html']) {
    const source = fs.readFileSync(path.join(repoRoot, legalFile), 'utf8');
    assert.match(source, /amenbible\.app/);
    assert.doesNotMatch(source, /amen-app\.com|SwiperJS|Font Awesome|fonts\.googleapis\.com/);
}

for (const htmlFile of fs.readdirSync(repoRoot).filter((name) => name.endsWith('.html'))) {
    const source = fs.readFileSync(path.join(repoRoot, htmlFile), 'utf8');
    assert.doesNotMatch(source, /fonts\.googleapis\.com/, `${htmlFile} should not load third-party web fonts`);
    assert.doesNotMatch(source, /Amen \(1\)\.png/, `${htmlFile} should use the optimized icon`);
}

for (const legacyPage of ['appstore_blocked.html', 'datenschutz.html', 'nutzungsbedingungen.html', 'privacy.html', 'support.html', 'terms.html']) {
    const source = fs.readFileSync(path.join(repoRoot, legacyPage), 'utf8');
    assert.match(source, /<style>\s*\*\s*\{\s*margin:\s*0;/, `${legacyPage} must retain its universal CSS reset`);
}

console.log('Amen landing-page checks passed.');
