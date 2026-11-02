import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return json({ error: 'Faça login como administrador' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await userClient.auth.getUser();
    if (authError || !auth.user) return json({ error: 'Faça login como administrador' }, 401);

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: role } = await admin.from('user_roles').select('id')
      .eq('user_id', auth.user.id).eq('role', 'admin').maybeSingle();
    if (!role) return json({ error: 'Acesso restrito a administradores' }, 403);

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const action = body?.action;

    if (action === 'list') {
      const { data, error } = await admin.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return json({ users: data });
    }

    const userId = body?.userId;
    if (typeof userId !== 'string' || !UUID.test(userId)) return json({ error: 'Usuário inválido' }, 400);

    const { data: profile, error: profileError } = await admin.from('profiles')
      .select('subscription_expires_at').eq('id', userId).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return json({ error: 'Usuário não encontrado' }, 404);

    let update: Record<string, unknown>;
    if (action === 'activate' || action === 'extend') {
      const now = new Date();
      const current = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
      const base = action === 'extend' && current && current > now ? current : now;
      base.setMonth(base.getMonth() + 1);
      update = { subscription_active: true, subscription_plan: 'premium', subscription_expires_at: base.toISOString() };
    } else if (action === 'deactivate') {
      update = { subscription_active: false, subscription_plan: 'free', subscription_expires_at: null };
    } else {
      return json({ error: 'Ação inválida' }, 400);
    }

    const { data, error } = await admin.from('profiles').update(update).eq('id', userId).select().single();
    if (error) throw error;
    return json({ user: data });
  } catch (error) {
    console.error('admin-subscriptions error:', error);
    return json({ error: 'Erro interno. Tente novamente.' }, 500);
  }
});
