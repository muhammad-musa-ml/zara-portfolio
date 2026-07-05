// Easter eggs — small rewards for the curious.
import { toast } from './chrome.js'
import { gsap } from 'gsap'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function initEggs({ scene }) {
  // console note for the dev-tools crowd
  console.log(
    '%czara.ahmed %c— hi, fellow inspector 👋\n' +
    'This site is hand-built: three.js particles, GSAP scroll choreography, zero templates.\n' +
    'Demo content is honestly labeled; the AI twin is honestly grounded.\n' +
    'Try the Konami code. Or type “sudo hire zara” into the AI chat.',
    'font-family: Georgia, serif; font-style: italic; font-size: 16px; color: #ffc38f;',
    'color: #8b93ff;'
  )

  let idx = 0
  document.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
    idx = k === KONAMI[idx] ? idx + 1 : (k === KONAMI[0] ? 1 : 0)
    if (idx === KONAMI.length) {
      idx = 0
      scene?.burst(gsap)
      toast('Recruiter mode unlocked · TL;DR — she ships. ✦')
    }
  })
}
