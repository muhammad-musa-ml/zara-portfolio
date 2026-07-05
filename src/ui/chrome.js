// Chrome: reveals, hero entrance, nav dot state, custom cursor, toasts.
import { gsap } from 'gsap'

export function toast(msg, ms = 3400) {
  const root = document.getElementById('toast-root')
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  root.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity .4s, translate .4s'
    el.style.opacity = '0'
    el.style.translate = '0 0.5rem'
    setTimeout(() => el.remove(), 420)
  }, ms)
}

export function initReveals({ reduced }) {
  const els = document.querySelectorAll('[data-reveal]')
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target) }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
  els.forEach((el) => io.observe(el))
}

export function heroEntrance({ reduced, greetings }) {
  const chars = document.querySelectorAll('.hero-name .char')
  const greetEl = document.querySelector('.hero-greeting .greet')

  if (!reduced && chars.length) {
    gsap.fromTo(chars,
      { yPercent: 118, rotate: 4, opacity: 0 },
      { yPercent: 0, rotate: 0, opacity: 1, duration: 1.15, ease: 'power4.out', stagger: 0.028, delay: 0.15 })
    gsap.fromTo('.hero-roles', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.75, ease: 'power3.out' })
    gsap.fromTo('.hero-greeting', { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 0.05 })
  }

  // rotating multilingual greeting
  if (greetEl && greetings?.length > 1) {
    let gi = 0
    setInterval(() => {
      gi = (gi + 1) % greetings.length
      if (reduced) { greetEl.textContent = greetings[gi]; return }
      gsap.to(greetEl, {
        opacity: 0, y: -8, duration: 0.32, ease: 'power2.in', onComplete() {
          greetEl.textContent = greetings[gi]
          gsap.fromTo(greetEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' })
        }
      })
    }, 2600)
  }
}

export function initNavDots() {
  const dots = document.querySelectorAll('.chapter-dots a')
  window.addEventListener('chapterchange', (e) => {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === e.detail.index))
  })
}

// (custom cursors live in ui/cursors.js)
