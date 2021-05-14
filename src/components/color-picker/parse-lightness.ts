export function parseLightness(rgb: Uint8Array): number {
  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]
  
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 510
}