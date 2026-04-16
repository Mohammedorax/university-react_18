import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth.js'

const listQuery = z.object({
  query: z.string().optional().default(''),
  department: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export async function studentsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const parsed = listQuery.safeParse(req.query)
    if (!parsed.success) return reply.badRequest(parsed.error.message)
    const { query, department, page, limit } = parsed.data

    const where = {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { universityId: { contains: query, mode: 'insensitive' as const } },
              { user: { name: { contains: query, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
      ...(department !== 'all' ? { department: { name: department } } : {}),
    }

    const [items, total] = await Promise.all([
      app.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true, department: true },
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.student.count({ where }),
    ])

    return { items, total, page, limit }
  })

  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const s = await app.prisma.student.findUnique({
      where: { id },
      include: { user: true, department: true, enrollments: { include: { course: true } } },
    })
    if (!s || s.deletedAt) return reply.notFound()
    return s
  })

  app.delete('/:id', { preHandler: requireRole('admin') }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.student.update({ where: { id }, data: { deletedAt: new Date() } })
    return reply.code(204).send()
  })
}
