const byteSizeRegex = /^([0-9]+(?:\.[0-9]+)?)([GMKB])B?$/i

enum Scales {
  B = 1,
  K = 1024,
  M = 1024 * 1024,
  G = 1024 * 1024 * 1024
}

export function parseByteSize(raw: string): number {
  const match = raw.match(byteSizeRegex)
  if (match === null) {
    throw new Error('invalid byte size')
  }

  const value = parseFloat(match[1]) // The input value (1.5G -> 1.5)
  const suffix = match[2].toUpperCase()
  let scale = 1 // The scale in B, KB, MB, or GB

  if (suffix in Scales) {
    scale = Scales[suffix as keyof typeof Scales]
  } else {
    throw new Error('unexpected byte unit match from regex - this is a bug, not an input error, regex used: ' + byteSizeRegex.source)
  }

  return Math.round(scale * value)
}

function roundToThousandths(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function formatByteSize(size: number): string {
  if (size >= Scales.G) {
    return roundToThousandths(size / Scales.G) + 'GB'
  }
  if (size >= Scales.M) {
    return roundToThousandths(size / Scales.M) + 'MB'
  }
  if (size >= Scales.K) {
    return roundToThousandths(size / Scales.K) + 'KB'
  }
  return roundToThousandths(size) + 'B'
}
