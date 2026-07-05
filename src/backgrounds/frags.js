// The five shader skies. Same uniform contract, five personalities.
// All scroll-aware (uProgress 0→6), palette-aware, cursor-aware, and grain-free.

const H = /* glsl */ `
precision highp float;
uniform float uTime, uProgress, uOpacity;
uniform vec2 uRes, uMouse;
uniform vec3 uColA, uColB;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
`

/** Aurora curtains — luminous ribbons rippling across the upper sky.
 *  Scroll: curtains drift, re-shape, and re-tint per chapter. */
export const AURORA = H + /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);
  p += (uMouse - 0.5) * 0.07;
  float t = uTime * 0.05;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float y0 = 0.66 - fi * 0.17 + sin(t * 0.7 + fi * 2.1 + uProgress * 0.9) * 0.05;
    float wob = fbm(vec2(p.x * 1.35 + t + fi * 7.3, uProgress * 0.55 + fi * 3.1)) - 0.5;
    float d = uv.y - (y0 + wob * 0.55);
    float band = exp(-d * d * (30.0 + fi * 18.0));
    float shimmer = 0.65 + 0.35 * fbm(vec2(p.x * 6.0 - t * 2.2, fi * 11.0));
    vec3 c = mix(uColB, uColA, 0.3 + 0.7 * fbm(vec2(p.x * 2.0 + fi, uProgress * 0.4)));
    col += c * band * shimmer * (0.6 - fi * 0.13);
    alpha += band * (0.5 - fi * 0.11);
  }
  // soft rising haze at the horizon
  float haze = smoothstep(0.55, 0.0, uv.y) * 0.14;
  col += uColB * haze;
  alpha += haze * 0.6;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.85) * uOpacity);
}`

/** Liquid silk — domain-warped folds of cloth catching chapter light.
 *  Scroll: the folds slowly re-drape; the sheen re-tints. */
export const SILK = H + /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 1.5;
  p += (uMouse - 0.5) * 0.12;
  float t = uTime * 0.035;

  vec2 q = vec2(fbm(p + vec2(t, uProgress * 0.32)), fbm(p + vec2(2.7, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.4 * q + vec2(uProgress * 0.45, 0.6)), fbm(p + 2.9 * q + vec2(4.2, 2.8)));
  float f = fbm(p + 2.5 * r);

  float folds = smoothstep(0.32, 0.88, f);
  float sheen = pow(f, 3.0) * 1.6;
  vec3 col = mix(uColB * 0.5, uColA, folds) + sheen * 0.18;

  gl_FragColor = vec4(col * 0.85, (0.2 + 0.52 * folds) * uOpacity);
}`

/** Contour lines — a living topographic blueprint.
 *  Scroll: the terrain gains elevation; lines flow like survey maps redrawing. */
export const CONTOURS = H + /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * asp * 2.1;
  p += (uMouse - 0.5) * 0.1;

  float h = fbm(p * 1.15 + vec2(0.0, uProgress * 0.45)) + uTime * 0.014 + uProgress * 0.1;

  // minor iso-lines
  float iso = h * 18.0;
  float d1 = abs(fract(iso) - 0.5);
  float w1 = fwidth(iso);
  float minor = 1.0 - smoothstep(w1 * 0.7, w1 * 2.1, d1);

  // major lines every 4th
  float iso2 = h * 4.5;
  float d2 = abs(fract(iso2) - 0.5);
  float w2 = fwidth(iso2);
  float major = 1.0 - smoothstep(w2 * 0.8, w2 * 2.6, d2);

  // faint survey dot-grid
  vec2 g = fract(uv * asp * 26.0) - 0.5;
  float dots = smoothstep(0.05, 0.015, length(g)) * 0.1;

  vec3 col = uColA * (minor * 0.5 + dots) + mix(uColA, uColB, 0.35) * major * 0.85;
  float alpha = (minor * 0.34 + major * 0.5 + dots) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}`

/** Dawn orbs — huge soft light-blobs drifting like lanterns.
 *  Scroll: they wander to new stations and re-tint per chapter. */
export const ORBS = H + /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * asp;
  float t = uTime * 0.09;
  float pr = uProgress;

  vec3 col = vec3(0.0);
  float glow = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 c = vec2(
      0.5 + 0.44 * sin(t * (0.35 + fi * 0.14) + fi * 2.4 + pr * 0.85),
      0.5 + 0.4 * cos(t * (0.45 + fi * 0.1) + fi * 1.7 - pr * 0.55)
    ) * asp;
    c += (uMouse * asp - c) * 0.05;
    float d = length(p - c);
    float g = exp(-d * d * (5.0 + fi * 1.3)) * (0.5 + 0.5 * abs(sin(fi * 2.2 + t * 0.7)));
    col += mix(uColA, uColB, fract(fi * 0.37 + pr * 0.12)) * g;
    glow += g;
  }
  gl_FragColor = vec4(col * 0.55, clamp(glow * 0.5, 0.0, 0.75) * uOpacity);
}`

/** Halftone tide — an editorial print-dot field swelling in waves.
 *  Scroll: the tide re-flows and the ink re-tints per chapter. */
export const HALFTONE = H + /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * asp;
  p += (uMouse - 0.5) * 0.06;
  float t = uTime * 0.05;

  float field = fbm(p * 2.3 + vec2(t, -t * 0.6) + vec2(0.0, uProgress * 0.65));

  vec2 gv = fract(p * 20.0) - 0.5;
  float r = 0.44 * smoothstep(0.28, 0.86, field);
  float d = length(gv);
  float aa = fwidth(d) * 1.6;
  float dot1 = 1.0 - smoothstep(r - aa, r + aa, d);

  // sparse offset layer for depth
  vec2 gv2 = fract(p * 10.0 + 0.5) - 0.5;
  float field2 = fbm(p * 1.6 - vec2(t * 0.7, uProgress * 0.3) + 5.0);
  float r2 = 0.34 * smoothstep(0.45, 0.95, field2);
  float dot2 = 1.0 - smoothstep(r2 - aa, r2 + aa, length(gv2));

  vec3 col = mix(uColB, uColA, field) * dot1 * 0.85 + uColB * dot2 * 0.3;
  float alpha = (dot1 * (0.16 + 0.42 * field) + dot2 * 0.12) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}`
