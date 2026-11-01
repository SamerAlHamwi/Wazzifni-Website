// Language switch for the whole site (landing page, /course/, /cv/). Arabic is the source language and is
// written in the pages and scripts as-is; when English is chosen, this swaps every Arabic text node and
// text attribute for its translation in js/i18n-en.js, including text the scripts add later, and flips the
// page to left-to-right. The choice is remembered on this device; switching reloads the page.
// Classic script, loaded in <head> right after i18n-en.js, so English pages never flash Arabic.
(function () {
  var KEY = 'wz_lang';
  var lang = 'ar';
  try { if (localStorage.getItem(KEY) === 'en') lang = 'en'; } catch (e) { /* storage unavailable */ }
  window.WZ_LANG = lang;

  // Any element with data-lang-toggle switches language
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-lang-toggle]');
    if (!btn) return;
    try { localStorage.setItem(KEY, lang === 'en' ? 'ar' : 'en'); } catch (err) { /* ignore */ }
    location.reload();
  });

  if (lang !== 'en') return;

  var root = document.documentElement;
  root.lang = 'en';
  root.dir = 'ltr';
  root.classList.add('i18n-pending');
  var hide = document.createElement('style');
  hide.textContent = 'html.i18n-pending body{visibility:hidden}';
  document.head.appendChild(hide);

  var DICT = window.WZ_EN || {};
  var PATTERNS = (window.WZ_EN_PATTERNS || []).map(function (p) { return [new RegExp('^' + p[0] + '$'), p[1]]; });
  var ARABIC = /[؀-ۿ]/;
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'content'];
  // Untranslated strings, for checking coverage from the console: [...WZ_MISSING]
  var missing = window.WZ_MISSING = new Set();

  // Arabic-Indic digits inside matched numbers read as Latin digits in English
  function latin(s) {
    return s.replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x06F0; })
      .replace(/٬/g, ',');
  }

  // Exact dictionary entry for a piece of text, or null
  function lookup(text) {
    var key = text.replace(/\s+/g, ' ').trim();
    return Object.prototype.hasOwnProperty.call(DICT, key) ? DICT[key] : null;
  }

  function translate(text) {
    var key = text.replace(/\s+/g, ' ').trim();
    if (!key || !ARABIC.test(key)) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = key.match(PATTERNS[i][0]);
      if (m) {
        return PATTERNS[i][1]
          .replace(/\$(\d)/g, function (_, n) { return latin(m[+n] || ''); })
          .replace(/\{(\d)\}/g, function (_, n) { var part = m[+n] || ''; var t = lookup(part); return t === null ? part : t; });
      }
    }
    missing.add(key);
    return null;
  }

  function skip(el) {
    return el.nodeName === 'SCRIPT' || el.nodeName === 'STYLE' || el.nodeName === 'TEXTAREA' || el.isContentEditable
      || (el.closest && el.closest('[data-no-i18n]'));
  }

  function doText(node) {
    var parent = node.parentNode;
    if (!parent || (parent.nodeType === 1 && skip(parent))) return;
    var value = node.nodeValue;
    var out = translate(value);
    if (out === null) return;
    node.nodeValue = value.match(/^\s*/)[0] + out + value.match(/\s*$/)[0];
  }

  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v && ARABIC.test(v)) {
        var out = translate(v);
        if (out !== null) el.setAttribute(ATTRS[i], out);
      }
    }
  }

  function walk(node) {
    if (node.nodeType === 3) { doText(node); return; }
    if (node.nodeType !== 1 || skip(node)) return;
    doAttrs(node);
    var tw = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeType === 1 && skip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var n;
    while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'childList') for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      else if (r.type === 'characterData') doText(r.target);
      else if (r.type === 'attributes') doAttrs(r.target);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  function ready() {
    walk(root);
    root.classList.remove('i18n-pending');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
