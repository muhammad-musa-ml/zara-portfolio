// Fullscreen fragment-shader background engine.
// Every variant shares one uniform contract:
//   uTime · uProgress (0→6 voyage) · uRes · uMouse (0..1) · uColA/uColB (chapter-lerped) · uOpacity
import {
  Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh,
  WebGLRenderer, Color, Vector2
} from 'three'
import { PALETTES } from './palettes.js'

const VERT = /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`

export function createShaderBg(canvas, frag, { dprCap = 1.6, instant = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uColA: { value: new Color(PALETTES[0][0]) },
      uColB: { value: new Color(PALETTES[0][1]) },
      uOpacity: { value: instant ? 1 : 0 }
    }
  })
  scene.add(new Mesh(new PlaneGeometry(2, 2), mat))

  let progress = 0
  let rafId = 0
  let running = true
  let opacityCap = 1
  let sizedW = -1, sizedH = -1
  const mouseTarget = new Vector2(0.5, 0.5)
  const colA = new Color(), colB = new Color()
  const cA0 = new Color(), cA1 = new Color(), cB0 = new Color(), cB1 = new Color()

  function setProgress(p) {
    progress = Math.max(0, Math.min(p, 6))
    const s = Math.min(Math.floor(progress), 5)
    const f = progress - s
    cA0.set(PALETTES[s][0]); cA1.set(PALETTES[s + 1][0])
    cB0.set(PALETTES[s][1]); cB1.set(PALETTES[s + 1][1])
    colA.lerpColors(cA0, cA1, f)
    colB.lerpColors(cB0, cB1, f)
    mat.uniforms.uColA.value.copy(colA)
    mat.uniforms.uColB.value.copy(colB)
    mat.uniforms.uProgress.value = progress
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight
    if (!w || !h) return
    sizedW = w; sizedH = h
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
    renderer.setSize(w, h, false)
    mat.uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height)
    opacityCap = w / h < 0.8 ? 0.8 : 1
  }

  function onPointer(e) {
    mouseTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  let last = performance.now()
  function tick(now) {
    rafId = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (window.innerWidth !== sizedW || window.innerHeight !== sizedH) resize()
    mat.uniforms.uTime.value += dt
    mat.uniforms.uMouse.value.lerp(mouseTarget, 0.06)
    const u = mat.uniforms.uOpacity
    if (u.value < opacityCap) u.value = Math.min(opacityCap, u.value + dt * 0.8)
    else if (u.value > opacityCap) u.value = opacityCap
    renderer.render(scene, camera)
  }

  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(rafId); running = false }
    else if (!running) { running = true; last = performance.now(); rafId = requestAnimationFrame(tick) }
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', resize)
  resize()
  rafId = requestAnimationFrame(tick)

  function dispose() {
    cancelAnimationFrame(rafId)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointer)
    mat.dispose()
    renderer.dispose(); renderer.forceContextLoss()
  }

  return { setProgress, dispose, renderer }
}
