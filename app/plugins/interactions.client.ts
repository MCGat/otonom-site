/**
 * OTONOM — Interactions (port de l'ancien app.js, hors nav mobile gérée en Vue).
 * Reveal au scroll, count-up, schéma comparatif, frise « A→Z », parallaxe photo,
 * spotlight du hero, curseur négatif + boutons magnétiques.
 * Idempotent (garde data-*) et re-scanné à chaque changement de page.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(pointer: fine)').matches
  const hasIO = 'IntersectionObserver' in window
  const docEl = document.documentElement
  docEl.classList.add('js')

  // --- Reveal au scroll ---
  function initReveal(root: ParentNode) {
    root.querySelectorAll<HTMLElement>('.reveal:not([data-rv])').forEach((el) => {
      el.dataset.rv = '1'
      if (reduce || !hasIO) { el.classList.add('in'); return }
      const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
      })
      io.observe(el)
    })
  }

  // --- Count-up [data-count] ---
  function animateCount(el: HTMLElement) {
    const target = parseFloat(el.getAttribute('data-count') || '0')
    const dec = parseInt(el.getAttribute('data-decimals') || '0', 10)
    const prefix = el.getAttribute('data-prefix') || ''
    const suffix = el.getAttribute('data-suffix') || ''
    const dur = 1100
    let start: number | null = null
    function frame(ts: number) {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const val = (target * eased).toFixed(dec)
      el.textContent = prefix + Number(val).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  function initCount(root: ParentNode) {
    root.querySelectorAll<HTMLElement>('[data-count]:not([data-cu])').forEach((el) => {
      el.dataset.cu = '1'
      if (reduce || !hasIO) {
        el.textContent = (el.getAttribute('data-prefix') || '') + el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '')
        return
      }
      const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) { animateCount(e.target as HTMLElement); io.unobserve(e.target) } })
      }, { threshold: 0.5 })
      io.observe(el)
    })
  }

  // --- Schéma comparatif : « avec OTONOM » anime après « aujourd'hui » ---
  function initCompare(root: ParentNode) {
    root.querySelectorAll<HTMLElement>('.compare:not([data-cmp])').forEach((cmp) => {
      cmp.dataset.cmp = '1'
      const before = cmp.querySelector<HTMLElement>('.compare-panel:not(.compare-panel--after)')
      const after = cmp.querySelector<HTMLElement>('.compare-panel--after')
      if (!before || !after) return
      if (reduce || !hasIO) { after.classList.add('seq-go'); return }
      const BEFORE_DUR = 5600
      let beforeDone = false, afterVisible = false
      const go = () => { if (beforeDone && afterVisible) after.classList.add('seq-go') }
      const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => {
          if (!e.isIntersecting) return
          if (e.target === before) { io.unobserve(before); setTimeout(() => { beforeDone = true; go() }, BEFORE_DUR) }
          else if (e.target === after) { io.unobserve(after); afterVisible = true; go() }
        })
      }, { threshold: 0.12 })
      io.observe(before); io.observe(after)
    })
  }

  // --- Frise « A→Z » : trait mesuré qui s'arrête sur chaque nœud ---
  function initFrise(root: ParentNode) {
    root.querySelectorAll<HTMLElement>('.tl:not([data-tl])').forEach((tl) => {
      tl.dataset.tl = '1'
      const nodes = Array.from(tl.querySelectorAll<HTMLElement>('.tl-node'))
      const steps = Array.from(tl.querySelectorAll<HTMLElement>('.tl-step'))
      if (nodes.length < 2) return
      let fracs: number[] = []
      function measure() {
        const vertical = window.matchMedia('(max-width: 880px)').matches
        const tr = tl.getBoundingClientRect()
        const pos = nodes.map((n) => { const r = n.getBoundingClientRect(); return vertical ? (r.top + r.height / 2) : (r.left + r.width / 2) })
        const a = pos[0], b = pos[pos.length - 1], len = (b - a) || 1
        fracs = pos.map((p) => (p - a) / len)
        if (vertical) {
          const n0 = nodes[0].getBoundingClientRect()
          tl.style.setProperty('--tl-x', (n0.left + n0.width / 2 - tr.left) + 'px')
          tl.style.setProperty('--tl-top', (a - tr.top) + 'px')
          tl.style.setProperty('--tl-bottom', (tr.bottom - b) + 'px')
        } else {
          tl.style.setProperty('--tl-left', (a - tr.left) + 'px')
          tl.style.setProperty('--tl-right', (tr.right - b) + 'px')
        }
      }
      if (reduce || !hasIO) { measure(); tl.style.setProperty('--tlp', '1'); steps.forEach((s) => s.classList.add('on')); return }
      let played = false
      function play() {
        played = true; measure(); steps[0].classList.add('on')
        const SEG = 520, PAUSE = 280, START = 350
        const segs: any[] = []; let t = START
        for (let k = 1; k < nodes.length; k++) { segs.push({ s: t, e: t + SEG, from: fracs[k - 1], to: fracs[k], idx: k }); t += SEG + PAUSE }
        const total = t, t0 = performance.now()
        const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
        function frame(now: number) {
          const el = now - t0; let p = fracs[0]
          for (let i = 0; i < segs.length; i++) {
            const g = segs[i]
            if (el < g.s) { p = g.from; break }
            if (el <= g.e) { const lt = (el - g.s) / SEG; p = g.from + (g.to - g.from) * ease(lt); if (lt > 0.7) steps[g.idx].classList.add('on'); break }
            p = g.to; steps[g.idx].classList.add('on')
          }
          tl.style.setProperty('--tlp', p.toFixed(4))
          if (el < total) requestAnimationFrame(frame)
          else { tl.style.setProperty('--tlp', '1'); steps.forEach((s) => s.classList.add('on')) }
        }
        requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver((ents) => { ents.forEach((e) => { if (e.isIntersecting) { io.unobserve(tl); play() } }) }, { threshold: 0.25 })
      io.observe(tl)
      window.addEventListener('resize', () => { if (played) measure() })
    })
  }

  // --- Parallaxe des bandes photo ---
  function initParallax(root: ParentNode) {
    if (reduce) return
    root.querySelectorAll<HTMLElement>('.photoband:not([data-pb])').forEach((band) => {
      band.dataset.pb = '1'
      const img = band.querySelector<HTMLImageElement>('img'); if (!img) return
      let ticking = false
      function update() {
        ticking = false
        const rect = band.getBoundingClientRect()
        const vh = window.innerHeight || document.documentElement.clientHeight
        if (rect.bottom < -40 || rect.top > vh + 40) return
        const overflow = img.offsetHeight - band.offsetHeight; if (overflow <= 0) return
        let p = (vh - rect.top) / (vh + rect.height); p = p < 0 ? 0 : p > 1 ? 1 : p
        img.style.transform = 'translate3d(0,' + (-overflow * p).toFixed(1) + 'px,0)'
      }
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      update()
    })
  }

  // --- Spotlight du hero ---
  function initHeroSpotlight(root: ParentNode) {
    if (reduce || !fine) return
    root.querySelectorAll<HTMLElement>('.hero:not([data-hs])').forEach((hero) => {
      hero.dataset.hs = '1'
      let raf: number | null = null, mx = 60, my = 6
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect()
        mx = (e.clientX - r.left) / r.width * 100
        my = (e.clientY - r.top) / r.height * 100
        if (!raf) raf = requestAnimationFrame(() => { raf = null; hero.style.setProperty('--mx', mx.toFixed(1) + '%'); hero.style.setProperty('--my', my.toFixed(1) + '%') })
      })
      hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', '60%'); hero.style.setProperty('--my', '6%') })
    })
  }

  // --- Curseur négatif + boutons magnétiques (global, une seule fois) ---
  function initCursor() {
    if (docEl.dataset.cursor || reduce || !fine) return
    docEl.dataset.cursor = '1'
    const ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true')
    const dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true')
    document.body.appendChild(ring); document.body.appendChild(dot)
    docEl.classList.add('has-customcursor')
    let dx = innerWidth / 2, dy = innerHeight / 2, rx = dx, ry = dy, px = dx, py = dy, started = false
    const kind = (t: any) => !t?.closest ? null : t.closest('.btn,.nav-toggle') ? 'btn' : t.closest('.persona,.card,.tile,.lever') ? 'media' : t.closest('a,button,label,summary,input,select,textarea') ? 'link' : null
    window.addEventListener('pointermove', (e) => { dx = e.clientX; dy = e.clientY; if (!started) { started = true; rx = dx; ry = dy; docEl.classList.add('cursor-ready') } }, { passive: true })
    ;(function loop() {
      rx += (dx - rx) * 0.32; ry += (dy - ry) * 0.32; px += (dx - px) * 0.6; py += (dy - py) * 0.6
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; dot.style.transform = 'translate(' + px + 'px,' + py + 'px)'
      requestAnimationFrame(loop)
    })()
    document.addEventListener('pointerover', (e) => { const k = kind(e.target); docEl.classList.toggle('cursor-btn', k === 'btn'); docEl.classList.toggle('cursor-media', k === 'media'); docEl.classList.toggle('cursor-hover', k === 'link') })
    // boutons magnétiques (délégation → survit aux changements de page)
    document.addEventListener('pointermove', (e) => {
      const b = (e.target as HTMLElement)?.closest?.('.btn') as HTMLElement | null; if (!b) return
      const r = b.getBoundingClientRect()
      b.style.transform = 'translate(' + ((e.clientX - (r.left + r.width / 2)) * 0.25).toFixed(1) + 'px,' + ((e.clientY - (r.top + r.height / 2)) * 0.4).toFixed(1) + 'px)'
    })
    document.addEventListener('pointerout', (e) => { const b = (e.target as HTMLElement)?.closest?.('.btn') as HTMLElement | null; if (b) b.style.transform = '' })
    window.addEventListener('pointerdown', () => docEl.classList.add('cursor-down'))
    window.addEventListener('pointerup', () => docEl.classList.remove('cursor-down'))
    document.addEventListener('mouseleave', () => docEl.classList.remove('cursor-ready'))
    document.addEventListener('mouseenter', () => { if (started) docEl.classList.add('cursor-ready') })
  }

  function scanAll() {
    initReveal(document); initCount(document); initCompare(document); initFrise(document); initParallax(document); initHeroSpotlight(document)
  }

  initCursor()
  nuxtApp.hook('app:mounted', () => requestAnimationFrame(scanAll))
  nuxtApp.hook('page:finish', () => requestAnimationFrame(scanAll))
})
