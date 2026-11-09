(function () {
  'use strict';
  const supported = ['en', 'de', 'es', 'fr', 'it', 'sv'];
  const platforms = ['ios', 'android'];
  // Every legal page has an iOS and an Android URL.
  const versioned = ['privacy', 'terms', 'support', 'imprint', 'delete-account'];
  function normalize(locale) {
    if (typeof locale !== 'string') return 'en';
    const language = locale.trim().replace(/_/g, '-').split('-')[0].toLowerCase();
    return supported.includes(language) ? language : 'en';
  }
  function detectLanguage(locales) {
    return normalize(Array.isArray(locales) ? locales[0] : null);
  }
  function normalizePlatform(value) {
    const platform = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return platforms.includes(platform) ? platform : null;
  }
  // Only a phone or tablet is matched. A desktop keeps the shared page and its visible choice.
  function detectPlatform() {
    const hints = navigator.userAgentData;
    const hinted = hints && typeof hints.platform === 'string' ? hints.platform : '';
    const agent = typeof navigator.userAgent === 'string' ? navigator.userAgent : '';
    if (/android/i.test(hinted) || /Android/i.test(agent)) return 'android';
    if (/iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return 'ios';
    return null;
  }
  const root = document.documentElement;
  const kind = root.dataset.document;
  if (!['privacy', 'terms', 'support', 'imprint', 'delete-account'].includes(kind)) return;
  const params = new URLSearchParams(window.location.search);
  const browserLocales = navigator.languages?.length ? Array.from(navigator.languages) : [navigator.language];
  const locale = params.has('lang') ? normalize(params.get('lang')) :
    (root.dataset.autoLanguage === 'true' ? detectLanguage(browserLocales) : normalize(root.lang));
  // An explicit /ios/ or /android/ URL always wins. Otherwise ?platform= wins over the device.
  let platform = null;
  if (versioned.includes(kind)) {
    platform = normalizePlatform(root.dataset.platform) ||
      (params.has('platform') ? normalizePlatform(params.get('platform')) : detectPlatform());
  }
  const canonical = '/legal/' + locale + '/' + (platform ? platform + '/' : '') + kind + '/';
  if (window.location.pathname !== canonical) {
    window.location.replace(canonical + window.location.hash);
    return;
  }
  const printButton = document.getElementById('print-document');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', function () { window.print(); });
  }
  for (const link of document.querySelectorAll('[data-language], .auto-language')) {
    link.hash = window.location.hash;
    link.addEventListener('click', function () { link.hash = window.location.hash; });
  }
}());
