export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const mode = url.searchParams.get('mode');
  const adminPass = request.headers.get('x-admin-pass');

  if (mode === 'admin') {
    if (!env.ADMIN_PASS || adminPass !== env.ADMIN_PASS) {
      return Response.json({ error: 'كلمة السر غير صحيحة' }, { status: 401 });
    }
    const { results } = await env.DB.prepare(
      'SELECT id, slug, name, body, approved, created_at FROM comments ORDER BY id DESC'
    ).all();
    return Response.json(results);
  }

  if (!slug) return Response.json([]);
  const { results } = await env.DB.prepare(
    'SELECT id, name, body, created_at FROM comments WHERE slug = ? AND approved = 1 ORDER BY id DESC'
  ).bind(slug).all();

  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  try {
    const { slug, name, body } = await request.json();
    const cleanName = (name || '').trim();
    const cleanBody = (body || '').trim();

    if (!slug || !cleanName || !cleanBody) {
      return Response.json({ error: 'يرجى كتابة الاسم والتعليق.' }, { status: 400 });
    }
    if (cleanName.length > 60 || cleanBody.length > 2000) {
      return Response.json({ error: 'النص طويل جداً.' }, { status: 400 });
    }

    await env.DB.prepare(
      'INSERT INTO comments (slug, name, body, approved) VALUES (?, ?, ?, 0)'
    ).bind(slug, cleanName, cleanBody).run();

    return Response.json({
      ok: true,
      message: 'تم استلام تعليقك بنجاح، وسيظهر بعد مراجعته.'
    }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'حدث خطأ أثناء الإرسال.' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env }) {
  const adminPass = request.headers.get('x-admin-pass');
  if (!env.ADMIN_PASS || adminPass !== env.ADMIN_PASS) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }
  const { id } = await request.json();
  await env.DB.prepare('UPDATE comments SET approved = 1 WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const adminPass = request.headers.get('x-admin-pass');
  if (!env.ADMIN_PASS || adminPass !== env.ADMIN_PASS) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }
  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}
