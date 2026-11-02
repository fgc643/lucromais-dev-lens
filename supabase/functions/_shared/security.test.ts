import assert from 'node:assert/strict';
import { AD_MARKETPLACES, AI_USAGE_WINDOW_MS, RequestError, assertUsageAvailable, validateAIInput, validateShippingInput } from './input-validation.ts';
import { aiErrorResponse, requireAIUser, registerAIUsage } from './ai-security.ts';

const product = { productName: 'Fone', marketplace: 'Geral', salePrice: 100, costPrice: 30 };
function invalid(fn: () => unknown, status = 400) {
  assert.throws(fn, (error: unknown) => error instanceof RequestError && error.status === status);
}

Deno.test('productName is required, string, sanitized and capped at 120', () => {
  for (const name of [undefined, null, 10, '', '  ', '\u0000', 'x'.repeat(121)]) invalid(() => validateAIInput({ productName: name }));
  assert.equal(validateAIInput({ productName: ' \u0000Fone\u007f ' }).productName, 'Fone');
  assert.equal(validateAIInput({ productName: 'x'.repeat(120) }).productName.length, 120);
});
Deno.test('category maximum is 80', () => {
  assert.equal(validateAIInput({ ...product, category: 'x'.repeat(80) }).category.length, 80);
  invalid(() => validateAIInput({ ...product, category: 'x'.repeat(81) }));
  invalid(() => validateAIInput({ ...product, category: {} }));
});
Deno.test('features maximum is 500 and controls are stripped', () => {
  assert.equal(validateAIInput({ ...product, features: 'x'.repeat(500) }).features.length, 500);
  assert.equal(validateAIInput({ ...product, features: 'abc\u0001def' }).features, 'abcdef');
  invalid(() => validateAIInput({ ...product, features: 'x'.repeat(501) }));
});
Deno.test('only marketplace source names and Geral are accepted', async () => {
  const source = await Deno.readTextFile(new URL('../../../src/data/marketplaces.ts', import.meta.url));
  const names = Array.from(source.matchAll(/name: "([^"]+)"/g), m => m[1]);
  assert.deepEqual(AD_MARKETPLACES, [...names, 'Geral']);
  for (const marketplace of AD_MARKETPLACES) assert.equal(validateAIInput({ ...product, marketplace }, true).marketplace, marketplace);
  invalid(() => validateAIInput({ ...product, marketplace: 'unknown' }, true));
});
for (const field of ['salePrice', 'costPrice']) {
  Deno.test(`${field} finite range is 0 to 1000000 after Number conversion`, () => {
    for (const value of [0, 1_000_000, '123.45']) assert.equal(validateAIInput({ ...product, [field]: value }, true)[field as 'salePrice'], Number(value));
    for (const value of [-1, 1_000_001, Infinity, NaN, 'Infinity', 'oops', {}, null, '']) invalid(() => validateAIInput({ ...product, [field]: value }, true));
  });
}
const shipment = { weight: 1, length: 20, width: 15, height: 10, declaredValue: 0 };
Deno.test('weight greater than 0 and at most 100', () => {
  for (const weight of [0.001, 100]) assert.equal(validateShippingInput({ ...shipment, weight }).weight, weight);
  for (const weight of [0, -1, 100.01, Infinity, NaN]) invalid(() => validateShippingInput({ ...shipment, weight }));
});
for (const field of ['length', 'width', 'height']) {
  Deno.test(`${field} bounds 1 through 200`, () => {
    for (const value of [1, 200]) assert.equal(validateShippingInput({ ...shipment, [field]: value })[field as 'length'], value);
    for (const value of [0, 201, -1, Infinity, NaN, null]) invalid(() => validateShippingInput({ ...shipment, [field]: value }));
  });
}
Deno.test('declaredValue finite range 0 through 1000000', () => {
  for (const declaredValue of [0, 1_000_000]) assert.equal(validateShippingInput({ ...shipment, declaredValue }).declaredValue, declaredValue);
  for (const declaredValue of [-1, 1_000_001, NaN, Infinity]) invalid(() => validateShippingInput({ ...shipment, declaredValue }));
});
Deno.test('the twentieth recorded use blocks the next request in a 60-minute window', () => {
  assertUsageAvailable(19);
  invalid(() => assertUsageAvailable(20), 429);
  assert.equal(AI_USAGE_WINDOW_MS, 60 * 60 * 1000);
});
Deno.test('missing Authorization rejects before any network request', async () => {
  await assert.rejects(requireAIUser(new Request('http://localhost')), (error: unknown) => error instanceof RequestError && error.status === 401);
});
Deno.test('getUser rejects invalid token and accepts only verified user ID', async () => {
  const original = globalThis.fetch;
  const oldUrl = Deno.env.get('SUPABASE_URL');
  const oldKey = Deno.env.get('SUPABASE_ANON_KEY');
  Deno.env.set('SUPABASE_URL', 'https://example.test'); Deno.env.set('SUPABASE_ANON_KEY', 'test');
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(requireAIUser(new Request('http://localhost', { headers: { Authorization: 'Bearer invalid' } })), (e: unknown) => e instanceof RequestError && e.status === 401);
    globalThis.fetch = async () => new Response(JSON.stringify({ id: 'verified-user' }), { headers: { 'Content-Type': 'application/json' } });
    assert.equal(await requireAIUser(new Request('http://localhost', { headers: { Authorization: 'Bearer valid' } })), 'verified-user');
  } finally {
    globalThis.fetch = original;
    if (oldUrl === undefined) Deno.env.delete('SUPABASE_URL'); else Deno.env.set('SUPABASE_URL', oldUrl);
    if (oldKey === undefined) Deno.env.delete('SUPABASE_ANON_KEY'); else Deno.env.set('SUPABASE_ANON_KEY', oldKey);
  }
});
Deno.test('quota is shared across functions, checks user/time, and handles atomic rejection', async () => {
  const original = globalThis.fetch;
  const oldUrl = Deno.env.get('SUPABASE_URL'), oldKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  Deno.env.set('SUPABASE_URL', 'https://example.test'); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test');
  let count = 19, insertCount = 0, atomicRejection = false;
  try {
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input));
      if (init?.method === 'HEAD') {
        assert.equal(url.searchParams.get('user_id'), 'eq.verified-user');
        assert.equal(url.searchParams.has('function_name'), false);
        const cutoff = Date.parse((url.searchParams.get('created_at') ?? '').replace('gte.', ''));
        assert.ok(Math.abs(Date.now() - cutoff - 60 * 60 * 1000) < 2000);
        return new Response(null, { headers: { 'Content-Range': `0-0/${count}` } });
      }
      insertCount++;
      const body = JSON.parse(String(init?.body));
      assert.equal(body.user_id, 'verified-user');
      assert.ok(['analyze-product', 'generate-ad'].includes(body.function_name));
      if (atomicRejection) return new Response(JSON.stringify({ code: 'P0001', message: 'ai_usage_limit_reached' }), { status: 400 });
      count++;
      return new Response(null, { status: 201 });
    };
    await registerAIUsage('verified-user', 'analyze-product');
    await assert.rejects(registerAIUsage('verified-user', 'generate-ad'), (e: unknown) => e instanceof RequestError && e.status === 429);
    assert.equal(insertCount, 1);
    count = 19; atomicRejection = true;
    await assert.rejects(registerAIUsage('verified-user', 'generate-ad'), (e: unknown) => e instanceof RequestError && e.status === 429);
  } finally {
    globalThis.fetch = original;
    if (oldUrl === undefined) Deno.env.delete('SUPABASE_URL'); else Deno.env.set('SUPABASE_URL', oldUrl);
    if (oldKey === undefined) Deno.env.delete('SUPABASE_SERVICE_ROLE_KEY'); else Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', oldKey);
  }
});
Deno.test('internal failures never return private error detail', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const response = aiErrorResponse(new Error('private internal detail'));
    assert.equal(response.status, 500);
    assert.equal((await response.text()).includes('private internal detail'), false);
  } finally { console.error = original; }
});