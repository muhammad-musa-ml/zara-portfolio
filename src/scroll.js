// Scroll orchestration: Lenis smoothing + ScrollTrigger scrubbing.
// One continuous "voyage progress" (0 → 6) drives the WebGL sky,
// while discrete chapter changes retint the whole interface.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const ACCENTS = ['#8b93ff', '#a5b4fc', '#c084fc', '#5eead4', '#7dd3fc', '#fda4af', '#ffc38f']

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function initScroll({ scene, reduced, chapters }) {
  let lenis = null

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const sections = gsap.utils.toArray('.chapter')
  const root = document.documentElement
  const skyA = document.querySelector('[data-sky="a"]')
  const skyB = document.querySelector('[data-sky="b"]')
  const railFill = document.querySelector('.rail-fill')
  const railCh = document.querySelector('.rail-ch')
  const railName = document.querySelector('.rail-name')
  const nav = document.getElementById('site-nav')

  let activeChapter = -1
  let liveLayer = null

  function setAccent(i) {
    const [r, g, b] = hexToRgb(ACCENTS[i])
    root.style.setProperty('--accent', ACCENTS[i])
    root.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.16)`)
    root.style.setProperty('--accent-line', `rgba(${r},${g},${b},0.34)`)
  }

  function setChapter(i) {
    if (i === activeChapter) return
    activeChapter = i
    // crossfade the sky gradient onto the idle layer
    const next = liveLayer === skyA ? skyB : skyA
    const prev = liveLayer
    next.className = `sky-layer sky-${i} is-live`
    if (prev) prev.classList.remove('is-live')
    liveLayer = next

    setAccent(i)
    if (railCh) railCh.textContent = `CH.0${i}`
    if (railName) railName.textContent = chapters[i].title.toUpperCase()

    window.dispatchEvent(new CustomEvent('chapterchange', { detail: { index: i } }))
  }
  setChapter(0)

  // — continuous voyage progress: each section's approach morphs the sky —
  sections.forEach((sec, i) => {
    if (i === 0) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top bottom',
      end: 'top top',
      onUpdate(self) {
        scene?.setProgress(i - 1 + self.progress)
      }
    })
  })

  // — discrete chapter activation (tint, sky, nav) —
  sections.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 52%',
      end: 'bottom 52%',
      onToggle(self) { if (self.isActive) setChapter(i) }
    })
  })

  // — overall page progress → HUD rail —
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate(self) {
      if (railFill) railFill.style.transform = `scaleY(${self.progress})`
    }
  })

  // — header: glass once scrolled, tuck away on scroll-down —
  ScrollTrigger.create({
    start: 60,
    onUpdate(self) {
      nav.classList.toggle('is-tucked', self.direction === 1 && window.scrollY > 480)
    },
    onToggle(self) { nav.classList.toggle('is-glass', self.isActive) }
  })

  if (!reduced) {
    // — ghost chapter numerals drift slower than the page —
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      gsap.fromTo(el, { y: 90 }, {
        y: -110, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      })
    })

    // — hero drifts up and thins out as you leave it —
    gsap.to('.hero-stage', {
      y: -70, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '#intro', start: '25% top', end: 'bottom top', scrub: 0.5 }
    })

    // — the timeline draws itself —
    const tl = document.querySelector('.timeline')
    if (tl) {
      gsap.fromTo('.tl-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 78%', end: 'bottom 55%', scrub: 0.4 }
      })
    }
  } else {
    // reduced motion: everything already-legible, timeline fully drawn
    const fill = document.querySelector('.tl-fill')
    if (fill) fill.style.transform = 'scaleY(1)'
  }

  function scrollTo(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.35 })
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  // nav dot + anchor clicks route through smooth scroll
  document.querySelectorAll('.chapter-dots a, .monogram').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href')
      if (href?.startsWith('#')) { e.preventDefault(); scrollTo(href); history.replaceState(null, '', href) }
    })
  })

  return { scrollTo, lenis, getChapter: () => activeChapter }
}
