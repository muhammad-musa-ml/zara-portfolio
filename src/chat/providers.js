// LLM provider chain — every provider is free; the chain degrades gracefully:
//   1. Gemini (if a free AI Studio key is configured in public/config.json) — best quality
//   2. Pollinations.ai — keyless, CORS-open, anonymous tier
//   3. Offline FAQ (faq.js) — handled by the caller when this chain throws
// Endpoints verified live against provider docs, July 2026.

const TIMEOUTS = { gemini: 22000, pollinations: 32000 }

function withTimeout(ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return { signal: ctrl.signal, done: () => clearTimeout(t) }
}

async function askGemini({ system, history, config }) {
  const key = config.geminiApiKey?.trim()
  if (!key) throw new Error('gemini: no key configured')
  const model = config.geminiModel || 'gemini-2.5-flash'
  const t = withTimeout(TIMEOUTS.gemini)
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: t.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { temperature: 0.65, maxOutputTokens: 1600 }
        })
      })
    if (!res.ok) throw new Error(`gemini: HTTP ${res.status}`)
    const data = await res.json()
    const parts = data?.candidates?.[0]?.content?.parts
    const text = Array.isArray(parts) ? parts.map((p) => p.text || '').join('').trim() : ''
    if (!text) throw new Error('gemini: empty reply')
    return { text, provider: 'gemini' }
  } finally { t.done() }
}

async function askPollinations({ system, history }) {
  const t = withTimeout(TIMEOUTS.pollinations)
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: t.signal,
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'system', content: system }, ...history.map((m) => ({ role: m.role, content: m.content }))]
      })
    })
    if (!res.ok) throw new Error(`pollinations: HTTP ${res.status}`)
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('pollinations: empty reply')
    return { text, provider: 'pollinations' }
  } finally { t.done() }
}

const PROVIDERS = { gemini: askGemini, pollinations: askPollinations }

// circuit breaker: a provider that fails with an auth-shaped error (401/403,
// missing key) is skipped for the rest of the session — no wasted round-trips.
const dead = new Set()
const isAuthShaped = (err) => /no key|HTTP 40[13]/.test(err?.message || '')

/**
 * Ask the chain in configured order. Throws only if every provider fails —
 * the caller then answers from the offline FAQ.
 */
export async function askLLM({ system, history, config }) {
  const order = Array.isArray(config.providerOrder) && config.providerOrder.length
    ? config.providerOrder : ['gemini', 'pollinations']
  let lastErr = null
  for (const name of order) {
    const fn = PROVIDERS[name]
    if (!fn || dead.has(name)) continue
    try { return await fn({ system, history, config }) }
    catch (err) {
      lastErr = err
      if (isAuthShaped(err)) dead.add(name)
    }
  }
  throw lastErr || new Error('no providers available')
}
