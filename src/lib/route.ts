import { dev } from '$app/env'

// Shape routes based on path
export function route(path: string): string {
  return dev ? '/api' + path : 'https://api.csplan.co' + path
}
