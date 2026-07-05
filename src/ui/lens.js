// The design lens: the site annotates its own psychology.
// Toggle it and every marked element explains the principle it uses.
import { softLock, softUnlock } from './scroll-lock.js'

const REGISTRY = [
  { key: 'hero-type', name: 'Visual hierarchy', note: 'The name is set ~9× body size in a high-contrast serif. Your eye lands there first, every time — hierarchy decided in your first 50ms.' },
  { key: 'greeting', name: 'Peak–end & priming', note: 'A rotating greeting (including السلام علیکم — home) primes warmth before a single credential appears. People remember how a thing felt first.' },
  { key: 'scroll-cue', name: 'Perceived affordance', note: 'A dripping line signals "there is more below" without a word of instruction. Affordances beat instructions.' },
  { key: 'timeline', name: 'Serial-position effect', note: 'The story is chronological and ends on the strongest beat (graduation + a live product) — endings are remembered best.' },
  { key: 'project-stack', name: 'Chunking (Miller\'s law)', note: 'Four projects, never more on screen than one card of information at a time. Working memory holds ~4 chunks comfortably; this never exceeds it.' },
  { key: 'demos', name: 'Testing effect', note: 'You just *experienced* three principles instead of reading them. Doing beats telling for retention — that\'s the point of this whole section.' },
  { key: 'honest-note', name: 'Pratfall effect', note: 'Admitting uneven depth makes the rest of the claims more believable, not less. Small confessed flaws raise credibility.' },
  { key: 'portrait', name: 'Honest placeholders', note: 'No fake stock face. An empty frame labeled honestly beats a pretend photo — trust compounds in small moments.' },
  { key: 'ai-invite', name: 'Commitment gradient', note: 'Emailing a stranger is a big step; asking an AI a question is a tiny one. Low-friction first steps get taken.' },
  { key: 'peak-end', name: 'Peak–end rule', note: 'The voyage ends at dawn — the warmest palette on the site — right where the ask lives. You leave on the emotional peak.' },
  { key: 'ai-pill-nav', name: 'Fitts\'s law', note: 'The single highest-value action ("Ask my AI") is the biggest, brightest, always-reachable target on screen.' },
  { key: 'nav-dots', name: 'Hick\'s law', note: 'Seven wordless dots instead of a menu of twenty links. Fewer visible choices, faster decisions.' }
]

export function initLens() {
  const root = document.getElementById('lens-root')
  const toggle = document.getElementById('lens-toggle')
  const footerLens = document.getElementById('footer-lens')
  let on = false
  let rafId = 0
  let pop = null
  let popChip = null

  // annotate the two chrome elements that live outside the built DOM
  document.getElementById('ai-open')?.setAttribute('data-lens', 'ai-pill-nav')
  document.querySelector('.chapter-dots')?.setAttribute('data-lens', 'nav-dots')

  // — drawer with an always-visible close row (sticky) —
  const drawer = document.createElement('aside')
  drawer.className = 'lens-drawer'
  drawer.setAttribute('data-lenis-prevent', '')
  drawer.setAttribute('aria-label', 'Design lens — the reasoning behind this site')
  drawer.innerHTML = `
    <div class="ld-head">
      <h3>The design lens</h3>
      <button type="button" class="lens-close" aria-label="Close the design lens">✕ close</button>
    </div>
    <p class="lens-tagline">This site practices what the portfolio preaches. Every numbered chip on the page marks a psychology-backed decision — click one, or read the full list:</p>
    <ol class="lens-list">
      ${REGISTRY.map((r, i) => `<li><span class="ll-name"><span class="ll-idx">${i + 1}</span>${r.name}</span><span class="ll-note">${r.note}</span></li>`).join('')}
    </ol>`
  root.appendChild(drawer)

  // wheel over the drawer scrolls the drawer, never the page
  drawer.addEventListener('pointerenter', softLock)
  drawer.addEventListener('pointerleave', softUnlock)

  // — chips: created once, tracked every frame (no DOM churn, no jank) —
  const chips = []
  REGISTRY.forEach((r, i) => {
    const chip = document.createElement('button')
    chip.className = 'lens-chip'
    chip.type = 'button'
    chip.textContent = i + 1
    chip.setAttribute('aria-label', `Design note ${i + 1}: ${r.name}`)
    chip.hidden = true
    chip.addEventListener('click', (e) => { e.stopPropagation(); showPop(r, chip) })
    document.body.appendChild(chip)
    chips.push({ el: chip, entry: r, target: null })
  })

  function resolveTargets() {
    chips.forEach((c) => { c.target = document.querySelector(`[data-lens="${c.entry.key}"]`) })
  }

  function track() {
    rafId = requestAnimationFrame(track)
    for (const c of chips) {
      if (!c.target) continue
      const r = c.target.getBoundingClientRect()
      const visible = r.width > 0 && r.bottom > -40 && r.top < innerHeight + 40
      c.el.hidden = !visible
      if (visible) {
        const x = Math.min(r.right - 8, innerWidth - 26)
        const y = Math.max(6, r.top - 10)
        c.el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }
    if (pop && popChip) {
      const cr = popChip.getBoundingClientRect()
      const left = Math.max(10, Math.min(cr.left, innerWidth - 316))
      const top = cr.bottom + 10 + 300 > innerHeight ? cr.top - pop.offsetHeight - 10 : cr.bottom + 10
      pop.style.transform = `translate3d(${left}px, ${Math.max(10, top)}px, 0)`
    }
  }

  function showPop(r, chip) {
    hidePop()
    popChip = chip
    pop = document.createElement('div')
    pop.className = 'lens-pop'
    pop.innerHTML = `<span class="lens-pop-name">${r.name}</span><span class="lens-pop-note">${r.note}</span>`
    document.body.appendChild(pop)
  }
  function hidePop() { pop?.remove(); pop = null; popChip = null }

  function setLens(state) {
    on = state
    document.documentElement.classList.toggle('lens-on', on)
    toggle.setAttribute('aria-pressed', String(on))
    drawer.classList.toggle('is-open', on)
    hidePop()
    if (on) {
      resolveTargets()
      cancelAnimationFrame(rafId)
      track()
    } else {
      cancelAnimationFrame(rafId)
      chips.forEach((c) => { c.el.hidden = true })
      softUnlock()
    }
  }

  toggle.addEventListener('click', () => setLens(!on))
  footerLens?.addEventListener('click', () => { setLens(true); drawer.scrollTop = 0 })
  drawer.querySelector('.lens-close').addEventListener('click', () => setLens(false))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && on) setLens(false) })
  document.addEventListener('click', (e) => { if (pop && !e.target.closest('.lens-pop, .lens-chip')) hidePop() })

  return { toggleLens: () => setLens(!on) }
}
