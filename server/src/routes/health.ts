import type { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ status: 'ok', time: new Date().toISOString() }))

  app.get('/db', async () => {
    await app.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', db: 'postgres' }
  })
}
