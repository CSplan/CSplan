/**
 * @typedef {Object} CanvasInfo
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} ctx
 * @property {DOMRect} rect
 * @property {number} h - Canvas height
 * @property {number} w - Canvas width
 */

/**
 * @typedef {Object} SliderCanvasInfo
 * @extends {CanvasInfo}
 * @property {number} r - Cursor/border radius
 */

// Basic constructor for repetitive tasks such as setting up canvas elements and dimensions
/** @type {CanvasInfo} */
export class Canvas {
  /**
   * @param {HTMLCanvasElement} canvasEl 
   */
  constructor(canvasEl) {
    this.canvas = canvasEl
    this.ctx = this.canvas.getContext('2d')
    this.getDimensions()
  }
  getDimensions() {
    this.rect = this.canvas.getBoundingClientRect()
    // Canvas width and height has to be manually updated
    this.canvas.height = this.rect.height
    this.canvas.width = this.rect.width
    // Update height/width shorthand
    this.h = this.rect.height
    this.w = this.rect.width
  }
}

export class PlaneCanvas extends Canvas {
  constructor(canvasEl) {
    super(canvasEl)
  }
  drawCursor(posX = 0, posY = 0, r = 0) {
    const { ctx } = this
    ctx.beginPath()
    ctx.arc(posX, posY, r, 0, 2*Math.PI)
    ctx.arc(posX, posY, r/2, 0, 2*Math.PI, true)
    ctx.fill()
  }
}

/** @type {SliderCanvasInfo} */
export class SliderCanvas extends Canvas {
  constructor(canvasEl) {
    super(canvasEl)
    this.r = this.w/2
  }
  drawSlider() {
    const { ctx, h, w, r } = this
    ctx.beginPath()
    // Draw inner rectangle
    ctx.rect(0, r, w, h - 2*r)
    // Followed by two pairs of arcs to make rounded corners
    // Upper arcs
    ctx.moveTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
    ctx.arcTo(w, 0, w, r, r)
    // Bottom arcs
    ctx.moveTo(0, h - r)
    ctx.arcTo(0, h, r, h, r)
    ctx.arcTo(w, h, w, h - r, r)
    ctx.fill()
  }
  drawCursor(posY = 0) {
    const { ctx, r } = this
    ctx.beginPath()
    // Draw outer circle (white)
    ctx.arc(r, posY, r, 0, 2*Math.PI)
    // Draw inner circle (transparent)
    ctx.arc(r, posY, r/2, 0, 2*Math.PI, true)
    ctx.fill()
  }
}