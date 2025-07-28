#!/usr/bin/env node

/**
 * Military Tees UK - Production Server
 * Simple server wrapper for Hostinger deployment
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true)
      
      // Handle the request with Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`🚀 Military Tees UK server running on http://${hostname}:${port}`)
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🛡️ Ready for production deployment`)
  })
})