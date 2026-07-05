// Offline fallback: curated Q&A with lightweight fuzzy matching.
// If every live provider is unreachable, the twin still answers honestly.

let faqCache = null

export async function loadFaq() {
  if (faqCache) return faqCache
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}persona/faq.json`)
    faqCache = res.ok ? await res.json() : []
  } catch { faqCache = [] }
  return faqCache
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'do', 'does', 'did', 'you', 'your', 'her', 'she', 'me', 'i', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'what', 'whats', 'how', 'can', 'could', 'would', 'about', 'tell', 'have', 'has', 'with', 'at'])

function tokens(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))
}

export function matchFaq(question, faq) {
  const qt = new Set(tokens(question))
  if (!qt.size) return null
  let best = null, bestScore = 0
  for (const entry of faq) {
    const candidates = [entry.q, ...(entry.variants || [])]
    for (const cand of candidates) {
      const ct = tokens(cand)
      if (!ct.length) continue
      let overlap = 0
      for (const t of ct) if (qt.has(t)) overlap++
      const score = overlap / Math.sqrt(ct.length) + (question.toLowerCase().includes(cand.toLowerCase()) ? 1 : 0)
      if (score > bestScore) { bestScore = score; best = entry }
    }
  }
  return bestScore >= 0.9 ? best : null
}

export function offlineAnswer(question, faq) {
  const hit = matchFaq(question, faq)
  if (hit) return hit.a
  return "I'm in offline mode right now (the free live model is resting), so I can only answer from my prepared notes — and that question isn't in them. Try one of the suggested questions below, or reach the human Zara directly at hello@zaraahmed.dev."
}
