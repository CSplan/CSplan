const dev = process.env.NODE_ENV === 'development'

// Shape routes based on path
export function route(path: string): string {
  return dev ? 'http://localhost:3030/api' + path : 'https://api.csplan.co' + path
}
