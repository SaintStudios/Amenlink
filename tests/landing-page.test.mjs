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
assert.equal(detectLanguage(['en-AT']), 'en');
assert.equal(detectLanguage(['fr-CH']), 'fr');
assert.equal(detectLanguage(['en-SE']), 'en');
assert.equal(detectLanguage(['sv-FI']), 'sv');
assert.equal(detectLanguage(['fr-CA']), 'fr');
assert.equal(detectLanguage(['es-ES']), 'es');
assert.equal(detectLanguage(['it-IT']), 'it');
assert.equal(detectLanguage(['es-DE']), 'es');
assert.equal(detectLanguage(['pt-BR', 'de-DE']), 'en');
assert.equal(detectLanguage(['SV_fi']), 'sv');
assert.equal(detectLanguage(['constructor']), 'en');
assert.equal(detectLanguage(null), 'en');
assert.equal(detectLanguage([]), 'en');

const platformFixtures = [
    {
        name: 'Mac Chrome',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        platform: 'MacIntel',
        touchPoints: 0,
        expected: 'mac'
    },
    {
        name: 'Mac Safari',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
        platform: 'MacIntel',
        touchPoints: 0,
        expected: 'mac'
    },
    {
        name: 'Mac Firefox',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:129.0) Gecko/20100101 Firefox/129.0',
        platform: 'MacIntel',
        touchPoints: 0,
        expected: 'mac'
    },
    {
        name: 'iPad desktop mode',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
        platform: 'MacIntel',
        touchPoints: 5,
        expected: 'ios'
    },
    {
        name: 'iPhone Chrome',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/128.0.0.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        touchPoints: 5,
        expected: 'ios'
    },
    {
        name: 'Android',
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel Tablet)',
        platform: 'Linux armv8l',
        touchPoints: 10,
        expected: 'android'
    },
    {
        name: 'Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        touchPoints: 0,
        expected: 'other'
    },
    {
        name: 'Linux',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/129.0',
        platform: 'Linux x86_64',
        touchPoints: 0,
        expected: 'other'
    }
];

for (const fixture of platformFixtures) {
    assert.equal(
        detectPlatform(fixture.userAgent, fixture.platform, fixture.touchPoints),
        fixture.expected,
        `${fixture.name} platform routing`
    );
}
assert.equal(detectPlatform('Mozilla/5.0 AppleWebKit/537.36', 'MacIntel', 0), 'mac', 'Mac-like platform must be sufficient');
assert.equal(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)', '', 0), 'mac', 'Mac user-agent tokens must be sufficient');

assert.equal(detectInAppBrowser('Mozilla/5.0 TikTok 38.1.0'), 'tiktok');
assert.equal(detectInAppBrowser('Mozilla/5.0 musical_ly'), 'tiktok');
assert.equal(detectInAppBrowser('Mozilla/5.0 Instagram 348.0'), 'inApp');
assert.equal(detectInAppBrowser('Mozilla/5.0 FBAV/500.0'), 'inApp');
assert.equal(detectInAppBrowser('Mozilla/5.0 Version/18.0 Mobile Safari/604.1'), null);

const localeKeys = vm.runInContext('Object.fromEntries(Object.entries(translations).map(([locale, value]) => [locale, Object.keys(value).sort()]))', context);
assert.deepEqual(Object.keys(localeKeys).sort(), ['de', 'en', 'es', 'fr', 'it', 'sv']);
for (const locale of ['de', 'es', 'fr', 'it', 'sv']) {
    assert.deepEqual(Array.from(localeKeys[locale]), Array.from(localeKeys.en), `${locale} must have the same copy keys as English`);
}

const openingStoreTitles = JSON.parse(vm.runInContext(
    'JSON.stringify(Object.fromEntries(Object.entries(translations).map(([locale, value]) => [locale, value.openingStore])))',
    context
));
assert.deepEqual(openingStoreTitles, {
    de: 'App Store wird geladen',
    fr: 'Chargement de l’App Store',
    sv: 'Laddar App Store',
    es: 'Cargando el App Store',
    it: 'Caricamento dell’App Store',
    en: 'Loading the App Store'
}, 'the external-iOS loading headline must use the approved localized titles without ellipses');

