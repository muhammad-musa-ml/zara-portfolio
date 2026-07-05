// The living sky: one draw call of morphing, mouse-aware particles.
import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
  ShaderMaterial, Points, Color, AdditiveBlending, Vector3
} from 'three'
import { buildTargets } from './shapes.js'

// (colorA, colorB) per chapter — tuned to the sky gradients in base.css
const PALETTES = [
  ['#8b93ff', '#3b3f9e'],
  ['#a5b4fc', '#6d5bd0'],
  ['#c084fc', '#7c3aed'],
  ['#5eead4', '#0f766e'],
  ['#7dd3fc', '#2563a8'],
  ['#fda4af', '#b0486b'],
  ['#f7ab72', '#d95d3b']
]
// formations live right-of-center — the content column owns the left
const CAM_Z = [3.6, 3.8, 3.4, 3.2, 3.7, 3.4, 3.7]
const OFFSET_X = [1.05, 1.1, 0.95, 1.05, 1.15, -0.85, 1.2]
const OFFSET_Y = [0.0, 0.1, 0.05, 0.1, 0.0, 0.05, 0.22]
// flat formations (eye, heart) must land face-on; volumetric ones may turn
const ROT_Y = [0.0, 0.9, 1.7, 0.12, 0.55, -0.1, 0.35]

