// boot sequence — content → chrome → sky → scroll → overlays
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/spline-sans-mono'
import '@fontsource/spline-sans-mono/500.css'

import './styles/base.css'
import './styles/sections.css'
import './styles/overlays.css'

import { gsap } from 'gsap'
import content from './content/site-content.json'
import { buildSite } from './dom.js'
import { initScroll } from './scroll.js'
import { initReveals, heroEntrance, initNavDots, initCursor, toast } from './ui/chrome.js'
import { initLens } from './ui/lens.js'
import { initCmdk } from './ui/cmdk.js'
import { initDemos } from './ui/demos.js'
import { initEggs } from './ui/eggs.js'
import { initChat } from './chat/chat.js'

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
  const particleCount = small ? 8000 : mem >= 8 ? 16000 : 11000
  return { reduced, webgl, particleCount, dprCap: small ? 1.8 : 2 }
}

async function boot() {
  const caps = detectCaps()
  // ?instant — test hook: skip boot choreography (used by automated screenshots)
  const params = new URLSearchParams(location.search)
  const instant = params.has('instant')
  if (instant) document.documentElement.classList.add('instant')
  buildSite(content)

  // ?instant&at=<id> — test hook: land hard on a chapter before first paint
  if (instant && params.get('at')) {
    const el = document.getElementById(params.get('at'))
    if (el) window.scrollTo({ top: el.offsetTop + 10, behavior: 'auto' })
  }

  // the sky (skipped for reduced-motion / no-WebGL: gradient backdrop carries the mood)
  let scene = null
  if (caps.webgl && !caps.reduced) {
    try {
      const { createScene } = await import('./scene/scene.js')
      scene = createScene(document.getElementById('sky'), { ...caps, instant })
    } catch (err) {
      console.warn('sky disabled:', err)
    }
  }

  const { scrollTo } = initScroll({ scene, reduced: caps.reduced, chapters: content.chapters })
  initNavDots()
  initReveals(caps)
  initCursor(caps)
  initDemos()

  const { openChat } = initChat({ content, config: await loadConfig(), scene, gsap })
  const { toggleLens } = initLens()
  initCmdk({ scrollTo, openChat, toggleLens })
  initEggs({ scene })

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
