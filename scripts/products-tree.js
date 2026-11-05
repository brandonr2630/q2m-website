'use strict';
// Tree helpers for the Products catalogue (flat node list with parent ids).

const LANG_CODES = ['en', 'es', 'pt', 'nl', 'fr'];
const MAX_DESC = 160;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(node, field, reason) {
  throw new Error(`${node && node.id}: ${field}: ${reason}`);
}

function checkLangs(node, field, obj, max) {
  if (!obj || typeof obj !== 'object') fail(node, field, 'missing');
  for (const code of LANG_CODES) {
    const v = obj[code];
    if (typeof v !== 'string' || v.trim() === '') fail(node, `${field}.${code}`, 'missing or empty');
    if (max && v.length > max) fail(node, `${field}.${code}`, `is ${v.length} characters (max ${max})`);
  }
}

function isPopulated(node) {
  const rows = node.specs && node.specs.rows;
  return (Array.isArray(rows) && rows.length > 0) || node.live === true;
}

function validate(nodes, opts) {
  void opts;
  const byId = new Map();
  for (const n of nodes) {
    if (!n || typeof n.id !== 'string' || n.id === '') throw new Error('(unknown): id: missing');
    if (byId.has(n.id)) fail(n, 'id', 'duplicate id');
    byId.set(n.id, n);
  }
  const siblingSlugs = new Map();
  for (const n of nodes) {
    if (n.parent !== null && n.parent !== undefined && !byId.has(n.parent)) {
      fail(n, 'parent', `unknown parent "${n.parent}"`);
    }
    // cycle check: walk up, bounded by node count
    let cur = n;
    let steps = 0;
    while (cur && cur.parent != null) {
      cur = byId.get(cur.parent);
      if (++steps > nodes.length) fail(n, 'parent', 'parent cycle');
    }
    if (typeof n.slug !== 'string' || !SLUG_RE.test(n.slug)) fail(n, 'slug', 'must be lowercase letters, digits and hyphens');
    const key = `${n.parent == null ? '' : n.parent}/${n.slug}`;
    if (siblingSlugs.has(key)) fail(n, 'slug', `duplicate sibling slug "${n.slug}"`);
    siblingSlugs.set(key, true);
    if (typeof n.order !== 'number' || Number.isNaN(n.order)) fail(n, 'order', 'must be a number');
    checkLangs(n, 'name', n.name);
    checkLangs(n, 'description', n.description, MAX_DESC);
    // A category (no specs, not live, no migrated copy) needs its one-paragraph intro (spec §5).
    if (n.intro !== undefined || (n.specs === undefined && !n.live && !n.copy)) checkLangs(n, 'intro', n.intro);
    if (n.tileImage !== undefined) {
      if (!n.tileImage || typeof n.tileImage !== 'object') fail(n, 'tileImage', 'must be an object');
      checkLangs(n, 'tileImage.alt', n.tileImage.alt);
    }
    if (n.specs !== undefined && n.specs !== null) {
      if (typeof n.specs !== 'object' || Array.isArray(n.specs)) fail(n, 'specs', 'must be an object');
      const cols = n.specs.columns;
      const rows = n.specs.rows;
      if (!Array.isArray(cols)) fail(n, 'specs.columns', 'must be an array');
      if (!Array.isArray(rows)) fail(n, 'specs.rows', 'must be an array');
      const allowed = new Set(['id']);
      for (const c of cols) allowed.add(typeof c === 'string' ? c : c && c.key);
      rows.forEach((row, i) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) fail(n, `specs.rows[${i}]`, 'must be an object');
        for (const k of Object.keys(row)) {
          if (!allowed.has(k)) fail(n, `specs.rows[${i}].${k}`, 'key is not a declared column');
        }
      });
    }
  }
}

function published(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out = new Set();
  for (const n of nodes) {
    if (!isPopulated(n)) continue;
    let cur = n;
    while (cur && !out.has(cur.id)) {
      out.add(cur.id);
      cur = cur.parent == null ? null : byId.get(cur.parent);
    }
  }
  return out;
}

function childrenOf(nodes, id) {
  const want = id == null ? null : id;
  return nodes
    .filter((n) => (n.parent == null ? null : n.parent) === want)
    .sort((a, b) => a.order - b.order);
}

function pathTo(nodes, id) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out = [];
  let cur = byId.get(id);
  while (cur) {
    out.unshift(cur);
    if (out.length > nodes.length) throw new Error(`${id}: parent: parent cycle`);
    cur = cur.parent == null ? null : byId.get(cur.parent);
  }
  return out;
}

function nodeUrl(nodes, id, lang) {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  if (id != null && !nodes.some((n) => n.id === id)) throw new Error(`${id}: id: unknown node (nodeUrl)`);
  const slugs = id == null ? [] : pathTo(nodes, id).map((n) => n.slug);
  return `${prefix}/products/${slugs.map((s) => `${s}/`).join('')}`;
}

module.exports = { LANG_CODES, validate, published, childrenOf, pathTo, nodeUrl };