const VERT = /* glsl */ `
attribute vec3 aTo;
attribute float aSeed;
uniform float uMix, uTime, uSize, uRepel, uSwirl, uPixelRatio;
uniform vec3 uMouse;
varying float vSeed, vDepth;

void main() {
  // staggered morph: each particle departs on its own beat
  float d = clamp(uMix * 1.45 - aSeed * 0.45, 0.0, 1.0);
  float t = d * d * (3.0 - 2.0 * d);
  vec3 pos = mix(position, aTo, t);

  // idle breath
  pos += 0.024 * vec3(
    sin(uTime * 0.55 + aSeed * 17.0),
    cos(uTime * 0.47 + aSeed * 23.0),
    sin(uTime * 0.63 + aSeed * 29.0));

  // celebration swirl (easter egg)
  if (uSwirl > 0.001) {
    float ang = uSwirl * (0.5 + aSeed * 1.6);
    float c = cos(ang), s = sin(ang);
    pos.xz = mat2(c, -s, s, c) * pos.xz;
    pos.xy = mat2(c, s, -s, c) * pos.xy;
  }

  // cursor repulsion — the sky notices you
  vec2 diff = pos.xy - uMouse.xy;
  float force = uRepel * exp(-dot(diff, diff) * 5.5);
  pos.xy += normalize(diff + vec2(1e-4)) * force;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.45 + 1.0 * fract(aSeed * 7.31));
  float twinkle = 0.74 + 0.26 * sin(uTime * (1.1 + aSeed * 2.2) + aSeed * 41.0);
  gl_PointSize = clamp(size * twinkle * uPixelRatio * (110.0 / -mv.z), 1.0, 24.0);
  vSeed = aSeed;
  vDepth = smoothstep(6.5, 1.6, -mv.z);
}`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColA, uColB;
uniform float uOpacity;
varying float vSeed, vDepth;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.5, 0.04, d);
  float halo = smoothstep(0.5, 0.16, d);
  vec3 col = mix(uColA, uColB, fract(vSeed * 3.71));
  float a = (core * 0.3 + halo * 0.075) * uOpacity * (0.35 + 0.65 * vDepth);
  if (a < 0.012) discard;
  gl_FragColor = vec4(col, a);
}`

export function createScene(canvas, { particleCount = 14000, dprCap = 2, instant = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(55, 1, 0.1, 40)
  camera.position.z = CAM_Z[0]

  const targets = buildTargets(particleCount)
  const seeds = new Float32Array(particleCount)
  for (let i = 0; i < particleCount; i++) seeds[i] = Math.random()

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(targets[0].slice(), 3))
  geo.setAttribute('aTo', new BufferAttribute(targets[1].slice(), 3))
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 1))

  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 0.85 },
      uRepel: { value: 0.16 },
      uSwirl: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, dprCap) },
      uMouse: { value: new Vector3(99, 99, 0) },
      uColA: { value: new Color(PALETTES[0][0]) },
      uColB: { value: new Color(PALETTES[0][1]) },
      uOpacity: { value: instant ? 1 : 0 }
    }
  })

  const points = new Points(geo, mat)
  points.frustumCulled = false
  scene.add(points)

  // ——— state ———
  let seg = 0
  let progress = 0
  let rafId = 0
  let running = true
  let baseScale = 1
  let yLift = 0
  let opacityCap = 1
  const mouseTarget = new Vector3(99, 99, 0)
  const colA = new Color(), colB = new Color()
  const cA0 = new Color(), cA1 = new Color(), cB0 = new Color(), cB1 = new Color()

  function setSegment(s) {
    seg = s
    geo.getAttribute('position').array.set(targets[s])
    geo.getAttribute('aTo').array.set(targets[Math.min(s + 1, 6)])
    geo.getAttribute('position').needsUpdate = true
    geo.getAttribute('aTo').needsUpdate = true
  }

  function setProgress(p) {
    progress = Math.max(0, Math.min(p, 6))
    const s = Math.min(Math.floor(progress), 5)
    if (s !== seg) setSegment(s)
    const f = progress - s
    mat.uniforms.uMix.value = f

    cA0.set(PALETTES[s][0]); cA1.set(PALETTES[s + 1][0])
    cB0.set(PALETTES[s][1]); cB1.set(PALETTES[s + 1][1])
    colA.lerpColors(cA0, cA1, f)
    colB.lerpColors(cB0, cB1, f)
    mat.uniforms.uColA.value.copy(colA)
    mat.uniforms.uColB.value.copy(colB)

    camera.position.z = CAM_Z[s] + (CAM_Z[s + 1] - CAM_Z[s]) * f
    points.position.x = (OFFSET_X[s] + (OFFSET_X[s + 1] - OFFSET_X[s]) * f) * baseScale
    points.position.y = OFFSET_Y[s] + (OFFSET_Y[s + 1] - OFFSET_Y[s]) * f + yLift
    points.rotation.y = ROT_Y[s] + (ROT_Y[s + 1] - ROT_Y[s]) * f
  }

  let sizedW = -1, sizedH = -1
  function resize() {
    const w = window.innerWidth, h = window.innerHeight
    if (!w || !h) return
    sizedW = w; sizedH = h
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // portrait phones: the formation floats high and subtle, never over the copy
    const portrait = camera.aspect < 0.8
    baseScale = portrait ? 0.42 : camera.aspect < 1.15 ? 0.72 : 1
    points.scale.setScalar(portrait ? 0.62 : 1)
    yLift = portrait ? 0.72 : 0
    opacityCap = portrait ? 0.72 : 1
    setProgress(progress)
  }

  // pointer → world position on the z=0 plane
  function onPointer(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    const v = new Vector3(x, y, 0.5).unproject(camera)
    const dir = v.sub(camera.position).normalize()
    const dist = -camera.position.z / dir.z
    const world = camera.position.clone().add(dir.multiplyScalar(dist))
    mouseTarget.set(world.x - points.position.x, world.y - points.position.y, 0)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerleave', () => mouseTarget.set(99, 99, 0))

  let last = performance.now()
  function tick(now) {
    rafId = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    // some environments never fire `resize` (emulated viewports, fold/rotate edge cases)
    if (window.innerWidth !== sizedW || window.innerHeight !== sizedH) resize()
    mat.uniforms.uTime.value += dt
    mat.uniforms.uMouse.value.lerp(mouseTarget, 0.08)
    // fade the sky in on boot
    if (mat.uniforms.uOpacity.value < opacityCap) {
      mat.uniforms.uOpacity.value = Math.min(opacityCap, mat.uniforms.uOpacity.value + dt * 0.7)
    } else if (mat.uniforms.uOpacity.value > opacityCap) {
      mat.uniforms.uOpacity.value = opacityCap
    }
    renderer.render(scene, camera)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); running = false }
    else if (!running) { running = true; last = performance.now(); rafId = requestAnimationFrame(tick) }
  })

  window.addEventListener('resize', resize)
  resize()
  rafId = requestAnimationFrame(tick)

  // dev-only hook: lets tooling force frames when rAF is throttled (hidden tabs)
  if (import.meta.env.DEV) {
    window.__sky = {
      renderOnce() { resize(); mat.uniforms.uOpacity.value = 1; renderer.render(scene, camera) },
      setProgress(p) { setProgress(p) },
      snapshotAlpha() {
        const gl = renderer.getContext()
        const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight
        const px = new Uint8Array(w * h * 4)
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px)
        let lit = 0
        for (let i = 0; i < px.length; i += 16) if (px[i + 3] > 8) lit++
        return { buffer: `${w}x${h}`, litSamples: lit, totalSamples: Math.floor(px.length / 16) }
      }
    }
  }

  /** easter-egg celebration: the sky does a barrel roll */
  let swirlAnim = null
  function burst(gsap) {
    if (swirlAnim) swirlAnim.kill()
    const u = mat.uniforms
    swirlAnim = gsap.timeline()
      .to(u.uSwirl, { value: Math.PI * 2, duration: 1.6, ease: 'power2.inOut' })
      .to(u.uRepel, { value: 1.4, duration: 0.4, ease: 'power2.out' }, 0)
      .to(u.uRepel, { value: 0.16, duration: 1.1, ease: 'power2.inOut' }, 0.5)
      .set(u.uSwirl, { value: 0 })
  }

  return { setProgress, burst, renderer }
}
