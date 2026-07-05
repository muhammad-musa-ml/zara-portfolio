// Hydrates the seven chapters from site-content.json.
// All copy lives in one JSON file so real details can replace demo details in one edit.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function splitName(name) {
  return name.split(' ').map((word, wi) => {
    const chars = [...word].map((ch, ci) =>
      `<span class="char" style="--ci:${wi * 6 + ci}">${esc(ch)}</span>`).join('')
    return `<span class="word">${chars}</span>`
  }).join(' ')
}

export function buildSite(content) {
  const c = content
  const main = document.getElementById('main')
  const ch = c.chapters

  main.innerHTML = `
  <!-- 00 · hello -->
  <section class="chapter" id="${ch[0].id}" data-chapter="0" aria-label="${esc(ch[0].title)}">
    <div class="chapter-inner">
      <div class="hero-stage">
        <p class="hero-greeting" data-lens="greeting"><span class="greet">${esc(c.hero.greetings[0])}</span></p>
        <h1 class="hero-name" data-lens="hero-type">${splitName(c.hero.name)}</h1>
        <p class="hero-roles">${c.hero.roles.map(esc).join(' <span class="role-sep">/</span> ')}</p>
        <p class="hero-tagline" data-reveal style="--d:.55s">${esc(c.hero.tagline)}</p>
        <p class="hero-sub" data-reveal style="--d:.7s">${esc(c.hero.sub)}</p>
        <div class="hero-cue" data-reveal style="--d:1s" data-lens="scroll-cue">
          <span class="cue-line" aria-hidden="true"></span><span>${esc(c.hero.scrollCue)}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 01 · foundations -->
  <section class="chapter" id="${ch[1].id}" data-chapter="1" aria-labelledby="h-foundations">
    <span class="ghost-num" aria-hidden="true" data-parallax>01</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[1].kicker}</span>
        <span class="meta-title">${esc(ch[1].nav)}</span>
      </div>
      <div class="chapter-body">
        <h2 id="h-foundations" data-reveal>Four years of <em>foundations</em></h2>
        <div class="timeline" data-lens="timeline">
          <span class="tl-fill" aria-hidden="true"></span>
          ${c.timeline.map((n, i) => `
          <div class="tl-node" data-reveal style="--d:${i * 0.06}s">
            <span class="tl-year">${esc(n.year)}</span>
            <h3 class="tl-title">${esc(n.title)}</h3>
            <p class="tl-body">${esc(n.body)}</p>
          </div>`).join('')}
        </div>
        <div class="edu-card" data-reveal>
          <p class="edu-degree serif">BS Computer Science</p>
          <p class="edu-school">LUMS — Syed Babar Ali School of Science and Engineering, Lahore · 2022–2026</p>
          <p class="edu-honors">Dean's Honor List ×2 · HCI + ML + systems coursework</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 02 · the work -->
  <section class="chapter" id="${ch[2].id}" data-chapter="2" aria-labelledby="h-work">
    <span class="ghost-num" aria-hidden="true" data-parallax>02</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[2].kicker}</span>
        <span class="meta-title">${esc(ch[2].nav)}</span>
      </div>
      <div class="chapter-body">
        <h2 id="h-work" data-reveal>Things I've <em>actually shipped</em></h2>
        <div class="project-stack" data-lens="project-stack">
          ${c.projects.map((p, i) => `
          <article class="project-card" data-index="0${i + 1}" aria-label="${esc(p.title)}">
            <div class="pc-main">
              <header class="pc-head">
                <span class="pc-cat">${esc(p.category)}</span>
                <h3 class="pc-title">${esc(p.title)}</h3>
                <p class="pc-oneliner">${esc(p.oneLiner)}</p>
              </header>
              <div class="pc-cols">
                <div><p class="pc-label">The itch</p><p class="pc-text">${esc(p.problem)}</p></div>
                <div><p class="pc-label">The move</p><p class="pc-text">${esc(p.approach)}</p></div>
                <div>
                  <p class="pc-label">What happened</p>
                  <ul class="pc-impact">${p.impact.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
                </div>
                <div class="pc-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
              </div>
            </div>
            <div class="pc-art art-${esc(p.slug)}" role="img" aria-label="Abstract placeholder artwork for ${esc(p.title)}">
              <span class="art-mark" aria-hidden="true">${esc(p.title[0])}</span>
              <span class="art-note">screens on request</span>
            </div>
          </article>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- 03 · the lens -->
  <section class="chapter" id="${ch[3].id}" data-chapter="3" aria-labelledby="h-lens">
    <span class="ghost-num" aria-hidden="true" data-parallax>03</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[3].kicker}</span>
        <span class="meta-title">${esc(ch[3].nav)}</span>
      </div>
      <div class="chapter-body">
        <h2 id="h-lens" data-reveal>Design is <em>applied psychology</em></h2>
        <p class="lens-intro" data-reveal>${esc(c.philosophy.intro)} <em>Don't take my word for it — run the experiments:</em></p>
        <div class="demo-grid" data-lens="demos">
          ${c.philosophy.principles.map((p, i) => `
          <div class="demo-card" data-demo="${i}" data-reveal style="--d:${i * 0.12}s">
            <h3 class="demo-name">${esc(p.name)}</h3>
            <p class="demo-claim">${esc(p.claim)}</p>
            <div class="demo-stage" data-stage></div>
            <p class="demo-result" data-result aria-live="polite"></p>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- 04 · toolkit -->
  <section class="chapter" id="${ch[4].id}" data-chapter="4" aria-labelledby="h-toolkit">
    <span class="ghost-num" aria-hidden="true" data-parallax>04</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[4].kicker}</span>
        <span class="meta-title">${esc(ch[4].nav)}</span>
      </div>
      <div class="chapter-body">
        <h2 id="h-toolkit" data-reveal>The <em>toolkit</em></h2>
        <div class="skill-groups">
          ${c.skills.groups.map((g, i) => `
          <div class="skill-group" data-reveal style="--d:${i * 0.1}s">
            <span class="sg-label">${esc(g.label)}</span>
            <div class="sg-items">${g.items.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
          </div>`).join('')}
        </div>
        <p class="skills-note" data-reveal data-lens="honest-note">“${esc(c.skills.note)}”</p>
      </div>
    </div>
  </section>

  <!-- 05 · offscreen -->
  <section class="chapter" id="${ch[5].id}" data-chapter="5" aria-labelledby="h-offscreen">
    <span class="ghost-num" aria-hidden="true" data-parallax>05</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[5].kicker}</span>
        <span class="meta-title">${esc(ch[5].nav)}</span>
      </div>
      <div class="chapter-body">
        <h2 id="h-offscreen" data-reveal>Off<em>screen</em></h2>
        <div class="off-grid">
          <div class="portrait-frame" data-reveal data-lens="portrait">
            <span class="pf-mark" aria-hidden="true">z.</span>
            <span class="pf-note">photo · coming soon</span>
          </div>
          <div>
            <p class="off-intro" data-reveal>${esc(c.offscreen.intro)}</p>
            <ol class="fact-list">
              ${c.offscreen.facts.map((f, i) => `<li data-reveal style="--d:${i * 0.05}s">${esc(f)}</li>`).join('')}
            </ol>
            <div class="value-cards">
              ${c.offscreen.values.map((v, i) => `
              <div class="value-card" data-reveal style="--d:${i * 0.08}s">
                <span class="vc-name">${esc(v.name)}</span>
                <span class="vc-body">${esc(v.body)}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 06 · contact -->
  <section class="chapter" id="${ch[6].id}" data-chapter="6" aria-labelledby="h-contact">
    <span class="ghost-num" aria-hidden="true" data-parallax>06</span>
    <div class="chapter-inner">
      <div class="chapter-meta" data-reveal>
        <span class="kicker">Ch. ${ch[6].kicker}</span>
        <span class="meta-title">${esc(ch[6].nav)}</span>
      </div>
      <div class="chapter-body contact-stage" data-lens="peak-end">
        <h2 id="h-contact" data-reveal>Let's <em>talk</em></h2>
        <p class="contact-body" data-reveal>${esc(c.contact.body)}</p>
        <a class="contact-email" href="mailto:${esc(c.contact.email)}" data-reveal data-cursor="hover">${esc(c.contact.email)}</a>
        <div class="contact-links" data-reveal>
          ${c.contact.links.map((l) => `<a href="${esc(l.url)}" ${l.url === '#' ? '' : 'target="_blank" rel="noopener"'}>${esc(l.label)}</a>`).join('')}
        </div>
        <div class="ai-invite" data-reveal data-lens="ai-invite">
          <h3>Short on time? Interview my AI twin.</h3>
          <p>It knows my projects, my stack, and — unusually for an AI — exactly what I <em>haven't</em> done.</p>
          <button type="button" class="ai-pill" data-open-chat data-cursor="hover"><span class="ai-star" aria-hidden="true">✦</span> Start the interview</button>
        </div>
        <p class="contact-closing" data-reveal>${esc(c.contact.closing)}</p>
      </div>
    </div>
  </section>`

  // footer slots
  document.querySelector('[data-slot="footer.line"]').textContent = c.footer.line
  document.querySelector('[data-slot="footer.credit"]').textContent = c.footer.credit

  // nav dots
  const dots = document.querySelector('.chapter-dots')
  dots.innerHTML = ch.map((chp, i) =>
    `<a href="#${chp.id}" data-dot="${i}" aria-label="${esc(chp.nav)}"><span class="dot-tip">${esc(chp.nav)}</span></a>`).join('')
}
