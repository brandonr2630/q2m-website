/* Products spec-table filters. Inlined at the end of <body> on family pages by build-product-pages.js.
   Reads column definitions and strings from the inline JSON block script#filter-defs.
   Pure helpers are exported for Node tests (test-products-filters.js); no globals in the browser. */
(function () {
  'use strict';
  var NUM = /^-?(\d+(\.\d*)?|\.\d+)$/;
  function num(s) { s = String(s == null ? '' : s).trim(); return NUM.test(s) ? Number(s) : null; }
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function dec(s) { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return null; } }
  // Query string -> state { size: '105', 'kw-min': 5 }; unknown keys, bad numbers and unknown values are dropped.
  function parseQuery(search, cols) {
    var q = {}, st = {};
    String(search || '').replace(/^\?/, '').split('&').forEach(function (p) {
      var i = p.indexOf('='), k = dec(i < 0 ? p : p.slice(0, i)), v = dec(i < 0 ? '' : p.slice(i + 1));
      if (k && v != null) q[k] = v;
    });
    cols.forEach(function (c) {
      if (c.type === 'enum') { if (c.options.indexOf(q[c.key]) >= 0) st[c.key] = q[c.key]; return; }
      ['min', 'max'].forEach(function (b) { var n = num(q[c.key + '-' + b]); if (n !== null) st[c.key + '-' + b] = n; });
    });
    return st;
  }
  function toQuery(st, cols) {
    var out = [];
    cols.forEach(function (c) {
      (c.type === 'enum' ? [c.key] : [c.key + '-min', c.key + '-max']).forEach(function (k) {
        if (st[k] != null && st[k] !== '') out.push(k + '=' + encodeURIComponent(st[k]));
      });
    });
    return out.length ? '?' + out.join('&') : '';
  }
  // get(key) returns the row's data-* string. Min > max simply matches nothing.
  function matches(get, st, cols) {
    return cols.every(function (c) {
      if (c.type === 'enum') return st[c.key] == null || get(c.key) === st[c.key];
      var lo = st[c.key + '-min'], hi = st[c.key + '-max'];
      if (lo == null && hi == null) return true;
      var v = num(get(c.key));
      return v !== null && (lo == null || v >= lo) && (hi == null || v <= hi);
    });
  }
  function activeCount(st, cols) {
    return cols.filter(function (c) { return st[c.key] != null || st[c.key + '-min'] != null || st[c.key + '-max'] != null; }).length;
  }
  var api = { num: num, fill: fill, parseQuery: parseQuery, toQuery: toQuery, matches: matches, activeCount: activeCount };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function init() {
    var table = document.querySelector('.spec-table'), defsEl = document.getElementById('filter-defs');
    if (!table || !defsEl) return;
    var D = JSON.parse(defsEl.textContent), S = D.strings, cols = D.columns;
    var rows = [].slice.call(table.tBodies[0].rows), total = rows.length, timer = 0;
    var el = function (tag, props, kids) {
      var e = document.createElement(tag);
      for (var k in props) if (k === 'text') e.textContent = props[k]; else e.setAttribute(k, props[k]);
      (kids || []).forEach(function (c) { e.appendChild(c); });
      return e;
    };
    var inputs = {}, body = el('div', { class: 'filters-body' });
    cols.forEach(function (c) {
      var id = 'f-' + c.key, name = c.label + (c.unit ? ' (' + c.unit + ')' : '');
      if (c.type === 'enum') {
        var sel = inputs[c.key] = el('select', { id: id }, [el('option', { value: '', text: S.all })]);
        c.options.forEach(function (o) { sel.appendChild(el('option', { value: o, text: o })); });
        body.appendChild(el('div', { class: 'f-field' }, [el('label', { for: id, text: name }), sel]));
        return;
      }
      var pair = el('div', { class: 'f-pair' });
      ['min', 'max'].forEach(function (b) {
        var k = c.key + '-' + b, i = inputs[k] = el('input', { id: id + '-' + b, type: 'number', inputmode: 'decimal', step: 'any', placeholder: String(c[b]) });
        pair.appendChild(el('div', {}, [el('label', { for: i.id }, [el('span', { class: 'vh', text: name + ' ' }), document.createTextNode(S[b])]), i]));
      });
      body.appendChild(el('fieldset', { class: 'f-range' }, [el('legend', { text: name }), pair]));
    });
    var count = el('p', { class: 'filters-count', role: 'status', 'aria-live': 'polite' });
    var clear = el('button', { type: 'button', class: 'filters-clear', text: S.clear });
    var badge = el('span', { class: 'filters-n' });
    body.appendChild(count); body.appendChild(clear);
    var box = el('details', { class: 'filters' }, [el('summary', {}, [document.createTextNode(S.models + ' '), badge]), body]);
    var clear2 = el('button', { type: 'button', class: 'filters-clear', text: S.clear });
    var none = el('tr', { class: 'spec-none', hidden: '' }, [el('td', { colspan: String(table.tHead.rows[0].cells.length) }, [el('span', { text: S.none + ' ' }), clear2])]);
    table.appendChild(el('tbody', { class: 'spec-none-body' }, [none]));

    function read() {
      var st = {};
      cols.forEach(function (c) {
        if (c.type === 'enum') { if (inputs[c.key].value) st[c.key] = inputs[c.key].value; return; }
        ['min', 'max'].forEach(function (b) { var n = num(inputs[c.key + '-' + b].value); if (n !== null) st[c.key + '-' + b] = n; });
      });
      return st;
    }
    function apply(st, now) {
      var n = 0, a = activeCount(st, cols);
      rows.forEach(function (r) { var ok = matches(function (k) { return r.getAttribute('data-' + k); }, st, cols); r.hidden = !ok; if (ok) n++; });
      none.hidden = n > 0;
      clear.disabled = !a;
      badge.textContent = a ? fill(S.active, { n: a }) : '';
      history.replaceState(null, '', location.pathname + toQuery(st, cols) + location.hash);
      clearTimeout(timer);
      var say = function () { count.textContent = fill(S.count, { n: n, total: total }); };
      if (now) say(); else timer = setTimeout(say, 300);
    }
    function reset() { for (var k in inputs) inputs[k].value = ''; apply({}); inputs[cols[0].key + (cols[0].type === 'enum' ? '' : '-min')].focus(); }
    body.addEventListener('input', function () { apply(read()); });
    body.addEventListener('change', function () { apply(read()); });
    clear.addEventListener('click', reset); clear2.addEventListener('click', reset);

    // Desktop (>= 900 px): filters in the left rail, open. Phones: a closed disclosure above the table.
    var rail = document.querySelector('.prod-rail'), slot = document.querySelector('.spec-filter-slot');
    var mq = window.matchMedia('(min-width: 900px)');
    function place() { (mq.matches && rail ? rail : slot).appendChild(box); if (mq.matches) box.open = true; }
    if (mq.addEventListener) mq.addEventListener('change', place); else mq.addListener(place);

    var st = parseQuery(location.search, cols);
    for (var k in st) inputs[k].value = st[k];
    if (activeCount(st, cols)) box.open = true;
    place();
    apply(st, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
