import sirv from 'sirv'
import polka from 'polka'
import * as sapper from '@sapper/server'

const { NODE_ENV } = process.env
const PORT = '3030'
const dev = NODE_ENV === 'development'

const router = polka()

// Enable the http proxy if runnning in development
if (dev) {
  const { createProxyMiddleware } = require('http-proxy-middleware')
  const proxy = createProxyMiddleware('/api', {
    target: 'http://localhost:3000',
    pathRewrite: {
      '/api': ''
    },
    secure: false // Allow self signed certificates in dev
  })
  router
    .use(proxy) // Proxy request that starts with /api
    .use(sirv('static', { dev })) // Only serve static files in dev (nginx handles this in prod)
}
router
  .use(
    sapper.middleware()
  ).listen(PORT, (err) => {
    if (err) {
      console.error(err)
    }
  })

