const dev = process.env.NODE_ENV === 'development'

/**
 * Shape API route URLs based on environment
 * @param {string} path 
 */
export function route(path) {
  return dev ? 'http://localhost:3030/api' + path : 'https://api.csplan.co' + path
}

export default route
