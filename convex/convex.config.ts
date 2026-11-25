import authGithub from '@convex-dev/auth/components/github/convex.config'
import auth from '@convex-dev/auth/convex.config'
import { defineApp } from 'convex/server'
import { v } from 'convex/values'

const app = defineApp({
  env: {
    AUTH_GITHUB_ID: v.string(),
    AUTH_GITHUB_SECRET: v.string(),
  },
})
app.use(auth)
app.use(authGithub, {
  httpPrefix: '/oauth/github',
  env: {
    CLIENT_ID: app.env.AUTH_GITHUB_ID,
    CLIENT_SECRET: app.env.AUTH_GITHUB_SECRET,
  },
})

export default app
