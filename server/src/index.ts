import express from 'express'
import { createServer } from 'http'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'
import { serveStatic } from './static'
import stripeRoutes from './routes/stripe'
import blogRoutes from './routes/blog'
import seoRoutes from './routes/seo'
import profileRoutes from './routes/profile'
import roadmapRoutes from './routes/roadmap'
import dashboardRoutes from './routes/dashboard'
import onboardingRoutes from './routes/onboarding'
import contactRoutes from './routes/contact'
import checkinRoutes from './routes/checkin'
import goalsRoutes from './routes/goals'
import milestonesRoutes from './routes/milestones'
import simulatorRoutes from './routes/simulator'
import disputesRoutes from './routes/disputes'
import documentsRoutes from './routes/documents'
import educationRoutes from './routes/education'
import settingsRoutes from './routes/settings'
import exportRoutes from './routes/export'
import accountRoutes from './routes/account'
import { seedBlogPosts } from './lib/seed-blog'
import { seedEducation } from './lib/seed-education'
import { startCron } from './lib/cron'

const app = express()
const httpServer = createServer(app)

app.all('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes as unknown as express.RequestHandler)

app.use(express.json())

const authHandler = toNodeHandler(auth)
app.all('/api/auth/*', (req, res, next) => {
  const start = Date.now()
  const chunks: Buffer[] = []
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)
  res.write = (chunk: any) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    return originalWrite(chunk)
  }
  res.end = (chunk?: any) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    const body = Buffer.concat(chunks).toString('utf-8')
    const duration = Date.now() - start
    console.log(`[Auth] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)${body ? ` body: ${body.slice(0, 300)}` : ''}`)
    return originalEnd(chunk)
  }
  authHandler(req, res)
})

app.use(stripeRoutes)
app.use(blogRoutes)
app.use(seoRoutes)
app.use(profileRoutes)
app.use(roadmapRoutes)
app.use(dashboardRoutes)
app.use(onboardingRoutes)
app.use(contactRoutes)
app.use(checkinRoutes)
app.use(goalsRoutes)
app.use(milestonesRoutes)
app.use(simulatorRoutes)
app.use(disputesRoutes)
app.use(documentsRoutes)
app.use(educationRoutes)
app.use(settingsRoutes)
app.use(exportRoutes)
app.use(accountRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

if (env.NODE_ENV === 'production') {
  serveStatic(app)
} else {
  const { setupVite } = await import('./vite')
  await setupVite(httpServer, app)
}

httpServer.listen(env.PORT, () => {
  console.log(`Listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`)
  try {
    seedBlogPosts()
  } catch (error) {
    console.error('Failed to seed blog posts:', error)
  }
  try {
    seedEducation()
  } catch (error) {
    console.error('Failed to seed education:', error)
  }
  if (env.NODE_ENV === 'production') {
    startCron()
  }
})