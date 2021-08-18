import { dev } from '$app/env'

// Shape routes based on path
export function route(path: string): string {
  return dev ? 'http://localhost:3030/api' + path : 'https://api.csplan.co' + path
}
