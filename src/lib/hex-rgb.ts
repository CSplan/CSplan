type HexString = `#${number}${number}${number}` | `#${number}${number}${number}${number}${number}${number}`

/** Convert a hex value in the form of #FFF or #FFFFFF to 3 0-255 rgb values */
export function hexToRGB(hex: HexString): Uint8Array {
  const hexDigits = hex.substring(1).split('')
  const rgb = new Uint8Array(3)
  const hexShorthand: boolean = hexDigits.length === 3

  for (let i = 0; i < hexDigits.length; i++) {
    if (hexShorthand) {
      rgb[i] = parseInt(hexDigits[i].repeat(2), 16)
    } else {
      rgb[i] = parseInt(hexDigits[i] + hexDigits[++i], 16)
    }
  }
  return rgb
}