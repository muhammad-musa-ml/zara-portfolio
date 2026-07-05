// Four custom cursors, one shared tracking loop.
// Every variant re-tints with the chapter accent and reacts to interactive targets.

export const CURSOR_OPTIONS = [
  { id: 'ring', label: 'Halo ring', note: 'minimal dot + trailing halo' },
  { id: 'frame', label: 'Inspector frame', note: 'corner brackets snap onto whatever you aim at' },
  { id: 'pen', label: 'Vector pen', note: 'a live bézier anchor, handles follow your motion' },
  { id: 'orb', label: 'Gooey orb', note: 'a soft blob that squashes with speed' },
  { id: 'caret', label: 'Studio caret', note: 'a hand-drawn arrow with a precise tip — pixel-accurate' },
  { id: 'xhair', label: 'Crosshair fine', note: 'tiny reticle: sharp center, ticks bloom on targets' },
  { id: 'comet', label: 'Comet', note: 'a precise head that grows a light-trail as you move' }
]

const HOT_SELECTOR = 'a, button, input, textarea, [data-cursor], .chip, .lens-chip'

export function initCursors({ reduced }, override) {
  const fine = window.matchMedia('(pointer: fine)').matches
  if (!fine || reduced) return { setCursor() {}, current: 'system' }

  let x = innerWidth / 2, y = innerHeight / 2
  let vx = 0, vy = 0, seen = false
  let hot = null
  let variant = null
  let rafId = 0

  document.documentElement.classList.add('cursor-live')
  window.addEventListener('pointermove', (e) => {
    if (!seen) { seen = true; x = e.clientX; y = e.clientY }
    x = e.clientX; y = e.clientY
    hot = e.target.closest?.(HOT_SELECTOR) || null
  }, { passive: true })

  const el = (cls, parent) => { const d = document.createElement('div'); d.className = cls; (parent || document.body).appendChild(d); return d }
  const lerp = (a, b, t) => a + (b - a) * t

  /* — variant builders: each returns { update(dt), destroy() } — */

  function buildRing() {
    const dot = el('cur cur-dot')
    const ring = el('cur cur-ring')
    let rx = x, ry = y
    return {
      update() {
        rx = lerp(rx, x, 0.22); ry = lerp(ry, y, 0.22)
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
        ring.classList.toggle('is-hot', !!hot)
      },
      destroy() { dot.remove(); ring.remove() }
    }
  }

  function buildFrame() {
    const cross = el('cur cur-cross')
    const corners = ['tl', 'tr', 'bl', 'br'].map((k) => el(`cur cur-corner cur-corner-${k}`))
    const pos = corners.map(() => ({ x, y }))
    return {
      update() {
        let targets
        if (hot) {
          const r = hot.getBoundingClientRect()
          const p = 7
          // tiny targets (nav dots) still get a dignified minimum frame
          const minBox = 30
          const padW = Math.max((minBox - r.width) / 2, 0) + p
          const padH = Math.max((minBox - r.height) / 2, 0) + p
          targets = [
            { x: r.left - padW, y: r.top - padH }, { x: r.right + padW, y: r.top - padH },
            { x: r.left - padW, y: r.bottom + padH }, { x: r.right + padW, y: r.bottom + padH }
          ]
        } else {
          const s = 13
          targets = [
            { x: x - s, y: y - s }, { x: x + s, y: y - s },
            { x: x - s, y: y + s }, { x: x + s, y: y + s }
          ]
        }
        corners.forEach((c, i) => {
          pos[i].x = lerp(pos[i].x, targets[i].x, 0.22)
          pos[i].y = lerp(pos[i].y, targets[i].y, 0.22)
          c.style.transform = `translate3d(${pos[i].x}px, ${pos[i].y}px, 0)`
        })
        cross.style.transform = `translate3d(${x}px, ${y}px, 0)`
        cross.classList.toggle('is-hot', !!hot)
      },
      destroy() { cross.remove(); corners.forEach((c) => c.remove()) }
    }
  }

  function buildCaret() {
    const root = el('cur cur-caret')
    root.innerHTML = `<svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
      <path class="cc-body" d="M3 1 L3 19 L8.2 14.2 L11.6 22 L15 20.4 L11.7 12.8 L19 12.4 Z"/>
    </svg>`
    return {
      update() {
        // pixel-precise: the tip sits exactly on the pointer, no smoothing
        root.style.transform = `translate3d(${x - 3}px, ${y - 1}px, 0)`
        root.classList.toggle('is-hot', !!hot)
      },
      destroy() { root.remove() }
    }
  }

  function buildXhair() {
    const root = el('cur cur-xhair')
    root.innerHTML = `<span class="cx-dot"></span><span class="cx-tick cx-n"></span><span class="cx-tick cx-s"></span><span class="cx-tick cx-e"></span><span class="cx-tick cx-w"></span>`
    return {
      update() {
        root.style.transform = `translate3d(${x}px, ${y}px, 0)`
        root.classList.toggle('is-hot', !!hot)
      },
      destroy() { root.remove() }
    }
  }

  function buildComet() {
    const head = el('cur cur-comet-head')
    const tail = el('cur cur-comet-tail')
    let ang = 0, len = 0
    return {
      update() {
        const speed = Math.min(1, Math.hypot(vx, vy) / 30)
        if (speed > 0.02) ang = Math.atan2(vy, vx)
        len = lerp(len, speed * 64, 0.2)
        head.style.transform = `translate3d(${x}px, ${y}px, 0)`
        head.classList.toggle('is-hot', !!hot)
        tail.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${ang}rad)`
        tail.style.width = `${len}px`
        tail.style.opacity = len < 3 ? '0' : '0.85'
      },
      destroy() { head.remove(); tail.remove() }
    }
  }

  function buildPen() {
    const root = el('cur cur-pen')
    root.innerHTML = `<span class="cp-handle"></span><span class="cp-tip cp-tip-a"></span><span class="cp-tip cp-tip-b"></span><span class="cp-node"></span>`
    const handle = root.querySelector('.cp-handle')
    const tipA = root.querySelector('.cp-tip-a')
    const tipB = root.querySelector('.cp-tip-b')
    let px = x, py = y, ang = 0, len = 14
    return {
      update() {
        px = lerp(px, x, 0.3); py = lerp(py, y, 0.3)
        const speed = Math.min(1, Math.hypot(vx, vy) / 34)
        if (speed > 0.02) ang = lerp(ang, Math.atan2(vy, vx), 0.18)
        const targetLen = hot ? 30 : 12 + speed * 26
        len = lerp(len, targetLen, 0.15)
        root.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${ang}rad)`
        root.classList.toggle('is-hot', !!hot)
        handle.style.width = `${len * 2}px`
        handle.style.marginLeft = `${-len}px`
        tipA.style.transform = `translate(${-len}px, 0)`
        tipB.style.transform = `translate(${len}px, 0)`
      },
      destroy() { root.remove() }
    }
  }

  function buildOrb() {
    const orb = el('cur cur-orb')
    const label = document.createElement('span')
    label.className = 'co-label'
    orb.appendChild(label)
    let px = x, py = y, ang = 0
    return {
      update() {
        px = lerp(px, x, 0.18); py = lerp(py, y, 0.18)
        const speed = Math.min(1, Math.hypot(vx, vy) / 40)
        if (speed > 0.02) ang = Math.atan2(vy, vx)
        const sx = 1 + speed * 0.5, sy = 1 - speed * 0.3
        orb.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${ang}rad) scale(${sx}, ${sy})`
        const isHot = !!hot
        orb.classList.toggle('is-hot', isHot)
        if (isHot) {
          const txt = hot.getAttribute?.('data-cursor-label') || ''
          label.textContent = txt
          label.style.transform = `rotate(${-ang}rad)`
        }
      },
      destroy() { orb.remove() }
    }
  }

  const BUILDERS = { ring: buildRing, frame: buildFrame, pen: buildPen, orb: buildOrb, caret: buildCaret, xhair: buildXhair, comet: buildComet }

  let lx = x, ly = y, last = performance.now()
  function loop(now) {
    rafId = requestAnimationFrame(loop)
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    vx = lerp(vx, x - lx, 0.4); vy = lerp(vy, y - ly, 0.4)
    lx = x; ly = y
    variant?.update(dt)
  }

  const api = {
    current: 'ring',
    setCursor(id) {
      if (!BUILDERS[id]) id = 'ring'
      variant?.destroy()
      variant = BUILDERS[id]()
      api.current = id
      try { localStorage.setItem('fmk-cursor', id) } catch {}
    }
  }

  const initial = override || (() => { try { return localStorage.getItem('fmk-cursor') } catch { return null } })() || 'ring'
  api.setCursor(initial)
  rafId = requestAnimationFrame(loop)
  return api
}
