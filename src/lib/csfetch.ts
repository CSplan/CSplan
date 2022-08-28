import { dev } from '$app/env'
import { storage } from '$db/storage'

// Domains that credentials are allowed to be sent to (over HTTPS only)
const credWhitelistedDomains = ['api.csplan.co', 'api.staging.csplan.co']
const safeMethods: Record<string, boolean> = {
  GET: true,
  HEAD: true,
  OPTIONS: true
}

type ReqInit = RequestInit & { 
  headers?: Record<string, string>
}

function includeCredentials(init: ReqInit): ReqInit {
  init.credentials = 'include'
  if (!safeMethods[init.method || 'GET']) {
    const csrfToken = storage.getCSRFtoken()
    if (csrfToken != null) {
      init.headers!['CSRF-Token'] = storage.getCSRFtoken()
    }
  }
  return init
}

export function csfetch(input: RequestInfo, init?: ReqInit): Promise<Response> {
  if (init === undefined) {
    init = {}
  }
  if (init.headers === undefined) {
    init.headers = {}
  }

  // Include credentials for requests to whitelisted domains
  for (const domain of credWhitelistedDomains) {
    const url = input.toString()
    if (url.startsWith(`https://${domain}`) || url.startsWith(`wss://${domain}`)) {
      init = includeCredentials(init)
      break
    }
  }
  if (dev) {
    init = includeCredentials(init)
  }

  // Requests have a default content type of application/json
  if (init.body != null && init.headers!['Content-Type'] === undefined) {
    init.headers!['Content-Type'] = 'application/json'
  }

  return fetch(input, init)
}