// Cypress configuration in CommonJS to avoid ESM issues
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const http = require('http')
      const https = require('https')
      on('task', {
        probeUrl(url) {
          return new Promise((resolve) => {
            try {
              const client = url.startsWith('https') ? https : http
              const req = client.request(url, { method: 'GET' }, () => resolve(true))
              req.on('error', () => resolve(false))
              req.end()
            } catch {
              resolve(false)
            }
          })
        },
      })
      return config
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{ts,js}',
    video: false,
    screenshotOnRunFailure: true,
    retries: 1,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    env: {
      API_BASE: process.env.API_BASE || 'http://localhost:5090/api',
    },
  },
})
