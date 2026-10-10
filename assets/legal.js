(function () {
  'use strict';
  const supported = ['en', 'de', 'es', 'fr', 'it', 'sv'];
  function normalize(locale) {
    if (typeof locale !== 'string') return 'en';
    const language = locale.trim().replace(/_/g, '-').split('-')[0].toLowerCase();
    return supported.includes(language) ? language : 'en';
  }
  function detectLanguage(locales) {
    return normalize(Array.isArray(locales) ? locales[0] : null);
  }
  const root = document.documentElement;
  const kind = root.dataset.document;
  if (!['privacy', 'terms', 'support', 'imprint'].includes(kind)) return;
  const params = new URLSearchParams(window.location.search);
  const browserLocales = navigator.languages?.length ? Array.from(navigator.languages) : [navigator.language];
  const locale = params.has('lang') ? normalize(params.get('lang')) : detectLanguage(browserLocales);
  if ((root.dataset.autoLanguage === 'true' || params.has('lang')) && window.location.pathname !== '/legal/' + locale + '/' + kind + '.html') {
    window.location.replace('/legal/' + locale + '/' + kind + '.html' + window.location.hash);
    return;
  }
  const printButton = document.getElementById('print-document');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', function () { window.print(); });
  }
  for (const link of document.querySelectorAll('[data-language]')) {
    link.hash = window.location.hash;
    link.addEventListener('click', function () { link.hash = window.location.hash; });
  }
}());
