// resume page — same single source of truth as the site
import '@fontsource/instrument-serif'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/spline-sans-mono'
import './styles/resume.css'
import content from './content/site-content.json'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const r = content.resume
const s = r.sections
const sheet = document.getElementById('resume-sheet')

sheet.innerHTML = `
  <header class="rs-head">
    <h1 class="rs-name">${esc(r.headline)}</h1>
    <p class="rs-subline">${esc(r.subline)}</p>
    <p class="rs-contactline">Lahore, Pakistan · ${esc(content.contact.email)} · github.com/zaraahmed · linkedin.com/in/zaraahmed</p>
  </header>
  <p class="rs-summary">${esc(r.summary)}</p>

  <h2 class="rs-h">Education</h2>
  <div class="rs-item">
    <div class="rs-row"><span class="rs-role">${esc(s.education.degree)} — <span class="rs-org">${esc(s.education.school)}</span></span><span class="rs-dates">${esc(s.education.dates)}</span></div>
    <ul class="rs-bullets"><li>${esc(s.education.honors)}</li></ul>
  </div>

  <h2 class="rs-h">Experience</h2>
  ${s.experience.map((e) => `
  <div class="rs-item">
    <div class="rs-row"><span class="rs-role">${esc(e.title)} — <span class="rs-org">${esc(e.company)}</span></span><span class="rs-dates">${esc(e.dates)}</span></div>
    <ul class="rs-bullets">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
  </div>`).join('')}

  <h2 class="rs-h">Projects</h2>
  ${s.projects.map((p) => `
  <div class="rs-item">
    <div class="rs-row"><span class="rs-role">${esc(p.name)}</span></div>
    <ul class="rs-bullets">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
  </div>`).join('')}

  <h2 class="rs-h">Skills</h2>
  <p class="rs-skill-line"><strong>Engineering:</strong> ${esc(s.skills.engineering)}</p>
  <p class="rs-skill-line"><strong>Design:</strong> ${esc(s.skills.design)}</p>
  <p class="rs-skill-line"><strong>Product & data:</strong> ${esc(s.skills.productData)}</p>

  <h2 class="rs-h">Awards</h2>
  ${s.awards.map((a) => `<p class="rs-award">· ${esc(a)}</p>`).join('')}
`

document.getElementById('print-btn').addEventListener('click', () => window.print())