const iosOpeningSource = functionSource.match(/if \(platform === 'ios'\) \{[\s\S]*?\n            \}/)?.[0] ?? '';
assert.match(iosOpeningSource, /setText\('headline', copy\.openingStore\)/, 'external iOS must use openingStore as the headline');
assert.match(iosOpeningSource, /\blead\.hidden = true;/, 'external iOS must hide the lead with the native hidden property');
assert.equal((functionSource.match(/\blead\.hidden\s*=\s*true/g) ?? []).length, 1, 'only the external-iOS branch may hide the lead');

const sharedSpecialHeadlineSelector = 'body.is-tiktok h1,\n        body.is-opening-store h1 {';
const sharedSpecialHeadlineIndex = html.indexOf(sharedSpecialHeadlineSelector);
assert.ok(sharedSpecialHeadlineIndex >= 0, 'TikTok and opening-store must retain their shared headline rule');
const cssAfterSharedHeadlineRule = html.slice(sharedSpecialHeadlineIndex + sharedSpecialHeadlineSelector.length);
const openingStoreHeadlineStyles = cssAfterSharedHeadlineRule.match(/body\.is-opening-store h1 \{([\s\S]*?)\n        \}/)?.[1] ?? '';
assert.match(openingStoreHeadlineStyles, /font-size: clamp\(1\.45rem, 6vw, 1\.5rem\);/, 'opening-store needs a later scoped 23–24px headline override');
assert.match(html, /body\.is-tiktok h1,\s*body\.is-opening-store h1 \{[\s\S]*?font-size: clamp\(1\.55rem, 6\.8vw, 1\.95rem\);/, 'the shared TikTok headline sizing must remain unchanged');

const iosAppStoreUrl = 'https://apps.apple.com/app/id6744241928';
assert.match(html, /https:\/\/apps\.apple\.com\/app\/id6744241928/);
assert.doesNotMatch(html, /itms-apps:|macappstore:/, 'Apple routing must never trigger a custom-scheme inter-app prompt');

const openIosAppStoreSource = functionSource.match(/function openIosAppStore\(\) \{[\s\S]*?\n        \}/)?.[0] ?? '';
assert.match(openIosAppStoreSource, /window\.location\.replace\(IOS_APP_STORE_URL\)/);
assert.doesNotMatch(openIosAppStoreSource, /setTimeout|IOS_APP_STORE_NATIVE_URL/, 'the App Store attempt must use HTTPS once');

const macOpeningSource = functionSource.match(/if \(platform === 'mac'\) \{[\s\S]*?\n            \}/)?.[0] ?? '';
assert.match(macOpeningSource, /openIosAppStore\(\);\s*return;/, 'normal macOS must navigate immediately and return');
assert.doesNotMatch(macOpeningSource, /is-opening-store|setTimeout/, 'macOS must not enter the iOS loading state');
assert.ok(
    functionSource.indexOf("if (isRestricted) {") < functionSource.indexOf("if (platform === 'mac') {"),
    'restricted in-app routing must take precedence over macOS navigation'
);

function createClassList() {
    const names = new Set();
    return {
        add(...values) {
            for (const value of values) names.add(value);
        },
        contains(value) {
            return names.has(value);
        }
    };
}

function runInitialization(fixture) {
    const attemptedUrls = [];
    const pendingTimers = new Map();
    let nextTimer = 1;
    const elementIds = [
        'brandTagline', 'stepOne', 'stepTwo', 'copyButtonLabel', 'fallbackHint',
        'storeLinkLabel', 'comingSoonLabel', 'privacyLink', 'termsLink', 'supportLink', 'imprintLink',
        'statusPill', 'steps', 'storeLink', 'copyButton', 'lead', 'comingSoon', 'headline'
    ];
    const elements = Object.fromEntries(elementIds.map((id) => [id, {
        textContent: id === 'headline' ? 'initial headline' : '',
        hidden: id === 'copyButton',
        href: '',
        classList: createClassList(),
        setAttribute(name, value) {
            this[name] = value;
        }
    }]));
    const actions = { hidden: false, classList: createClassList() };
    const description = {
        setAttribute(name, value) {
            this[name] = value;
        }
    };
    const body = { classList: createClassList() };
    const document = {
        title: '',
        documentElement: { lang: '' },
        body,
        getElementById: (id) => elements[id] ?? null,
        querySelector(selector) {
            if (selector === '.actions') return actions;
            if (selector === 'meta[name="description"]') return description;
            return null;
        }
    };
    const fixtureContext = vm.createContext({
        navigator: {
            languages: ['en-US'],
            language: 'en-US',
            userAgent: fixture.userAgent,
            platform: fixture.platform,
            maxTouchPoints: fixture.touchPoints
        },
        window: {
            location: { replace: (url) => attemptedUrls.push(url) },
            setTimeout(callback) {
                const timer = nextTimer++;
                pendingTimers.set(timer, callback);
                return timer;
            },
            clearTimeout: (timer) => pendingTimers.delete(timer)
        },
        document,
        console
    });
    vm.runInContext(functionSource, fixtureContext, { filename: 'index.inline.js' });
    fixtureContext.initializePage();
    return { actions, attemptedUrls, body, elements, pendingTimers };
}

for (const fixture of platformFixtures.filter(({ expected }) => expected === 'mac')) {
    const result = runInitialization(fixture);
    assert.deepEqual(result.attemptedUrls, [iosAppStoreUrl], `${fixture.name} must make exactly one immediate HTTPS navigation`);
    assert.equal(result.pendingTimers.size, 0, `${fixture.name} must not schedule the iOS loading timer`);
    assert.equal(result.body.classList.contains('is-opening-store'), false, `${fixture.name} must not enter the iOS loading state`);
    assert.equal(result.elements.headline.textContent, 'initial headline', `${fixture.name} must return before the desktop fallback`);
    assert.equal(result.elements.comingSoon.classList.contains('is-visible'), false, `${fixture.name} must return before showing the desktop badge`);
}

for (const [marker, stateClass] of [
    ['TikTok 38.1.0', 'is-tiktok'],
    ['Instagram 348.0', 'is-restricted']
]) {
    const result = runInitialization({
        ...platformFixtures[0],
        userAgent: `${platformFixtures[0].userAgent} ${marker}`
    });
    assert.deepEqual(result.attemptedUrls, [], `${marker} on Mac must not navigate automatically`);
    assert.equal(result.pendingTimers.size, 0, `${marker} on Mac must not schedule a store attempt`);
    assert.equal(result.body.classList.contains(stateClass), true, `${marker} on Mac must retain its restricted recovery state`);
}

const androidRestrictedResult = runInitialization({
    ...platformFixtures.find(({ name }) => name === 'Android'),
    userAgent: `${platformFixtures.find(({ name }) => name === 'Android').userAgent} TikTok 38.1.0`
});
assert.deepEqual(androidRestrictedResult.attemptedUrls, [], 'Android routing must not navigate to Apple, including inside TikTok');
assert.equal(androidRestrictedResult.elements.comingSoon.classList.contains('is-visible'), true, 'Android routing must retain its coming-soon state');
assert.equal(androidRestrictedResult.body.classList.contains('is-tiktok'), false, 'Android routing must return before Apple-focused TikTok instructions');

for (const fixture of platformFixtures.filter(({ expected }) => expected === 'ios')) {
    const result = runInitialization(fixture);
    assert.deepEqual(result.attemptedUrls, [], `${fixture.name} must retain its delayed iOS navigation`);
    assert.equal(result.pendingTimers.size, 1, `${fixture.name} must retain one iOS loading timer`);
    assert.equal(result.body.classList.contains('is-opening-store'), true, `${fixture.name} must retain the iOS loading state`);
    assert.equal(result.elements.lead.hidden, true, `${fixture.name} must retain the title-only iOS loading state`);
}

for (const fixture of platformFixtures.filter(({ expected }) => expected === 'other')) {
    const result = runInitialization(fixture);
    assert.deepEqual(result.attemptedUrls, [], `${fixture.name} desktop must not navigate automatically`);
    assert.equal(result.pendingTimers.size, 0, `${fixture.name} desktop must not schedule a store attempt`);
    assert.equal(result.elements.headline.textContent, 'Download the Amen app', `${fixture.name} must retain the desktop fallback`);
    assert.equal(result.elements.comingSoon.classList.contains('is-visible'), true, `${fixture.name} must retain the desktop badge`);
}

const attemptedStoreUrls = [];
const pendingStoreTimers = new Map();
let nextStoreTimer = 1;
context.window.location = { replace: (url) => attemptedStoreUrls.push(url) };
context.window.setTimeout = (callback) => {
    const timer = nextStoreTimer++;
    pendingStoreTimers.set(timer, callback);
    return timer;
};
context.window.clearTimeout = (timer) => pendingStoreTimers.delete(timer);

const importantRegressionFailures = [];
try {
    vm.runInContext('iosStoreTimer = window.setTimeout(openIosAppStore, 150); openIosAppStore();', context);
    for (const callback of pendingStoreTimers.values()) callback();
    assert.deepEqual(Array.from(attemptedStoreUrls), [iosAppStoreUrl], 'an iOS click before 150ms must cancel the automatic attempt');
} catch (error) {
    importantRegressionFailures.push(`early iOS retry: ${error.message}`);
}

const storeLinkClickSource = scriptMatch[1].match(/document\.getElementById\('storeLink'\)\.addEventListener\('click',[\s\S]*?\n        \}\);/)?.[0] ?? '';
try {
    assert.match(storeLinkClickSource, /if \(!document\.body\.classList\.contains\('is-opening-store'\)\) return;[\s\S]*?event\.preventDefault\(\);/, 'non-iOS clicks must retain default anchor navigation');
} catch (error) {
    importantRegressionFailures.push(`non-iOS store link: ${error.message}`);
}
assert.deepEqual(importantRegressionFailures, [], `independent-review regressions:\n${importantRegressionFailures.join('\n')}`);

