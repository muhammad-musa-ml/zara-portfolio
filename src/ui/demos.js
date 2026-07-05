// Interactive psychology mini-experiments — the "prove it" section.
// Each demo measures the visitor's own behavior and reports it back.

const DECOYS = ['Our story', 'Learn more', 'Explore', 'Overview', 'Details', 'Insights', 'Features', 'Resources', 'About us', 'Services', 'Careers']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* Hick's law: find the CTA among 3, then among 12 */
function hicksDemo(stage, result) {
  let phase = 0, t0 = 0, t1 = 0
  function roundUI(buttonCount, label) {
    const decoys = shuffle(DECOYS).slice(0, buttonCount - 1)
    const all = shuffle([...decoys.map((d) => ({ label: d, target: false })), { label: 'Get in touch', target: true }])
    stage.innerHTML = `<p class="pc-label">${label} — click <strong>“Get in touch”</strong></p>
      <div class="demo-btn-grid">${all.map((b) => `<button type="button" class="demo-btn" data-t="${b.target ? 1 : 0}">${b.label}</button>`).join('')}</div>`
    const start = performance.now()
    stage.querySelectorAll('.demo-btn').forEach((btn) => btn.addEventListener('click', () => {
      if (btn.dataset.t !== '1') { btn.style.opacity = 0.35; return }
      const ms = Math.round(performance.now() - start)
      if (phase === 0) { t0 = ms; phase = 1; roundUI(12, 'Round 2 of 2') }
      else {
        t1 = ms
        const ratio = t0 > 0 ? (t1 / t0).toFixed(1) : '?'
        result.textContent = `3 options: ${t0}ms · 12 options: ${t1}ms — ${ratio}× slower. Fewer choices, faster action.`
        stage.innerHTML = `<button type="button" class="demo-start">Run it again</button>`
        stage.querySelector('.demo-start').addEventListener('click', () => { phase = 0; result.textContent = ''; roundUI(3, 'Round 1 of 2') })
      }
    }))
  }
  stage.innerHTML = `<button type="button" class="demo-start">Start the experiment</button>`
  stage.querySelector('.demo-start').addEventListener('click', () => roundUI(3, 'Round 1 of 2'))
}

/* Fitts's law: small far target vs big near target */
function fittsDemo(stage, result) {
  function run() {
    stage.innerHTML = `<div class="fitts-stage"><button type="button" class="fitts-target small">hit</button></div><p class="pc-label">Hit the small one…</p>`
    let start = performance.now()
    stage.querySelector('.small').addEventListener('click', () => {
      const tSmall = Math.round(performance.now() - start)
      stage.innerHTML = `<div class="fitts-stage"><button type="button" class="fitts-target big">hit</button></div><p class="pc-label">…now the big one</p>`
      start = performance.now()
      stage.querySelector('.big').addEventListener('click', () => {
        const tBig = Math.round(performance.now() - start)
        result.textContent = `Small & far: ${tSmall}ms · big & near: ${tBig}ms. Size + distance = speed. That's why the “Ask my AI” button is huge.`
        stage.innerHTML = `<button type="button" class="demo-start">Run it again</button>`
        stage.querySelector('.demo-start').addEventListener('click', run)
      })
    })
  }
  stage.innerHTML = `<button type="button" class="demo-start">Start the experiment</button>`
  stage.querySelector('.demo-start').addEventListener('click', run)
}

/* Von Restorff: the odd one out is the one you remember */
function vonRestorffDemo(stage, result) {
  const words = ['Fetch', 'Cache', 'Route', 'Query', 'Merge', 'Parse']
  function run() {
    const odd = Math.floor(Math.random() * 6)
    stage.innerHTML = `<div class="vr-grid">${words.map((w, i) => `<button type="button" class="vr-chip ${i === odd ? 'is-odd' : ''}" data-odd="${i === odd ? 1 : 0}">${w}</button>`).join('')}</div><p class="pc-label">Quick — click the one your eye went to first</p>`
    stage.querySelectorAll('.vr-chip').forEach((chip) => chip.addEventListener('click', () => {
      const hit = chip.dataset.odd === '1'
      result.textContent = hit
        ? 'The odd one out — like almost everyone. One deliberate anomaly is a memory anchor; I use exactly one per screen.'
        : 'Contrarian! Most eyes jump to the highlighted chip. Either way: distinctiveness drives recall, so I spend it carefully.'
      stage.innerHTML = `<button type="button" class="demo-start">Run it again</button>`
      stage.querySelector('.demo-start').addEventListener('click', run)
    }))
  }
  stage.innerHTML = `<button type="button" class="demo-start">Start the experiment</button>`
  stage.querySelector('.demo-start').addEventListener('click', run)
}

export function initDemos() {
  const builders = [hicksDemo, fittsDemo, vonRestorffDemo]
  document.querySelectorAll('[data-demo]').forEach((card) => {
    const idx = Number(card.dataset.demo)
    const stage = card.querySelector('[data-stage]')
    const result = card.querySelector('[data-result]')
    builders[idx]?.(stage, result)
  })
}
