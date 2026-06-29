/* OTONOM — Panneau de réglage d'apparence (outil interne, non destiné au public final)
   - Onglet discret sur le bord droit -> ouvre un panneau de réglages.
   - Modifie en direct les variables CSS de :root (couleurs, arrondis, filets, quadrillage).
   - Persiste dans localStorage : les réglages s'appliquent à TOUT le site (même origine).
   - « Copier les réglages » -> CSS prêt à coller, pour transmettre le choix retenu.
*/
(function () {
  var STORE = 'otonom-theme-v1';
  var root = document.documentElement;

  var GROUPS = [
    { title: 'Sections sombres', items: [
      { v: '--bg',   label: 'Fond',            type: 'color' },
      { v: '--bg-1', label: 'Panneaux / cartes', type: 'color' },
      { v: '--ink',  label: 'Texte',           type: 'color' },
      { v: '--muted',label: 'Texte atténué',   type: 'color' }
    ]},
    { title: 'Accent', items: [
      { v: '--white', label: 'Accent / boutons', type: 'color' }
    ]},
    { title: 'Sections claires', items: [
      { v: '--l-bg',   label: 'Fond clair',     type: 'color' },
      { v: '--l-bg1',  label: 'Cartes claires', type: 'color' },
      { v: '--l-ink',  label: 'Texte clair',    type: 'color' },
      { v: '--l-muted',label: 'Texte atténué',  type: 'color' }
    ]},
    { title: 'Global', items: [
      { v: '--radius',     label: 'Arrondis',        type: 'range', min: 0, max: 24,  step: 1,   unit: 'px' },
      { v: '--line-a',     label: 'Filets (sombre)', type: 'range', min: 0, max: 0.35, step: 0.01 },
      { v: '--l-line-a',   label: 'Filets (clair)',  type: 'range', min: 0, max: 0.35, step: 0.01 },
      { key: 'grid',       label: 'Quadrillage du hero', type: 'switch' }
    ]}
  ];

  // --- état persistant ---
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { saved = {}; }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {} }

  function applyVar(v, val) { root.style.setProperty(v, val); }
  function setGrid(on) {
    document.querySelectorAll('.grid-faint').forEach(function (g) { g.style.display = on ? '' : 'none'; });
  }

  // applique l'état sauvegardé le plus tôt possible
  Object.keys(saved).forEach(function (k) {
    if (k === 'grid') { if (saved.grid === false) setGrid(false); }
    else applyVar(k, saved[k]);
  });

  function computed(v) { return getComputedStyle(root).getPropertyValue(v).trim(); }
  function initColor(v) {
    var c = (saved[v] != null) ? saved[v] : computed(v);
    c = (c || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#000000';
  }
  function initNum(v) {
    var raw = (saved[v] != null) ? saved[v] : computed(v);
    return parseFloat(raw) || 0;
  }

  // --- construction du DOM ---
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var tab = el('button', 'tx-tab');
  tab.setAttribute('aria-expanded', 'false');
  tab.setAttribute('aria-controls', 'tx-panel');
  tab.setAttribute('title', "Réglages d'apparence (interne)");
  tab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Thème</span>';

  var backdrop = el('div', 'tx-backdrop');
  var panel = el('aside', 'tx-panel');
  panel.id = 'tx-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', "Réglages d'apparence");

  var head = el('div', 'tx-head');
  head.innerHTML = '<div><h3>Apparence</h3><div class="tx-sub">réglage live · interne</div></div>';
  var close = el('button', 'tx-close', '&times;');
  close.setAttribute('aria-label', 'Fermer');
  head.appendChild(close);
  panel.appendChild(head);

  var body = el('div', 'tx-body');

  GROUPS.forEach(function (g) {
    var grp = el('div', 'tx-group');
    grp.appendChild(el('span', 'tx-gtitle', g.title));
    g.items.forEach(function (it) {
      var row = el('label', 'tx-row');
      row.appendChild(el('span', null, it.label));
      if (it.type === 'color') {
        var ci = el('input'); ci.type = 'color'; ci.value = initColor(it.v);
        ci.addEventListener('input', function () { applyVar(it.v, ci.value); saved[it.v] = ci.value; persist(); });
        row.appendChild(ci);
      } else if (it.type === 'range') {
        var val = el('span', 'tx-val');
        var ri = el('input'); ri.type = 'range'; ri.min = it.min; ri.max = it.max; ri.step = it.step;
        ri.value = initNum(it.v);
        var fmt = function (n) { return it.unit ? (n + it.unit) : (Math.round(n * 100) / 100).toFixed(2); };
        val.textContent = fmt(parseFloat(ri.value));
        ri.addEventListener('input', function () {
          var out = it.unit ? (ri.value + it.unit) : ri.value;
          applyVar(it.v, out); saved[it.v] = out; persist(); val.textContent = fmt(parseFloat(ri.value));
        });
        row.appendChild(ri); row.appendChild(val);
      } else if (it.type === 'switch') {
        var sw = el('input'); sw.type = 'checkbox';
        sw.checked = saved.grid !== false;
        sw.addEventListener('change', function () { setGrid(sw.checked); saved.grid = sw.checked; persist(); });
        row.appendChild(sw);
      }
      grp.appendChild(row);
    });
    body.appendChild(grp);
  });

  var actions = el('div', 'tx-actions');
  var resetBtn = el('button', 'tx-reset', 'Réinitialiser');
  var copyBtn = el('button', 'tx-copy', 'Copier les réglages');
  actions.appendChild(resetBtn); actions.appendChild(copyBtn);
  body.appendChild(actions);
  body.appendChild(el('p', 'tx-note', 'Les réglages sont mémorisés sur cet appareil et s’appliquent à toutes les pages. « Copier les réglages » place un bloc CSS dans le presse-papier, à renvoyer pour figer le choix retenu.'));
  panel.appendChild(body);

  // --- ouverture / fermeture ---
  function open() { panel.classList.add('open'); backdrop.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); tab.setAttribute('aria-expanded', 'true'); }
  function shut() { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); tab.setAttribute('aria-expanded', 'false'); }
  tab.addEventListener('click', function () { panel.classList.contains('open') ? shut() : open(); });
  close.addEventListener('click', shut);
  backdrop.addEventListener('click', shut);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) shut(); });

  // --- copier le CSS résultant ---
  function buildCss() {
    var lines = [':root{'];
    GROUPS.forEach(function (g) { g.items.forEach(function (it) {
      if (!it.v) return;
      var cur = computed(it.v) || (saved[it.v] || '');
      lines.push('  ' + it.v + ': ' + cur.trim() + ';');
    }); });
    lines.push('}');
    if (saved.grid === false) lines.push('/* quadrillage du hero désactivé : .grid-faint{display:none} */');
    return lines.join('\n');
  }
  function flash(btn, txt) { var o = btn.textContent; btn.textContent = txt; setTimeout(function () { btn.textContent = o; }, 1400); }
  copyBtn.addEventListener('click', function () {
    var css = buildCss();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(function () { flash(copyBtn, 'Copié ✓'); }, function () { fallbackCopy(css); flash(copyBtn, 'Copié ✓'); });
    } else { fallbackCopy(css); flash(copyBtn, 'Copié ✓'); }
  });
  function fallbackCopy(t) { var ta = el('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }

  // --- réinitialiser ---
  resetBtn.addEventListener('click', function () {
    GROUPS.forEach(function (g) { g.items.forEach(function (it) { if (it.v) root.style.removeProperty(it.v); }); });
    setGrid(true);
    saved = {}; persist();
    // resynchronise les contrôles sur les valeurs par défaut de la CSS
    panel.querySelectorAll('.tx-row input[type=color]').forEach(function (ci, i) {});
    flash(resetBtn, 'Rétabli ✓');
    // recharge léger pour réafficher proprement les valeurs par défaut dans les champs
    setTimeout(function () { location.reload(); }, 300);
  });

  document.body.appendChild(tab);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
})();
