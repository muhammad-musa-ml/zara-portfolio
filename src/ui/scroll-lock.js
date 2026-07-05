// Shared scroll lock: overlays freeze the page (including Lenis) while open.
let lenis = null
let locks = 0

export function bindLenis(instance) { lenis = instance }

export function lockScroll() {
  locks++
  document.documentElement.style.overflow = 'hidden'
  lenis?.stop()
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) {
    document.documentElement.style.overflow = ''
    lenis?.start()
  }
}

// soft variant: freeze Lenis only (no overflow change, no scrollbar jump) —
// used while the pointer rests over an internally-scrollable panel.
export function softLock() { lenis?.stop() }
export function softUnlock() { if (locks === 0) lenis?.start() }
