import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { env } from '../env.js'
import { requireAuth } from '../middleware/auth.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return reply.badRequest(parsed.error.message)

    const { email, password } = parsed.data
    const user = await app.prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) return reply.unauthorized('Invalid credentials')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return reply.unauthorized('Invalid credentials')

    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = app.jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }
  })

  app.get('/me', { preHandler: requireAuth }, async (req) => {
    const u = await app.prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })
    return { user: u }
  })
}
