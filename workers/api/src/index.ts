import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { taskRoutes } from './routes/tasks'
import { fileRoutes } from './routes/files'
import { kbRoutes } from './routes/kb'
import { profileRoutes } from './routes/profile'
import { authMiddleware } from './middleware/auth'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://qieos.pages.dev'],
  credentials: true
}))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes (no middleware needed)
app.route('/auth', authRoutes)

// Protected routes (require auth middleware)
app.use('/tasks', authMiddleware)
app.use('/files', authMiddleware)
app.use('/kb', authMiddleware)
app.use('/me', authMiddleware)

// Route handlers
app.route('/tasks', taskRoutes)
app.route('/files', fileRoutes)
app.route('/kb', kbRoutes)
app.route('/me', profileRoutes)

export default app
