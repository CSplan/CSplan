/**
 * Shape API route URLs based on environment
 * @param {string} path 
 */
export function route(path) {
  return 'http://localhost:3030/api' + path
}

export default route
