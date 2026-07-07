// OTONOM — interactions légères (mobile nav, reveal, count-up)
(function () {
  // Marque que le JS tourne : seules les animations reveal s'activent alors.
  // Si ce script ne se charge pas, le CSS laisse tout le contenu visible.
  document.documentElement.classList.add('js');

  // --- Mobile nav ---
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Reveal on scroll ---
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // --- Count-up for elements with data-count ---
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1100, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(dec);
      el.textContent = prefix + Number(val).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + el.getAttribute('data-count') + suffix;
    });
  } else {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io2.observe(el); });
  }

  // --- Schéma facturation : le panneau « avec OTONOM » n'anime sa séquence
  //     qu'une fois celle de « aujourd'hui » terminée (et lui-même visible). ---
  var BEFORE_DUR = 5600; // durée de la séquence « aujourd'hui » (doit coller aux delays CSS)
  document.querySelectorAll('.compare').forEach(function (cmp) {
    var before = cmp.querySelector('.compare-panel:not(.compare-panel--after)');
    var after = cmp.querySelector('.compare-panel--after');
    if (!before || !after) return;
    if (reduce || !('IntersectionObserver' in window)) { after.classList.add('seq-go'); return; }
    var beforeDone = false, afterVisible = false;
    function maybeGo() { if (beforeDone && afterVisible) after.classList.add('seq-go'); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target === before) {
          io.unobserve(before);
          setTimeout(function () { beforeDone = true; maybeGo(); }, BEFORE_DUR);
        } else if (e.target === after) {
          io.unobserve(after);
          afterVisible = true; maybeGo();
        }
      });
    }, { threshold: 0.12 });
    io.observe(before); io.observe(after);
  });

  // --- Frise méthode « De A à Z » : le trait se dessine et s'arrête pile sur chaque nœud.
  //     Les positions des nœuds sont MESURÉES (pas de % en dur) → parfaitement aligné
  //     en desktop (trait horizontal) comme en mobile (trait vertical), à toute largeur. ---
  document.querySelectorAll('.tl').forEach(function (tl) {
    var nodes = [].slice.call(tl.querySelectorAll('.tl-node'));
    var steps = [].slice.call(tl.querySelectorAll('.tl-step'));
    if (nodes.length < 2) return;
    var fracs = [];

    // pose le trait exactement entre le 1er et le dernier nœud + relève la fraction de chaque nœud
    function measure() {
      var vertical = window.matchMedia('(max-width: 880px)').matches;
      var tr = tl.getBoundingClientRect();
      var pos = nodes.map(function (n) {
        var r = n.getBoundingClientRect();
        return vertical ? (r.top + r.height / 2) : (r.left + r.width / 2);
      });
      var a = pos[0], b = pos[pos.length - 1], len = (b - a) || 1;
      fracs = pos.map(function (p) { return (p - a) / len; });
      if (vertical) {
        var n0 = nodes[0].getBoundingClientRect();
        tl.style.setProperty('--tl-x', (n0.left + n0.width / 2 - tr.left) + 'px');
        tl.style.setProperty('--tl-top', (a - tr.top) + 'px');
        tl.style.setProperty('--tl-bottom', (tr.bottom - b) + 'px');
      } else {
        tl.style.setProperty('--tl-left', (a - tr.left) + 'px');
        tl.style.setProperty('--tl-right', (tr.right - b) + 'px');
      }
    }

    if (reduce || !('IntersectionObserver' in window)) {
      measure(); tl.style.setProperty('--tlp', '1');
      steps.forEach(function (s) { s.classList.add('on'); });
      return;
    }

    var played = false;
    function play() {
      played = true;
      measure();
      steps[0].classList.add('on');                 // 01 apparaît d'abord
      var SEG = 520, PAUSE = 280, START = 350;        // dessin par segment, courte pause à chaque nœud
      var segs = [], t = START;
      for (var k = 1; k < nodes.length; k++) {
        segs.push({ s: t, e: t + SEG, from: fracs[k - 1], to: fracs[k], idx: k });
        t += SEG + PAUSE;
      }
      var total = t, t0 = performance.now();
      function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
      function frame(now) {
        var el = now - t0, p = fracs[0];
        for (var i = 0; i < segs.length; i++) {
          var g = segs[i];
          if (el < g.s) { p = g.from; break; }           // en pause sur le nœud précédent
          if (el <= g.e) {                                // segment en cours de tracé
            var lt = (el - g.s) / SEG;
            p = g.from + (g.to - g.from) * ease(lt);
            if (lt > 0.7) steps[g.idx].classList.add('on'); // l'étape surgit quand le trait arrive
            break;
          }
          p = g.to; steps[g.idx].classList.add('on');      // segment passé
        }
        tl.style.setProperty('--tlp', p.toFixed(4));
        if (el < total) requestAnimationFrame(frame);
        else { tl.style.setProperty('--tlp', '1'); steps.forEach(function (s) { s.classList.add('on'); }); }
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(tl); play(); } });
    }, { threshold: 0.25 });
    io.observe(tl);

    // garde le trait aligné si on redimensionne / tourne l'écran après coup
    window.addEventListener('resize', function () { if (played) measure(); });
  });

  // --- Bande(s) photo : parallaxe. L'image est plus haute que la bande ; on la
  //     translate en fonction de la position de scroll → on découvre l'image du haut
  //     vers le bas. rAF throttlé, transform composité GPU. ---
  if (!reduce) {
    document.querySelectorAll('.photoband').forEach(function (band) {
      var img = band.querySelector('img');
      if (!img) return;
      var ticking = false;
      function update() {
        ticking = false;
        var rect = band.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom < -40 || rect.top > vh + 40) return; // hors écran : on ne touche pas
        var overflow = img.offsetHeight - band.offsetHeight; // marge de défilement de l'image
        if (overflow <= 0) return;
        var p = (vh - rect.top) / (vh + rect.height);         // 0 quand la bande entre, 1 quand elle sort
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        img.style.transform = 'translate3d(0,' + (-overflow * p).toFixed(1) + 'px,0)';
      }
      function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  // --- Hero : quadrillage "spotlight" qui suit le curseur ---
  var hero = document.querySelector('.hero');
  if (hero && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var raf = null, mx = 60, my = 6;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width * 100;
      my = (e.clientY - r.top) / r.height * 100;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = null;
        hero.style.setProperty('--mx', mx.toFixed(1) + '%');
        hero.style.setProperty('--my', my.toFixed(1) + '%');
      });
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', '60%');
      hero.style.setProperty('--my', '6%');
    });
  }

  // --- Curseur négatif (desktop) : un disque en mix-blend difference qui inverse
  //     fond + texte sous lui (effet « négatif »), avec une légère inertie ---
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var docEl = document.documentElement;
    var ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); document.body.appendChild(dot);
    docEl.classList.add('has-customcursor');

    var dx = window.innerWidth / 2, dy = window.innerHeight / 2;
    var rx = dx, ry = dy, px = dx, py = dy, started = false;
    function cursorKind(t) {
      if (!t || !t.closest) return null;
      if (t.closest('.btn,.nav-toggle')) return 'btn';
      if (t.closest('.persona,.card,.tile,.lever')) return 'media';
      if (t.closest('a,button,label,summary,input,select,textarea')) return 'link';
      return null;
    }

    window.addEventListener('pointermove', function (e) {
      dx = e.clientX; dy = e.clientY;
      if (!started) { started = true; rx = dx; ry = dy; docEl.classList.add('cursor-ready'); }
    }, { passive: true });

    (function loop() {
      rx += (dx - rx) * 0.32; ry += (dy - ry) * 0.32;
      px += (dx - px) * 0.6; py += (dy - py) * 0.6;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      dot.style.transform = 'translate(' + px + 'px,' + py + 'px)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('pointerover', function (e) {
      var k = cursorKind(e.target);
      docEl.classList.toggle('cursor-btn', k === 'btn');
      docEl.classList.toggle('cursor-media', k === 'media');
      docEl.classList.toggle('cursor-hover', k === 'link');
    });

    // Boutons magnétiques : ils glissent légèrement vers le curseur au survol
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var bx = e.clientX - (r.left + r.width / 2);
        var by = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (bx * 0.25).toFixed(1) + 'px,' + (by * 0.4).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    window.addEventListener('pointerdown', function () { docEl.classList.add('cursor-down'); });
    window.addEventListener('pointerup', function () { docEl.classList.remove('cursor-down'); });
    document.addEventListener('mouseleave', function () { docEl.classList.remove('cursor-ready'); });
    document.addEventListener('mouseenter', function () { if (started) docEl.classList.add('cursor-ready'); });
  }
})();
