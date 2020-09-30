import sirv from 'sirv'
import polka from 'polka'
import spdy from 'spdy'
import * as sapper from '@sapper/server'
import fs from 'fs'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

// Initialize spdy server and router
const server = spdy.createServer({
  cert: fs.readFileSync(`${process.env.CERTSDIR}/CSplan.crt`),
  key: fs.readFileSync(`${process.env.CERTSDIR}/CSplan.key`),
  spdy: {
    protocols: ['h2']
  }
})
const router = polka({ server })

// Enable the http proxy if runnning in development
if (dev) {
  const { createProxyMiddleware } = require('http-proxy-middleware')
  const proxy = createProxyMiddleware('/api', {
    target: 'https://localhost:3000',
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

