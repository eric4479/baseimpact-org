// Cloudflare Pages Function: /api/verify
// Handles crowdsourced verification votes

interface Env {
  baseimpact_verify: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as { resource_id: string; vote: string };
    const { resource_id, vote } = body;

    if (!resource_id || !['yes', 'no'].includes(vote)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.baseimpact_verify
      .prepare('INSERT INTO verifications (resource_id, vote) VALUES (?, ?)')
      .bind(resource_id, vote)
      .run();

    // Get counts
    const result = await env.baseimpact_verify
      .prepare('SELECT vote, COUNT(*) as count FROM verifications WHERE resource_id = ? GROUP BY vote')
      .bind(resource_id)
      .all();

    const counts = { yes: 0, no: 0 };
    for (const row of result.results) {
      counts[row.vote as 'yes' | 'no'] = row.count as number;
    }

    return new Response(JSON.stringify({ ok: true, counts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const resourceId = url.searchParams.get('resource_id');

  if (!resourceId) {
    return new Response(JSON.stringify({ error: 'Missing resource_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await env.baseimpact_verify
    .prepare('SELECT vote, COUNT(*) as count FROM verifications WHERE resource_id = ? GROUP BY vote')
    .bind(resourceId)
    .all();

  const counts = { yes: 0, no: 0 };
  for (const row of result.results) {
    counts[row.vote as 'yes' | 'no'] = row.count as number;
  }

  return new Response(JSON.stringify(counts), {
    headers: { 'Content-Type': 'application/json' },
  });
};