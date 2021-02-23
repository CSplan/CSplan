// Basic constructor for repetitive tasks such as setting up canvas elements and dimensions
/** @type {CanvasInfo} */
export class Canvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  // Rectangle, height and width (assigned during getDimension, value assertion is needed because typescript doesn't understand value assignment in methods called from the constructor)
  rect!: DOMRect
  h!: number
  w!: number

  /**
   * @param {HTMLCanvasElement} canvasEl 
   */
  constructor(canvasEl: HTMLCanvasElement) {
    this.canvas = canvasEl
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Invalid or undefined canvas element')
    }
    this.ctx = ctx

    // Calculate height and width
    this.getDimensions()
  }

  /**
   * Update the canvas height and width
   */
  getDimensions(): void {
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
  constructor(canvasEl: HTMLCanvasElement) {
    super(canvasEl)
  }
  drawCursor(posX = 0, posY = 0, r = 0): void {
    const { ctx } = this
    ctx.beginPath()
    ctx.arc(posX, posY, r, 0, 2*Math.PI)
    ctx.arc(posX, posY, r/2, 0, 2*Math.PI, true)
    ctx.fill()
  }
}

export class SliderCanvas extends Canvas {
  sideways: boolean
  // Radius for circular slider
  r: number

  constructor(canvasEl: HTMLCanvasElement, sideways = false) {
    super(canvasEl)
    this.sideways = sideways
    this.r = sideways ? this.h/2 : this.w/2
  }
  drawSlider(): void {
    const { ctx, h, w, r } = this
    ctx.beginPath()
    // Draw inner rectangle followed by two pairs of arcs to make rounded corners
    if (this.sideways) {
      ctx.rect(r, 0, w - 2*r, h)
      // Left arcs
      ctx.moveTo(r, h)
      ctx.arcTo(0, h, 0, h/2, r)
      ctx.arcTo(0, 0, r, 0, r)
      // Right arcs
      ctx.moveTo(w - r, 0)
      ctx.arcTo(w, 0, w, h/2, r)
      ctx.arcTo(w, h, w - r, h, r)
    } else {
      ctx.rect(0, r, w, h - 2*r)
      // Upper arcs
      ctx.moveTo(0, r)
      ctx.arcTo(0, 0, r, 0, r)
      ctx.arcTo(w, 0, w, r, r)
      // Bottom arcs
      ctx.moveTo(0, h - r)
      ctx.arcTo(0, h, r, h, r)
      ctx.arcTo(w, h, w, h - r, r)
    }
    ctx.fill()
  }
  drawCursor(pos = 0): void {
    const { ctx, r } = this
    ctx.beginPath()
    if (this.sideways) {
      ctx.arc(pos, r, r, 0, 2*Math.PI)
      ctx.arc(pos, r, r/2, 0, 2*Math.PI, true)
    } else {
      // Draw outer circle (white)
      ctx.arc(r, pos, r, 0, 2*Math.PI)
      // Draw inner circle (transparent)
      ctx.arc(r, pos, r/2, 0, 2*Math.PI, true)
    }
    ctx.fill()
  }
}