(function () {
  'use strict';
  if (['/404.html', '/404/index.html'].includes(window.location.pathname)) {
    window.location.replace('/404/' + window.location.search + window.location.hash);
    return;
  }
  const translations = JSON.parse(document.getElementById('not-found-copy').textContent);
  const params = new URLSearchParams(window.location.search);
  const supported = (value) => Object.prototype.hasOwnProperty.call(translations, value);
  // A missing /legal/fr/… or /fr/… page keeps the language its link was written in.
  const pathLanguage = (pathname) => {
    const legal = /^\/legal\/([^/]+)/.exec(pathname);
    if (legal) return legal[1];
    const short = /^\/([a-z]{2})(?:\/|$)/i.exec(pathname);
    return short && supported(short[1].toLowerCase()) ? short[1] : null;
  };
  // A broken link followed from one of our localized pages keeps that page's language.
  const referrerLanguage = () => {
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === new URL(window.location.href).origin ? pathLanguage(referrer.pathname) : null;
    } catch (error) {
      return null;
    }
  };
  const primary = params.has('lang') ? params.get('lang')
    : (pathLanguage(window.location.pathname) ?? referrerLanguage() ?? (navigator.languages?.length ? navigator.languages[0] : navigator.language));
  const language = typeof primary === 'string' ? primary.trim().replace(/_/g, '-').split('-')[0].toLowerCase() : 'en';
  const locale = supported(language) ? language : 'en';
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
    link.setAttribute('href', '/legal/' + locale + '/' + link.dataset.legalDocument + '/');
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
