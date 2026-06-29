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

  // --- Curseur personnalisé (desktop) : point + anneau avec inertie, mix-blend ---
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var docEl = document.documentElement;
    var dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot); document.body.appendChild(ring);
    docEl.classList.add('has-customcursor');

    var dx = window.innerWidth / 2, dy = window.innerHeight / 2;
    var rx = dx, ry = dy, started = false;
    function cursorKind(t) {
      if (!t || !t.closest) return null;
      if (t.closest('.btn,.nav-toggle')) return 'btn';
      if (t.closest('.persona,.card,.tile,.lever')) return 'media';
      if (t.closest('a,button,label,summary,input,select,textarea')) return 'link';
      return null;
    }

    window.addEventListener('pointermove', function (e) {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      if (!started) { started = true; rx = dx; ry = dy; docEl.classList.add('cursor-ready'); }
    }, { passive: true });

    (function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
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
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (mx * 0.25).toFixed(1) + 'px,' + (my * 0.4).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    window.addEventListener('pointerdown', function () { docEl.classList.add('cursor-down'); });
    window.addEventListener('pointerup', function () { docEl.classList.remove('cursor-down'); });
    document.addEventListener('mouseleave', function () { docEl.classList.remove('cursor-ready'); });
    document.addEventListener('mouseenter', function () { if (started) docEl.classList.add('cursor-ready'); });

    // Mini « loupe » : zoom léger du texte survolé, ancré vers le curseur
    if (window.matchMedia('(hover: hover)').matches) {
      var ZOOM = 'h1,h2,h3,p,li,.kicker,.lede,.num,.big';
      var zEl = null;
      document.addEventListener('pointermove', function (e) {
        var el = e.target.closest ? e.target.closest(ZOOM) : null;
        if (el && el.closest('.tx-panel')) el = null;
        if (el !== zEl) { if (zEl) zEl.classList.remove('txt-zoom'); zEl = el; if (zEl) zEl.classList.add('txt-zoom'); }
        if (zEl) {
          var rz = zEl.getBoundingClientRect();
          zEl.style.transformOrigin = ((e.clientX - rz.left) / rz.width * 100).toFixed(1) + '% ' + ((e.clientY - rz.top) / rz.height * 100).toFixed(1) + '%';
        }
      }, { passive: true });
    }
  }
})();
