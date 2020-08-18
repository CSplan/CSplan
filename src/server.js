import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'

const router = polka() // Initialize the router realy so dynamic middleware may be loaded
const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

// Enable the http proxy if runnning in development
if (dev) {
  const { createProxyMiddleware } = require('http-proxy-middleware')
  const proxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    pathRewrite: {
      '/api': ''
    }
  })
  router.use('/api', proxy) // Proxy request that starts with /api
}
router
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .listen(PORT, err => {
    if (err) console.error(err)
  })
