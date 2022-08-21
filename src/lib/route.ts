import { dev } from '$app/env'

// Shape routes based on path
export function route(path: string, protocol = 'https'): string {
  if (dev) {
    return `${protocol}://${__DEV_HOSTNAME__}:3030/api` + path
  } else {
    return `${protocol}://api.csplan.co` + path
  }
}