attemptedStoreUrls.length = 0;
context.openIosAppStore();
assert.deepEqual(Array.from(attemptedStoreUrls), [iosAppStoreUrl], 'an App Store attempt must make one HTTPS navigation');

assert.match(html, /if \(platform === 'ios'\) \{[\s\S]*?setText\('storeLinkLabel', copy\.retryStoreButton\)[\s\S]*?actions\.hidden = false;[\s\S]*?storeLink\.hidden = false;[\s\S]*?copyButton\.hidden = true;[\s\S]*?iosStoreTimer = window\.setTimeout\(openIosAppStore, 150\)/, 'iOS opening state must expose only the localized App Store retry action');
assert.match(storeLinkClickSource, /event\.preventDefault\(\);[\s\S]*?openIosAppStore\(\);/, 'the retry button must repeat the HTTPS App Store attempt');
assert.doesNotMatch(html, /body\.is-opening-store \.actions,/, 'iOS opening-state actions must remain visible');
assert.doesNotMatch(html, /play\.google\.com\/store\/apps\/details/);
assert.doesNotMatch(html, /window\.location\.href\s*=/);
assert.match(html, /Coming soon on Google Play/);

const browserCue = html.match(/<div class="browser-cue"[\s\S]*?<\/div>/)?.[0] ?? '';
assert.match(browserCue, /<svg[\s\S]*?<\/svg>/, 'TikTok cue should be one drawn arrow');
assert.match(browserCue, /<svg viewBox="0 0 40 48"/);
assert.match(browserCue, /<path d="M20 43V8M11 17L20 8L29 17"/, 'TikTok arrow must point straight up');
assert.doesNotMatch(browserCue, /•••|\.\.\./, 'TikTok cue must not duplicate TikTok’s three-dot menu');
const browserCueStyles = html.match(/\.browser-cue \{([\s\S]*?)\n        \}/)?.[1] ?? '';
assert.match(browserCueStyles, /right: max\(2px, calc\(env\(safe-area-inset-right\) \+ 2px\)\);/, 'TikTok arrow must sit at the far-right safe-area edge');
assert.match(browserCueStyles, /width: 40px;[\s\S]*?height: 48px;/);
assert.match(html, /document\.body\.classList\.add\('is-tiktok'\)/);
assert.match(html, /body\.is-tiktok \.brand-copy,\s*body\.is-opening-store \.brand-copy\s*\{\s*display:\s*none;/);
assert.match(html, /body\.is-tiktok \.actions[\s\S]*?body\.is-tiktok \.fallback-hint[\s\S]*?display:\s*none(?:\s*!important)?;/);
assert.doesNotMatch(html, /tiktokStatus|In TikTok geöffnet|Opened in TikTok|Ouvert dans TikTok|Öppnad i TikTok/);

for (const requiredCopy of [
    'App-Store-Links lassen sich im In-App-Browser von TikTok nicht direkt öffnen.',
    'Les liens vers l’App Store ne s’ouvrent pas directement dans le navigateur intégré de TikTok.',
    'Länkar till App Store öppnas inte direkt i TikToks inbyggda webbläsare.',
    'App Store links don’t open directly in TikTok’s in-app browser.',
    'Tippe oben rechts auf das Drei-Punkte-Menü.',
    'Appuie sur le menu à trois points en haut à droite.',
    'Tryck på menyn med tre punkter uppe till höger.',
    'Tap the three-dot menu in the top right.',
    'Tippe oben rechts auf „Teilen“ oder auf das Drei-Punkte-Menü.',
    'En haut à droite, appuie sur « Partager » ou sur le menu à trois points.',
    'Tryck på ”Dela” eller menyn med tre punkter uppe till höger.',
    'Tap Share or the three-dot menu in the top right.'
]) {
    assert.match(html, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
assert.match(html, /if \(isRestricted\)[\s\S]*?setText\('stepOne', copy\.inAppStepOne\)/);
assert.match(html, /<link rel="canonical" href="https:\/\/amen-app\.com\/">/);
assert.match(html, /<meta property="og:image" content="https:\/\/amen-app\.com\/og-image\.png">/);
assert.match(html, /<meta name="theme-color" content="#fcf7ed">/);
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
    assert.match(source, /amen-app\.com/);
    assert.doesNotMatch(source, /amenbible\.app|SwiperJS|Font Awesome|fonts\.googleapis\.com/);
}

for (const htmlFile of fs.readdirSync(repoRoot).filter((name) => name.endsWith('.html'))) {
    const source = fs.readFileSync(path.join(repoRoot, htmlFile), 'utf8');
    assert.doesNotMatch(source, /fonts\.googleapis\.com/, `${htmlFile} should not load third-party web fonts`);
    assert.doesNotMatch(source, /Amen \(1\)\.png/, `${htmlFile} should use the optimized icon`);
}

const blockedPage = fs.readFileSync(path.join(repoRoot, 'appstore_blocked.html'), 'utf8');
assert.match(blockedPage, /<style>\s*\*\s*\{\s*margin:\s*0;/, 'the existing blocked-store page retains its reset');
for (const legalPage of ['datenschutz.html', 'nutzungsbedingungen.html', 'privacy.html', 'support.html', 'terms.html']) {
    const source = fs.readFileSync(path.join(repoRoot, legalPage), 'utf8');
    assert.match(source, /href="\/assets\/legal.css\?v=[a-f0-9]{12}"/, legalPage + ' must use the current shared legal stylesheet');
}

console.log('Amen landing-page checks passed.');
