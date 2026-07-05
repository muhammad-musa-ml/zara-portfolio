// Command palette — because she's still a CS grad at heart.
export function initCmdk({ scrollTo, openChat, toggleLens }) {
  const root = document.getElementById('cmdk-root')
  root.innerHTML = `
    <div class="cmdk-veil" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="cmdk-panel">
        <input class="cmdk-input" type="text" placeholder="Where to? Try “projects”, “ai”, “lens”…" aria-label="Search commands" />
        <ul class="cmdk-list"></ul>
      </div>
    </div>`
  const veil = root.querySelector('.cmdk-veil')
  const input = root.querySelector('.cmdk-input')
  const list = root.querySelector('.cmdk-list')

  const commands = [
    { label: 'Go — Intro', kicker: 'ch.00', run: () => scrollTo('#intro') },
    { label: 'Go — Foundations (education)', kicker: 'ch.01', run: () => scrollTo('#foundations') },
    { label: 'Go — The Work (projects)', kicker: 'ch.02', run: () => scrollTo('#work') },
    { label: 'Go — The Lens (philosophy)', kicker: 'ch.03', run: () => scrollTo('#lens') },
    { label: 'Go — Toolkit (skills)', kicker: 'ch.04', run: () => scrollTo('#toolkit') },
    { label: 'Go — Offscreen (beyond work)', kicker: 'ch.05', run: () => scrollTo('#offscreen') },
    { label: 'Go — Contact', kicker: 'ch.06', run: () => scrollTo('#contact') },
    { label: 'Ask my AI twin', kicker: 'ai', run: openChat },
    { label: 'Toggle the design lens', kicker: 'meta', run: toggleLens },
    { label: 'Open the résumé', kicker: 'pdf', run: () => { location.href = './resume.html' } },
    { label: 'Copy email address', kicker: 'hi', run: async () => { try { await navigator.clipboard.writeText('hello@zaraahmed.dev') } catch {} } }
  ]

  let filtered = commands
  let active = 0
  let open = false

  const fuzzy = (q, s) => {
    q = q.toLowerCase(); s = s.toLowerCase()
    let i = 0
    for (const ch of s) if (ch === q[i]) i++
    return i === q.length
  }

  function render() {
    if (!filtered.length) { list.innerHTML = `<li class="cmdk-empty">Nothing matches — try “ai” or “work”.</li>`; return }
    list.innerHTML = filtered.map((c, i) =>
      `<li><button type="button" class="cmdk-item ${i === active ? 'is-active' : ''}" data-i="${i}">${c.label}<span class="ck-kicker">${c.kicker}</span></button></li>`).join('')
    list.querySelectorAll('.cmdk-item').forEach((btn) => btn.addEventListener('click', () => exec(Number(btn.dataset.i))))
  }

  function exec(i) { const cmd = filtered[i]; if (!cmd) return; setOpen(false); setTimeout(() => cmd.run(), 60) }

  function setOpen(state) {
    open = state
    veil.classList.toggle('is-open', open)
    if (open) { input.value = ''; filtered = commands; active = 0; render(); setTimeout(() => input.focus(), 40) }
  }

  input.addEventListener('input', () => {
    filtered = commands.filter((c) => fuzzy(input.value.trim(), c.label + ' ' + c.kicker))
    active = 0; render()
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); render() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render() }
    else if (e.key === 'Enter') { e.preventDefault(); exec(active) }
  })
  veil.addEventListener('click', (e) => { if (e.target === veil) setOpen(false) })
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(!open) }
    else if (e.key === 'Escape' && open) setOpen(false)
  })
  document.getElementById('cmdk-open')?.addEventListener('click', () => setOpen(true))

  return { openCmdk: () => setOpen(true) }
}
