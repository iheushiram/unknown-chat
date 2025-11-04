import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './routes/auth'
import { chat } from './routes/chat'

type Bindings = {
  DB: D1Database
  SESSIONS: KVNamespace
}

interface Variables {}

const app = new Hono<{
  Bindings: Bindings
  Variables: Variables
}>()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://127.0.0.1:3000'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'unknown-chat backend is runnning',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
})

app.get('/api/info', (c) => {
  return c.json({
    name: 'unknown-chat-api',
    version: '0.1.0',
    description: 'Anonymous encrypted chat API',
    endpoint: {
      health: '/health',
      info: '/api/info',
    },
  })
})

app.route('/api/auth', auth)
app.route('/api/chat', chat)

export default app
