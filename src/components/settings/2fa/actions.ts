import { HTTPerror, route } from '$lib'
import qrcodegen from '$lib/qrcodegen'

// Enable TOTP and return the 
export async function enableTOTP(): Promise<TOTPinfo> {
  const res = await fetch(route('/totp?action=enable'), {
    method: 'POST',
    headers: {
      'CSRF-Token': localStorage.getItem('CSRF-Token')!
    }
  })
  if (res.status !== 201) {
    throw new Error(await HTTPerror(res, 'Failed to enable TOTP authentication'))
  }
  return res.json()
}

export async function disableTOTP(): Promise<void> {
  const res = await fetch(route('/totp?action=disable'), {
    method: 'POST',
    headers: {
      'CSRF-Token': localStorage.getItem('CSRF-Token')!
    }
  })
  if (res.status !== 204) {
    throw new Error(await HTTPerror(res, 'Failed to disable TOTP authentication'))
  }
}

export function totpURI(issuer: string, displayName: string, secret: string): string {
  return `otpauth://totp/${issuer}:${displayName}?secret=${secret}&issuer=${issuer}`
}

export function totpQR(uri: string): SVGSVGElement {
  const qr = qrcodegen.QrCode.encodeText(uri, qrcodegen.QrCode.Ecc.LOW)
  return qr2svg(qr, 0, 'white', 'black')
}

/**
 * @copyright Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 * 
 * Modified version of Nayuki's toSvgString function, returns an actual SVG element
 */
function qr2svg(qr: qrcodegen.QrCode, border: number, lightColor: string, darkColor: string): SVGSVGElement {
  if (border < 0) {
    throw 'Border must be non-negative'
  }
  const parts: string[] = []
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y))
        parts.push(`M${x + border},${y + border}h1v1h-1z`)
    }
  }


  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${qr.size + border * 2} ${qr.size + border * 2}`)
  svg.setAttribute('stroke', 'none')
  const rect = document.createElementNS(svgNS, 'rect')
  rect.setAttribute('width', '100%')
  rect.setAttribute('height', '100%')
  rect.setAttribute('fill', lightColor)
  svg.appendChild(rect)
  const path = document.createElementNS(svgNS, 'path')
  path.setAttribute('d', parts.join(' '))
  path.setAttribute('fill', darkColor)
  svg.appendChild(path)
  return svg
}