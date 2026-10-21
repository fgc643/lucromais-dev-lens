export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const AI_USAGE_LIMIT = 20;
export const AI_USAGE_WINDOW_MS = 60 * 60 * 1000;
export const LOGIN_MESSAGE = 'Faça login para usar a IA';
export const LIMIT_MESSAGE = 'Limite de usos por hora atingido. Tente mais tarde.';

export const AD_MARKETPLACES = [
  'Mercado Livre', 'Amazon', 'Shopee', 'Magazine Luiza', 'Americanas',
  'Casas Bahia', 'iFood', 'Rappi', 'Hotmart', 'Eduzz', 'Monetizze', 'Kiwify',
  'Etsy', 'OLX', 'Enjoei', 'Elo7', 'AliExpress (Vendedor BR)',
  'Shein (Marketplace)', 'TikTok Shop', 'Geral',
];

export function inputObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestError(400, 'Envie um objeto JSON válido.');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string') throw new RequestError(400, `${field} deve ser texto.`);
  const clean = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim();
  if (required && !clean) throw new RequestError(400, `${field} é obrigatório.`);
  if (clean.length > max) throw new RequestError(400, `${field} deve ter no máximo ${max} caracteres.`);
  return clean;
}

export function boundedNumber(value: unknown, field: string, min: number, max: number, exclusiveMin = false): number {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new RequestError(400, `${field} deve ser um número válido.`);
  }
  const numeric = Number(value);
  if ((typeof value === 'string' && !value.trim()) || !Number.isFinite(numeric) ||
      (exclusiveMin ? numeric <= min : numeric < min) || numeric > max) {
    throw new RequestError(400, `${field} deve ser ${exclusiveMin ? 'maior que' : 'entre'} ${min} e ${exclusiveMin ? 'no máximo ' : ''}${max}.`);
  }
  return numeric;
}

export function validateAIInput(value: unknown, ad = false) {
  const body = inputObject(value);
  const productName = text(body.productName, 'Nome do produto', 120, true);
  const category = text(body.category, 'Categoria', 80);
  const features = text(body.features, 'Características', 500);
  // Optional prices in product analysis are still validated when supplied.
  const salePrice = boundedNumber(body.salePrice === undefined ? 0 : body.salePrice, 'Preço de venda', 0, 1_000_000);
  const costPrice = boundedNumber(body.costPrice === undefined ? 0 : body.costPrice, 'Preço de custo', 0, 1_000_000);
  const marketplace = ad ? text(body.marketplace, 'Marketplace', 80, true) : '';
  if (ad && !AD_MARKETPLACES.includes(marketplace)) throw new RequestError(400, 'Marketplace inválido. Selecione um marketplace disponível ou Geral.');
  return { productName, category, features, salePrice, costPrice, marketplace };
}

export function validateShippingInput(value: unknown) {
  const body = inputObject(value);
  return {
    weight: boundedNumber(body.weight ?? 0, 'Peso', 0, 100, true),
    length: boundedNumber(body.length === undefined ? 20 : body.length, 'Comprimento', 1, 200),
    width: boundedNumber(body.width === undefined ? 15 : body.width, 'Largura', 1, 200),
    height: boundedNumber(body.height === undefined ? 10 : body.height, 'Altura', 1, 200),
    declaredValue: boundedNumber(body.declaredValue === undefined ? 0 : body.declaredValue, 'Valor declarado', 0, 1_000_000),
  };
}

export function assertUsageAvailable(count: number) {
  if (count >= AI_USAGE_LIMIT) throw new RequestError(429, LIMIT_MESSAGE);
}