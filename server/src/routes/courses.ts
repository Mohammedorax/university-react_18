import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth.js'

const listQuery = z.object({
  query: z.string().optional().default(''),
  department: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

const upsertSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  credits: z.number().int().min(1).max(12).default(3),
  maxStudents: z.number().int().positive().default(30),
  departmentId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
})

export async function coursesRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const parsed = listQuery.safeParse(req.query)
    if (!parsed.success) return reply.badRequest(parsed.error.message)
    const { query, department, page, limit } = parsed.data

    const where = {
      deletedAt: null,
      ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' as const } }, { code: { contains: query, mode: 'insensitive' as const } }] } : {}),
      ...(department !== 'all' ? { department: { name: department } } : {}),
    }

    const [items, total] = await Promise.all([
      app.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { department: true, teacher: { include: { user: true } }, _count: { select: { enrollments: true } } },
      }),
      app.prisma.course.count({ where }),
    ])

    return { items, total, page, limit }
  })

  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const course = await app.prisma.course.findUnique({
      where: { id },
      include: { department: true, teacher: { include: { user: true } } },
    })
    if (!course || course.deletedAt) return reply.notFound()
    return course
  })

  app.post('/', { preHandler: requireRole('admin', 'teacher') }, async (req, reply) => {
    const parsed = upsertSchema.safeParse(req.body)
    if (!parsed.success) return reply.badRequest(parsed.error.message)
    const course = await app.prisma.course.create({ data: parsed.data })
    return reply.code(201).send(course)
  })

  app.patch('/:id', { preHandler: requireRole('admin', 'teacher') }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const parsed = upsertSchema.partial().safeParse(req.body)
    if (!parsed.success) return reply.badRequest(parsed.error.message)
    const course = await app.prisma.course.update({ where: { id }, data: parsed.data })
    return course
  })

  app.delete('/:id', { preHandler: requireRole('admin') }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.course.update({ where: { id }, data: { deletedAt: new Date() } })
    return reply.code(204).send()
  })
}
