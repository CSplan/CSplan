import { storage } from '$db/storage'

// Domains that credentials are allowed to be sent to (over HTTPS only)
const credWhitelistedDomains = ['api.csplan.co']
const safeMethods: Record<string, boolean> = {
  GET: true,
  HEAD: true,
  OPTIONS: true
}

export function csfetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  if (init === undefined) {
    init = {}
  }
  if (init.headers === undefined) {
    init.headers = {}
  }
  const headers = init.headers as Record<string, string>

  // Include credentials for requests to whitelisted domains
  for (const domain of credWhitelistedDomains) {
    if (input.toString().startsWith(`https://${domain}`)) {
      init.credentials = 'include'
      if (!safeMethods[init.method || 'GET']) {
        headers['CSRF-Token'] = storage.getCSRFtoken()
      }
      break
    }
  }

  // Requests have a default content type of application/json
  if (init.body != null && headers['Content-Type'] === undefined) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(input, init)
}