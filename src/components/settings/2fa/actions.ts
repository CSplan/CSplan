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

export function totpQR(uri: string): string {
  const qr = qrcodegen.QrCode.encodeText(uri, qrcodegen.QrCode.Ecc.LOW)
  console.log((qr.size - 17) / 4)
  console.log(qr.size)
  return ''
}