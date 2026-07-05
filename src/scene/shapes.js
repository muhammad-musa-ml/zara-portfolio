// Procedural point-cloud targets — one constellation per chapter.
// Every shape is generated, not loaded: zero assets, instant boot.

const TAU = Math.PI * 2

function jitter(arr, i, amt) {
  arr[i] += (Math.random() - 0.5) * amt
  arr[i + 1] += (Math.random() - 0.5) * amt
  arr[i + 2] += (Math.random() - 0.5) * amt
}

/** 00 — a quiet star-sphere (the untouched sky) */
export function sphere(count) {
  const a = new Float32Array(count * 3)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = phi * i
    // airy nebula, not a solid shell: wide radius spread + inner dust
    const R = i % 8 === 0 ? 0.25 + Math.random() * 0.85 : 0.95 + Math.pow(Math.random(), 1.6) * 0.42
    a[i * 3] = Math.cos(th) * r * R
    a[i * 3 + 1] = y * R
    a[i * 3 + 2] = Math.sin(th) * r * R
    jitter(a, i * 3, 0.1)
  }
  return a
}

/** 01 — a double helix climbing (foundations, learning compounding) */
export function helix(count) {
  const a = new Float32Array(count * 3)
  const turns = 2.6, height = 2.6
  for (let i = 0; i < count; i++) {
    const t = i / count
    const strand = i % 2
    const R = 0.62 * (0.82 + Math.random() * 0.36)
    const ang = t * turns * TAU + strand * Math.PI
    const rungs = i % 23 === 0
    if (rungs) {
      // occasional rungs bridging the strands
      const mix = Math.random()
      const angA = t * turns * TAU, angB = angA + Math.PI
      a[i * 3] = Math.cos(angA) * R * (1 - mix) + Math.cos(angB) * R * mix
      a[i * 3 + 2] = Math.sin(angA) * R * (1 - mix) + Math.sin(angB) * R * mix
    } else {
      a[i * 3] = Math.cos(ang) * R
      a[i * 3 + 2] = Math.sin(ang) * R
    }
    a[i * 3 + 1] = (t - 0.5) * height
    jitter(a, i * 3, 0.16)
  }
  return a
}

/** 02 — a torus knot (the work: interlocked craft) */
export function torusKnot(count) {
  const a = new Float32Array(count * 3)
  const p = 2, q = 3, R = 0.72, tube = 0.24
  for (let i = 0; i < count; i++) {
    const t = (i / count) * TAU
    const qt = q * t, pt = p * t
    const r = R * (2 + Math.cos(qt)) * 0.5
    const cx = r * Math.cos(pt)
    const cy = r * Math.sin(pt)
    const cz = R * Math.sin(qt) * 0.5
    // scatter around the tube
    const ang = Math.random() * TAU
    const rad = Math.sqrt(Math.random()) * tube * 1.5
    a[i * 3] = cx + Math.cos(ang) * rad
    a[i * 3 + 1] = cy * 0.9 + Math.sin(ang) * rad
    a[i * 3 + 2] = cz + (Math.random() - 0.5) * tube * 1.6
  }
  return a
}

/** 03 — an eye (the lens: observation, psychology) */
export function eye(count) {
  const a = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const pick = Math.random()
    let x, y, z
    if (pick < 0.3) {
      // iris ring
      const ang = Math.random() * TAU
      const r = 0.38 + Math.random() * 0.2
      x = Math.cos(ang) * r; y = Math.sin(ang) * r; z = (Math.random() - 0.5) * 0.16
    } else if (pick < 0.42) {
      // pupil disc
      const ang = Math.random() * TAU
      const r = Math.sqrt(Math.random()) * 0.22
      x = Math.cos(ang) * r; y = Math.sin(ang) * r; z = (Math.random() - 0.5) * 0.12
    } else {
      // almond outline — two mirrored arcs
      const t = Math.random()
      const ang = t * Math.PI
      const sign = Math.random() < 0.5 ? 1 : -1
      x = Math.cos(ang) * 1.25 * (0.94 + Math.random() * 0.12)
      y = sign * Math.sin(ang) * 0.62 * (0.86 + Math.random() * 0.28)
      z = (Math.random() - 0.5) * 0.18
    }
    a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z
  }
  return a
}

/** 04 — a woven grid wave (toolkit: systems, order) */
export function gridWave(count) {
  const a = new Float32Array(count * 3)
  const cols = Math.ceil(Math.sqrt(count * 1.6))
  const rows = Math.ceil(count / cols)
  let i = 0
  for (let ry = 0; ry < rows && i < count; ry++) {
    for (let cx = 0; cx < cols && i < count; cx++) {
      const u = cx / (cols - 1) - 0.5
      const v = ry / (rows - 1) - 0.5
      const x = u * 2.2
      const z = v * 1.5
      const y = Math.sin(u * 5.2) * 0.28 + Math.cos(v * 4.4 + u * 2.2) * 0.24
      a[i * 3] = x; a[i * 3 + 1] = y * 1.4; a[i * 3 + 2] = z
      jitter(a, i * 3, 0.18)
      i++
    }
  }
  return a
}

/** 05 — a heart, slightly starry (offscreen: the human) */
export function heart(count) {
  const a = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = Math.random() * TAU
    // classic parametric heart
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const fill = Math.pow(Math.random(), 0.62) // gentle bias to the outline
    a[i * 3] = (hx / 16) * 1.18 * fill + (Math.random() - 0.5) * 0.12
    a[i * 3 + 1] = (hy / 16) * 1.18 * fill + 0.1 + (Math.random() - 0.5) * 0.12
    a[i * 3 + 2] = (Math.random() - 0.5) * 0.42 * (1 - fill * 0.5)
  }
  return a
}

/** 06 — a signal orb with a ring (contact: the beacon, the AI) */
export function beacon(count) {
  const a = new Float32Array(count * 3)
  const tilt = 0.42
  for (let i = 0; i < count; i++) {
    if (i % 5 < 2) {
      // core orb — airy shell with inner dust
      const u = Math.random(), v = Math.random()
      const th = TAU * u, ph = Math.acos(2 * v - 1)
      const R = i % 17 === 0 ? Math.random() * 0.6 : 0.55 + Math.pow(Math.random(), 1.2) * 0.4
      a[i * 3] = R * Math.sin(ph) * Math.cos(th)
      a[i * 3 + 1] = R * Math.cos(ph)
      a[i * 3 + 2] = R * Math.sin(ph) * Math.sin(th)
    } else {
      // orbital ring
      const ang = Math.random() * TAU
      const r = 1.18 + (Math.random() - 0.5) * 0.3
      const x = Math.cos(ang) * r
      const z = Math.sin(ang) * r
      a[i * 3] = x
      a[i * 3 + 1] = z * Math.sin(tilt) + (Math.random() - 0.5) * 0.08
      a[i * 3 + 2] = z * Math.cos(tilt)
    }
  }
  return a
}

export function buildTargets(count) {
  return [sphere(count), helix(count), torusKnot(count), eye(count), gridWave(count), heart(count), beacon(count)]
}
