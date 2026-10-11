(function () {
  'use strict';
  const translations = JSON.parse(document.getElementById('not-found-copy').textContent);
  const params = new URLSearchParams(window.location.search);
  const primary = params.has('lang') ? params.get('lang') : (navigator.languages?.length ? navigator.languages[0] : navigator.language);
  const language = typeof primary === 'string' ? primary.trim().replace(/_/g, '-').split('-')[0].toLowerCase() : 'en';
  const locale = Object.prototype.hasOwnProperty.call(translations, language) ? language : 'en';
  const copy = translations[locale];
  document.documentElement.lang = locale;
  document.title = copy.notFound.title + ' · amen';
  document.querySelector('meta[name="description"]').setAttribute('content', copy.notFound.description);
  for (const element of document.querySelectorAll('[data-copy]')) {
    const [section, key] = element.dataset.copy.split('.');
    element.textContent = copy[section][key];
  }
  document.querySelector('.brand').setAttribute('aria-label', copy.ui.home);
  document.querySelector('.site-header nav').setAttribute('aria-label', copy.ui.documents);
  document.querySelector('.languages').setAttribute('aria-label', copy.ui.language);
  document.getElementById('current-language').textContent = copy.languageName;
  for (const link of document.querySelectorAll('[data-legal-document]')) {
    link.setAttribute('href', '/legal/' + locale + '/' + link.dataset.legalDocument + '.html');
  }
  const page = new URL(window.location.href);
  page.search = '';
  page.hash = '';
  document.querySelector('.auto-language').setAttribute('href', page.href);
  for (const link of document.querySelectorAll('[data-error-language]')) {
    page.searchParams.set('lang', link.dataset.errorLanguage);
    link.setAttribute('href', page.href);
    if (link.dataset.errorLanguage === locale) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}());
