import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'shorts-factory-api',
  })
})

export default app
