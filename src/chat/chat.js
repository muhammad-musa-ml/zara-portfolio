// The AI twin panel: dialog UI, provider chain, offline fallback, honest labeling.
import { askLLM } from './providers.js'
import { loadKnowledge, buildSystemPrompt } from './persona.js'
import { loadFaq, offlineAnswer } from './faq.js'
import { toast } from '../ui/chrome.js'
import { lockScroll, unlockScroll } from '../ui/scroll-lock.js'

const MAX_INPUT = 500
const MAX_TURNS = 12 // messages kept as model context (6 exchanges)

export function initChat({ content, config, scene, gsap }) {
  const c = content.chat
  const root = document.getElementById('chat-root')
  root.innerHTML = `
  <div class="chat-veil" role="dialog" aria-modal="true" aria-label="${c.title}">
    <div class="chat-panel">
      <header class="chat-head">
        <div class="chat-orb" aria-hidden="true"></div>
        <div class="chat-id">
          <span class="chat-title">${c.title}</span>
          <span class="chat-sub">${c.subtitle}</span>
        </div>
        <div class="chat-head-actions">
          <span class="chat-mode" data-mode>connecting…</span>
          <button type="button" class="chat-close" aria-label="Close chat">✕</button>
        </div>
      </header>
      <div class="chat-thread" data-thread data-lenis-prevent aria-live="polite"></div>
      <div class="chat-foot">
        <div class="chat-chips" data-chips>
          ${c.chips.map((q) => `<button type="button" class="chip">${q}</button>`).join('')}
        </div>
        <form class="chat-inputrow" data-form>
          <textarea class="chat-input" rows="1" maxlength="${MAX_INPUT}" placeholder="Ask anything about Fatima…" aria-label="Your question"></textarea>
          <button type="submit" class="chat-send" disabled>Ask</button>
        </form>
        <div class="chat-disclaimer">
          <span>${c.disclaimer}</span>
          <button type="button" class="chat-clear">clear chat</button>
        </div>
      </div>
    </div>
  </div>`

  const veil = root.querySelector('.chat-veil')
  const thread = root.querySelector('[data-thread]')
  const form = root.querySelector('[data-form]')
  const input = root.querySelector('.chat-input')
  const sendBtn = root.querySelector('.chat-send')
  const modeBadge = root.querySelector('[data-mode]')

  let history = []           // {role, content} for the model
  let pending = false
  let open = false
  let lastFocus = null
  let knowledge = null
  let faq = []

  // — persistence: survive tab navigation, not the browser session —
  try {
    const saved = JSON.parse(sessionStorage.getItem('fmk-chat') || '[]')
    if (Array.isArray(saved)) history = saved.slice(-MAX_TURNS)
  } catch {}
  const persist = () => { try { sessionStorage.setItem('fmk-chat', JSON.stringify(history)) } catch {} }

  function setMode(state) {
    modeBadge.classList.remove('is-live', 'is-offline')
    if (state === 'live') { modeBadge.textContent = config.geminiApiKey ? 'live · gemini' : 'live · free model'; modeBadge.classList.add('is-live') }
    else if (state === 'offline') { modeBadge.textContent = 'offline notes'; modeBadge.classList.add('is-offline') }
    else modeBadge.textContent = state
  }

  function addMsg(role, text, { note = '', typewriter = false } = {}) {
    const el = document.createElement('div')
    el.className = `msg ${role === 'user' ? 'msg-user' : 'msg-ai'}`
    el.innerHTML = `<span class="msg-tag">${role === 'user' ? 'you' : 'fatima · ai twin'}</span><p class="msg-body"></p>${note ? `<span class="msg-note">${note}</span>` : ''}`
    thread.appendChild(el)
    const body = el.querySelector('.msg-body')
    if (!typewriter) { body.textContent = text; scrollThread(); return Promise.resolve() }
    return new Promise((resolve) => {
      // time-based reveal: consistent pace, immune to background-tab throttling
      const t0 = performance.now()
      const cps = Math.max(75, text.length / 5.5)
      const iv = setInterval(() => {
        const i = Math.min(text.length, Math.floor(((performance.now() - t0) / 1000) * cps))
        body.textContent = text.slice(0, i)
        scrollThread()
        if (i >= text.length) { clearInterval(iv); resolve() }
      }, 16)
    })
  }

  function addTyping() {
    const el = document.createElement('div')
    el.className = 'msg msg-ai'
    el.dataset.typing = '1'
    el.innerHTML = `<span class="msg-tag">fatima · ai twin</span><span class="typing"><i></i><i></i><i></i></span>`
    thread.appendChild(el)
    scrollThread()
    return el
  }

  const scrollThread = () => { thread.scrollTop = thread.scrollHeight }

  function renderHistory() {
    thread.innerHTML = ''
    if (!history.length) addMsg('assistant', c.welcome)
    else history.forEach((m) => addMsg(m.role === 'user' ? 'user' : 'assistant', m.content))
  }

  async function ensureGrounding() {
    if (!knowledge) {
      try { knowledge = await loadKnowledge() } catch { knowledge = null }
    }
    if (!faq.length) faq = await loadFaq()
  }

  async function ask(question) {
    if (pending) return
    const q = question.trim().slice(0, MAX_INPUT)
    if (!q) return

    // easter egg
    if (/^sudo\s+hire\s+fatima/i.test(q)) {
      addMsg('user', q)
      scene?.burst(gsap)
      await addMsg('assistant', 'Permission granted. Deploying enthusiasm… done. ✦ (Formally though: hello@fatimamohsin.dev — she answers fast.)', { typewriter: true })
      return
    }

    pending = true
    sendBtn.disabled = true
    input.value = ''
    autosize()
    addMsg('user', q)
    history.push({ role: 'user', content: q })
    const typing = addTyping()

    await ensureGrounding()
    let replied = false

    if (config.aiEnabled !== false && knowledge) {
      try {
        const system = buildSystemPrompt(knowledge)
        const { text, provider } = await askLLM({ system, history: history.slice(-MAX_TURNS), config })
        typing.remove()
        setMode('live')
        history.push({ role: 'assistant', content: text })
        persist()
        await addMsg('assistant', text, { typewriter: true })
        replied = true
        if (provider === 'pollinations') modeBadge.textContent = 'live · free model'
      } catch { /* fall through to offline notes */ }
    }

    if (!replied) {
      typing.remove()
      setMode('offline')
      const a = offlineAnswer(q, faq)
      history.push({ role: 'assistant', content: a })
      persist()
      await addMsg('assistant', a, { note: 'answered from prepared notes — live model unreachable', typewriter: true })
    }

    pending = false
    sendBtn.disabled = !input.value.trim()
    input.focus()
  }

  // — input behavior —
  function autosize() {
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 130)}px`
  }
  input.addEventListener('input', () => { sendBtn.disabled = pending || !input.value.trim(); autosize() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit() }
  })
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value) })
  root.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => ask(chip.textContent)))
  root.querySelector('.chat-clear').addEventListener('click', () => {
    history = []; persist(); renderHistory(); toast('Chat cleared')
  })

  // — open/close with focus management —
  function setOpen(state) {
    if (state === open) return
    open = state
    veil.classList.toggle('is-open', open)
    if (open) lockScroll(); else unlockScroll()
    if (open) {
      lastFocus = document.activeElement
      renderHistory()
      setMode(config.aiEnabled === false ? 'offline' : 'ready')
      setTimeout(() => input.focus(), 120)
      if (location.hash !== '#ai') { try { window.history.replaceState(null, '', '#ai') } catch {} }
      ensureGrounding()
    } else {
      lastFocus?.focus?.()
      if (location.hash === '#ai') { try { window.history.replaceState(null, '', location.pathname + location.search) } catch {} }
    }
  }

  veil.addEventListener('click', (e) => { if (e.target === veil) setOpen(false) })
  root.querySelector('.chat-close').addEventListener('click', () => setOpen(false))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false)
    // focus trap
    if (e.key === 'Tab' && open) {
      const focusables = veil.querySelectorAll('button, textarea, [href]')
      const first = focusables[0], last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  })

  document.getElementById('ai-open')?.addEventListener('click', () => setOpen(true))
  document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => setOpen(true)))
  if (location.hash === '#ai') setTimeout(() => setOpen(true), 600)

  return { openChat: () => setOpen(true) }
}
