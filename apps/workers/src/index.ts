import { Hono } from 'hono';
import { Bindings } from './bindings';
import { ShortsRepository } from './services/ShortsRepository';
import { ShortsCollector } from './services/ShortsCollector';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'shorts-factory-api',
  });
});

app.get('/api/shorts/trending', async (c) => {
  const country = c.req.query('country') || 'KR';
  const limit = parseInt(c.req.query('limit') || '50');

  const repo = new ShortsRepository(c.env.DB);
  const trends = await repo.getTrending(country, limit);
  return c.json({ results: trends });
});

app.get('/api/shorts/:id', async (c) => {
  const id = c.req.param('id');
  const repo = new ShortsRepository(c.env.DB);
  const short = await repo.getShortById(id);

  if (!short) {
    return c.json({ error: 'Short not found' }, 404);
  }
  return c.json(short);
});

app.get('/api/admin/quota', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const result = await c.env.DB.prepare('SELECT quota_used FROM daily_metrics WHERE date = ?').bind(today).first('quota_used');
    return c.json({ date: today, quota_used: result || 0 });
  } catch (e) {
    return c.json({ error: 'Failed to fetch quota', details: String(e) }, 500);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    const collector = new ShortsCollector(env);
    ctx.waitUntil(collector.run());
  }
}
