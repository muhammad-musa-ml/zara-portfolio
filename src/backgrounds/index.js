// Background registry — six switchable skies over one scroll voyage.
import { createScene } from '../scene/scene.js'
import { createShaderBg } from './fullscreen.js'
import { AURORA, SILK, CONTOURS, ORBS, HALFTONE } from './frags.js'

export const BG_OPTIONS = [
  { id: 'particles', label: 'Constellations', note: 'morphing particle formations (bokeh tune)' },
  { id: 'aurora', label: 'Aurora curtains', note: 'ribbons of light rippling with the chapters' },
  { id: 'silk', label: 'Liquid silk', note: 'slow-flowing folds of tinted cloth' },
  { id: 'contours', label: 'Contour lines', note: 'a living topographic blueprint' },
  { id: 'orbs', label: 'Dawn orbs', note: 'huge soft lanterns drifting between stations' },
  { id: 'halftone', label: 'Halftone tide', note: 'editorial print-dots swelling in waves' }
]

const FRAGS = { aurora: AURORA, silk: SILK, contours: CONTOURS, orbs: ORBS, halftone: HALFTONE }

export function createBackground(id, canvas, caps) {
  if (id === 'particles' || !FRAGS[id]) return createScene(canvas, caps)
  return createShaderBg(canvas, FRAGS[id], caps)
}
