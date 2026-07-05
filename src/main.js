// boot sequence — content → chrome → sky → scroll → overlays
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/spline-sans-mono'
import '@fontsource/spline-sans-mono/500.css'

import './styles/base.css'
import './styles/sections.css'
import './styles/overlays.css'
import './styles/cursors.css'

import { gsap } from 'gsap'
import content from './content/site-content.json'
import { buildSite } from './dom.js'
import { initScroll } from './scroll.js'
import { initReveals, heroEntrance, initNavDots, toast } from './ui/chrome.js'
import { initCursors } from './ui/cursors.js'
import { initLens } from './ui/lens.js'
import { initCmdk } from './ui/cmdk.js'
import { initDemos } from './ui/demos.js'
import { initEggs } from './ui/eggs.js'
import { initChat } from './chat/chat.js'
import { bindLenis } from './ui/scroll-lock.js'

async function loadConfig() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`)
    return res.ok ? await res.json() : {}
  } catch { return {} }
}

function detectCaps() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let webgl = false
  try {
    const test = document.createElement('canvas')
    webgl = !!(test.getContext('webgl2') || test.getContext('webgl'))
  } catch {}
  const mem = navigator.deviceMemory || 8
  const small = window.innerWidth < 760
  const particleCount = small ? 7000 : mem >= 8 ? 12000 : 9000
  return { reduced, webgl, particleCount, dprCap: small ? 1.8 : 2 }
}

async function boot() {
  const caps = detectCaps()
  const params = new URLSearchParams(location.search)
  // ?instant — test hook: skip boot choreography (used by automated screenshots)
  const instant = params.has('instant')
  if (instant) document.documentElement.classList.add('instant')
  buildSite(content)

  // ?instant&at=<id> — test hook: land hard on a chapter before first paint
  if (instant && params.get('at')) {
    const el = document.getElementById(params.get('at'))
    if (el) window.scrollTo({ top: el.offsetTop + 10, behavior: 'auto' })
  }

  // — the sky: swappable background engine —
  const canUseGl = caps.webgl && !caps.reduced
  let bg = null
  let lastP = 0
  const bgProxy = {
    setProgress(p) { lastP = p; bg?.setProgress(p) },
    burst(g) { bg?.burst?.(g) }
  }
  async function mountBg(id) {
    try {
      bg?.dispose?.()
      bg = null
      const old = document.getElementById('sky')
      const fresh = old.cloneNode(false)
      old.replaceWith(fresh)
      if (canUseGl) {
        const { createBackground } = await import('./backgrounds/index.js')
        bg = createBackground(id, fresh, { ...caps, instant })
        bg.setProgress(lastP)
      }
    } catch (err) {
      console.warn('sky disabled:', err)
      bg = null
    }
  }
  const bgChoice = params.get('bg') || (() => { try { return localStorage.getItem('fmk-bg') } catch { return null } })() || 'particles'
  await mountBg(bgChoice)

  const { scrollTo, lenis } = initScroll({ scene: bgProxy, reduced: caps.reduced, chapters: content.chapters })
  bindLenis(lenis)
  initNavDots()
  initReveals(caps)
  const cursors = initCursors(caps, params.get('cursor'))
  initDemos()

  const { openChat } = initChat({ content, config: await loadConfig(), scene: bgProxy, gsap })
  const { toggleLens } = initLens()
  initCmdk({ scrollTo, openChat, toggleLens })
  initEggs({ scene: bgProxy })

  // the style lab — local auditioning of backgrounds + cursors (dev / ?pick)
  if ((import.meta.env.DEV || params.has('pick')) && !instant && !params.has('nolab')) {
    const { initPicker } = await import('./ui/picker.js')
    initPicker({
      currentBg: bgChoice,
      currentCursor: cursors.current,
      onBg: (id) => { try { localStorage.setItem('fmk-bg', id) } catch {}; mountBg(id) },
      onCursor: (id) => cursors.setCursor(id)
    })
  }

  // wait briefly for display fonts so the hero doesn't swap mid-entrance
  if (!instant) await Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1400))])

  const loader = document.getElementById('loader')
  if (instant) loader.remove()
  else loader.classList.add('is-done')
  heroEntrance({ reduced: caps.reduced || instant, greetings: content.hero.greetings })

  // deep links like /#work
  if (location.hash && location.hash !== '#ai') {
    const el = document.querySelector(location.hash)
    if (el) setTimeout(() => scrollTo(el), 350)
  }

  // one honest nudge for the curious
  setTimeout(() => {
    if (!sessionStorage.getItem('lens-nudged')) {
      sessionStorage.setItem('lens-nudged', '1')
      toast('Tip: toggle “Design lens” to see the psychology behind this site ◐')
    }
  }, 14000)
}

boot()
