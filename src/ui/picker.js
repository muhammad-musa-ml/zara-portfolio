// The style lab — a local-only picker for auditioning backgrounds and cursors.
// Shown in dev or with ?pick. Choices persist in localStorage; never ships state.
import { BG_OPTIONS } from '../backgrounds/index.js'
import { CURSOR_OPTIONS } from './cursors.js'

export function initPicker({ currentBg, currentCursor, onBg, onCursor }) {
  const root = document.createElement('div')
  root.id = 'style-lab'
  root.innerHTML = `
    <button type="button" class="sl-tab">◧ style lab</button>
    <div class="sl-panel">
      <div class="sl-head"><strong>style lab</strong><span>help pick the look</span><button type="button" class="sl-min" aria-label="Minimize">–</button></div>
      <p class="sl-hint">Flip skins live, then scroll to feel each one. Your pick sticks on this device — tell Fatima which combo wins.</p>
      <div class="sl-group">
        <span class="sl-label">Background</span>
        <div class="sl-chips" data-kind="bg">
          ${BG_OPTIONS.map((o) => `<button type="button" class="sl-chip ${o.id === currentBg ? 'is-on' : ''}" data-id="${o.id}">${o.label}</button>`).join('')}
        </div>
        <p class="sl-note" data-note>${BG_OPTIONS.find((o) => o.id === currentBg)?.note || ''}</p>
      </div>
      <div class="sl-group">
        <span class="sl-label">Cursor</span>
        <div class="sl-chips" data-kind="cur">
          ${CURSOR_OPTIONS.map((o) => `<button type="button" class="sl-chip ${o.id === currentCursor ? 'is-on' : ''}" data-id="${o.id}">${o.label}</button>`).join('')}
        </div>
        <p class="sl-note" data-note-cur>${CURSOR_OPTIONS.find((o) => o.id === currentCursor)?.note || ''}</p>
      </div>
    </div>`
  document.body.appendChild(root)

  const panel = root.querySelector('.sl-panel')
  const tab = root.querySelector('.sl-tab')
  const setOpen = (v) => { panel.classList.toggle('is-open', v); tab.classList.toggle('is-hidden', v) }
  tab.addEventListener('click', () => setOpen(true))
  root.querySelector('.sl-min').addEventListener('click', () => setOpen(false))
  setOpen(true)

  root.querySelector('[data-kind="bg"]').addEventListener('click', (e) => {
    const btn = e.target.closest('.sl-chip'); if (!btn) return
    root.querySelectorAll('[data-kind="bg"] .sl-chip').forEach((b) => b.classList.toggle('is-on', b === btn))
    root.querySelector('[data-note]').textContent = BG_OPTIONS.find((o) => o.id === btn.dataset.id)?.note || ''
    onBg(btn.dataset.id)
  })
  root.querySelector('[data-kind="cur"]').addEventListener('click', (e) => {
    const btn = e.target.closest('.sl-chip'); if (!btn) return
    root.querySelectorAll('[data-kind="cur"] .sl-chip').forEach((b) => b.classList.toggle('is-on', b === btn))
    root.querySelector('[data-note-cur]').textContent = CURSOR_OPTIONS.find((o) => o.id === btn.dataset.id)?.note || ''
    onCursor(btn.dataset.id)
  })
}
