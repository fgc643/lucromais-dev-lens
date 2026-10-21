import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { AI_USAGE_WINDOW_MS, assertUsageAvailable, LOGIN_MESSAGE, LIMIT_MESSAGE, RequestError } from './input-validation.ts';

export { corsHeaders };

export async function requireAIUser(req: Request): Promise<string> {
  const authorization = req.headers.get('Authorization');
  if (!authorization) throw new RequestError(401, LOGIN_MESSAGE);
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) throw new Error('Auth configuration unavailable');
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new RequestError(401, LOGIN_MESSAGE);
  return data.user.id;
}

export async function registerAIUsage(userId: string, functionName: 'analyze-product' | 'generate-ad') {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('Usage configuration unavailable');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { count, error } = await admin.from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - AI_USAGE_WINDOW_MS).toISOString());
  if (error || count === null) throw error ?? new Error('Usage count unavailable');
  assertUsageAvailable(count);
  const { error: insertError } = await admin.from('ai_usage').insert({ user_id: userId, function_name: functionName });
  if (insertError?.code === 'P0001' && insertError.message.includes('ai_usage_limit_reached')) {
    throw new RequestError(429, LIMIT_MESSAGE);
  }
  if (insertError) throw insertError;
}

export async function readAIJson(req: Request): Promise<unknown> {
  try { return await req.json(); }
  catch { throw new RequestError(400, 'Envie um JSON válido.'); }
}

export function aiErrorResponse(error: unknown): Response {
  if (!(error instanceof RequestError)) console.error('AI internal failure:', error);
  return new Response(JSON.stringify({ error: error instanceof RequestError ? error.message : 'Não foi possível concluir a solicitação de IA. Tente novamente mais tarde.' }), {
    status: error instanceof RequestError ? error.status : 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}