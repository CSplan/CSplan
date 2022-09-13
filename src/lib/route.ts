import { dev } from '$app/environment'
const staging = import.meta.env.MODE === 'staging'

// Shape routes based on path
export function route(path: string, protocol = 'https'): string {
  if (dev) {
    return `${protocol}://${__DEV_HOSTNAME__}:3030/api` + path
  } else if (staging) {
    return `${protocol}://api.staging.csplan.dev` + path 
  } else {
    return `${protocol}://api.csplan.co` + path
  }
}
