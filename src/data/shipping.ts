// =============================================================
// TABELA DE FRETE POR FAIXA DE CEP — atualizada em Setembro/2026
// Esta é a ÚNICA fonte de verdade do frete do sistema: a tabela
// exibida na tela e o valor usado no cálculo de lucro saem daqui.
// =============================================================

export const SHIPPING_UPDATED_AT = "Setembro/2026";

export type Zone = 1 | 2 | 3 | 4 | 5;

export interface CepRange {
  /** primeiros dígitos do CEP (faixa inicial) */
  from: number;
  /** primeiros dígitos do CEP (faixa final) */
  to: number;
  uf: string;
  region: "N" | "NE" | "CO" | "SE" | "S";
  label: string;
}

/** Faixas oficiais de CEP dos Correios (8 dígitos, sem hífen). */
export const CEP_RANGES: CepRange[] = [
  { from: 1000000, to: 19999999, uf: "SP", region: "SE", label: "São Paulo" },
  { from: 20000000, to: 28999999, uf: "RJ", region: "SE", label: "Rio de Janeiro" },
  { from: 29000000, to: 29999999, uf: "ES", region: "SE", label: "Espírito Santo" },
  { from: 30000000, to: 39999999, uf: "MG", region: "SE", label: "Minas Gerais" },
  { from: 40000000, to: 48999999, uf: "BA", region: "NE", label: "Bahia" },
  { from: 49000000, to: 49999999, uf: "SE", region: "NE", label: "Sergipe" },
  { from: 50000000, to: 56999999, uf: "PE", region: "NE", label: "Pernambuco" },
  { from: 57000000, to: 57999999, uf: "AL", region: "NE", label: "Alagoas" },
  { from: 58000000, to: 58999999, uf: "PB", region: "NE", label: "Paraíba" },
  { from: 59000000, to: 59999999, uf: "RN", region: "NE", label: "Rio Grande do Norte" },
  { from: 60000000, to: 63999999, uf: "CE", region: "NE", label: "Ceará" },
  { from: 64000000, to: 64999999, uf: "PI", region: "NE", label: "Piauí" },
  { from: 65000000, to: 65999999, uf: "MA", region: "NE", label: "Maranhão" },
  { from: 66000000, to: 68899999, uf: "PA", region: "N", label: "Pará" },
  { from: 68900000, to: 68999999, uf: "AP", region: "N", label: "Amapá" },
  { from: 69000000, to: 69299999, uf: "AM", region: "N", label: "Amazonas" },
  { from: 69300000, to: 69389999, uf: "RR", region: "N", label: "Roraima" },
  { from: 69400000, to: 69899999, uf: "AM", region: "N", label: "Amazonas (interior)" },
  { from: 69900000, to: 69999999, uf: "AC", region: "N", label: "Acre" },
  { from: 70000000, to: 73699999, uf: "DF", region: "CO", label: "Distrito Federal" },
  { from: 73700000, to: 76799999, uf: "GO", region: "CO", label: "Goiás" },
  { from: 76800000, to: 76999999, uf: "RO", region: "N", label: "Rondônia" },
  { from: 77000000, to: 77999999, uf: "TO", region: "N", label: "Tocantins" },
  { from: 78000000, to: 78899999, uf: "MT", region: "CO", label: "Mato Grosso" },
  { from: 79000000, to: 79999999, uf: "MS", region: "CO", label: "Mato Grosso do Sul" },
  { from: 80000000, to: 87999999, uf: "PR", region: "S", label: "Paraná" },
  { from: 88000000, to: 89999999, uf: "SC", region: "S", label: "Santa Catarina" },
  { from: 90000000, to: 99999999, uf: "RS", region: "S", label: "Rio Grande do Sul" },
];

export const cepToNumber = (cep: string) => Number(cep.replace(/\D/g, "").padEnd(8, "0"));

export const findCepRange = (cep: string): CepRange | null => {
  const n = cepToNumber(cep);
  return CEP_RANGES.find((r) => n >= r.from && n <= r.to) ?? null;
};

export const formatCepRange = (r: CepRange) => {
  const fmt = (n: number) => String(n).padStart(8, "0").replace(/(\d{5})(\d{3})/, "$1-$2");
  return `${fmt(r.from)} a ${fmt(r.to)}`;
};

/** Matriz de zonas tarifárias: quanto maior a zona, mais caro e mais lento. */
const REGION_ZONE: Record<string, Record<string, Zone>> = {
  SE: { SE: 1, S: 2, CO: 3, NE: 4, N: 5 },
  S: { S: 1, SE: 2, CO: 3, NE: 4, N: 5 },
  CO: { CO: 1, SE: 3, S: 3, NE: 4, N: 4 },
  NE: { NE: 1, SE: 4, CO: 4, S: 5, N: 4 },
  N: { N: 1, NE: 4, CO: 4, SE: 5, S: 5 },
};

export const getZone = (originRegion: string, destRegion: string): Zone =>
  REGION_ZONE[originRegion]?.[destRegion] ?? 3;

export const ZONE_LABEL: Record<Zone, string> = {
  1: "Zona 1 — mesma região",
  2: "Zona 2 — região vizinha",
  3: "Zona 3 — média distância",
  4: "Zona 4 — longa distância",
  5: "Zona 5 — Norte/Nordeste remoto",
};

/** Fator de cubagem usado por Correios, Mercado Envios e transportadoras. */
export const CUBAGE_FACTOR = 6000;

export const cubedWeight = (l: number, w: number, h: number) => (l * w * h) / CUBAGE_FACTOR;

/** Tabela base Correios PAC — Setembro/2026 (R$ por faixa de peso x zona). */
export const BASE_TABLE: { upTo: number; label: string; prices: number[] }[] = [
  { upTo: 0.3, label: "Até 300 g", prices: [18.9, 21.5, 24.3, 27.8, 31.4] },
  { upTo: 0.5, label: "300 g a 500 g", prices: [21.4, 24.6, 27.9, 32.1, 36.5] },
  { upTo: 1, label: "500 g a 1 kg", prices: [25.9, 30.2, 34.6, 40.3, 46.2] },
  { upTo: 2, label: "1 kg a 2 kg", prices: [31.8, 37.4, 43.1, 50.9, 58.9] },
  { upTo: 5, label: "2 kg a 5 kg", prices: [44.6, 53.2, 62.0, 74.5, 87.3] },
  { upTo: 10, label: "5 kg a 10 kg", prices: [63.8, 77.1, 90.6, 110.2, 130.4] },
  { upTo: 20, label: "10 kg a 20 kg", prices: [98.4, 120.3, 142.7, 175.6, 209.3] },
  { upTo: 30, label: "20 kg a 30 kg", prices: [138.7, 170.9, 203.8, 252.4, 302.1] },
];

/** Excedente por kg acima de 30 kg. */
export const EXTRA_KG_RATE = 4.9;

/** Prazo base em dias úteis por zona. */
const BASE_DAYS: Record<Zone, number> = { 1: 4, 2: 5, 3: 7, 4: 9, 5: 12 };

export interface MarketplaceShipping {
  /** nome igual ao de MARKETPLACES em marketplaces.ts */
  marketplace: string;
  service: string;
  /** multiplicador sobre a tabela base Correios PAC */
  factor: number;
  /** taxa fixa de coleta/etiqueta por envio */
  handlingFee: number;
  /** dias somados (+) ou reduzidos (-) sobre o prazo base */
  daysAdjust: number;
  /** a partir deste preço de venda o frete vira grátis para o comprador (o vendedor paga) */
  freeShippingFrom?: number;
  /** desconto do programa de frete grátis sobre o valor pago pelo vendedor (0.4 = 40% de desconto) */
  sellerDiscount?: number;
  note: string;
}

/**
 * Regras de frete por marketplace — vigentes em Setembro/2026.
 * Alterou a tarifa? Basta editar aqui: a tabela por CEP e o cálculo
 * de lucro líquido passam a usar o novo valor automaticamente.
 */
export const MARKETPLACE_SHIPPING: MarketplaceShipping[] = [
  {
    marketplace: "Mercado Livre",
    service: "Mercado Envios (Coleta/Agência)",
    factor: 0.88,
    handlingFee: 0,
    daysAdjust: -1,
    freeShippingFrom: 79,
    sellerDiscount: 0.4,
    note: "Frete grátis obrigatório acima de R$ 79; desconto de 40% a 50% conforme reputação",
  },
  {
    marketplace: "Mercado Livre",
    service: "Mercado Envios Full",
    factor: 0.78,
    handlingFee: 2.4,
    daysAdjust: -2,
    freeShippingFrom: 79,
    sellerDiscount: 0.5,
    note: "Tabela Full + tarifa de armazenagem por envio",
  },
  {
    marketplace: "Shopee",
    service: "Shopee Xpress / Envio Padrão",
    factor: 0.8,
    handlingFee: 0,
    daysAdjust: 1,
    freeShippingFrom: 19,
    sellerDiscount: 0.6,
    note: "Programa de Frete Grátis subsidia a maior parte do envio",
  },
  {
    marketplace: "Amazon",
    service: "DBA / Amazon Frete",
    factor: 0.92,
    handlingFee: 0,
    daysAdjust: 0,
    freeShippingFrom: 79,
    sellerDiscount: 0.25,
    note: "Frete grátis Prime acima de R$ 79 nas categorias elegíveis",
  },
  {
    marketplace: "Amazon",
    service: "FBA (Logística da Amazon)",
    factor: 0.72,
    handlingFee: 3.9,
    daysAdjust: -2,
    freeShippingFrom: 0,
    sellerDiscount: 0.3,
    note: "Tarifa FBA por unidade já embutida na tabela",
  },
  {
    marketplace: "Magazine Luiza",
    service: "Magalu Entregas",
    factor: 0.9,
    handlingFee: 1.5,
    daysAdjust: 0,
    freeShippingFrom: 99,
    sellerDiscount: 0.3,
    note: "Frete subsidiado em campanhas do Magalu",
  },
  {
    marketplace: "Americanas",
    service: "Americanas Entrega",
    factor: 0.95,
    handlingFee: 1.5,
    daysAdjust: 0,
    freeShippingFrom: 129,
    sellerDiscount: 0.2,
    note: "Frete grátis acima de R$ 129 para clientes Ame",
  },
  {
    marketplace: "Casas Bahia",
    service: "Envvias (Casas Bahia)",
    factor: 0.93,
    handlingFee: 1.5,
    daysAdjust: 0,
    freeShippingFrom: 149,
    sellerDiscount: 0.2,
    note: "Logística Envvias do grupo Casas Bahia",
  },
  {
    marketplace: "TikTok Shop",
    service: "TikTok Shop Logística",
    factor: 0.85,
    handlingFee: 0,
    daysAdjust: 1,
    freeShippingFrom: 49,
    sellerDiscount: 0.5,
    note: "Programa de Frete Grátis opcional (+6% de comissão)",
  },
  {
    marketplace: "Shein (Marketplace)",
    service: "Shein Logística BR",
    factor: 0.83,
    handlingFee: 0,
    daysAdjust: 2,
    freeShippingFrom: 79,
    sellerDiscount: 0.5,
    note: "Envio nacional coletado pela Shein",
  },
  {
    marketplace: "Elo7",
    service: "Correios PAC (Elo7)",
    factor: 1,
    handlingFee: 0,
    daysAdjust: 0,
    note: "Frete pago pelo comprador na maioria dos anúncios",
  },
  {
    marketplace: "Etsy",
    service: "Correios Internacional/Nacional",
    factor: 1.1,
    handlingFee: 0,
    daysAdjust: 2,
    note: "Etiqueta Correios sem contrato",
  },
  {
    marketplace: "Enjoei",
    service: "Enjoei Entrega",
    factor: 0.97,
    handlingFee: 0,
    daysAdjust: 1,
    note: "Etiqueta gerada pelo Enjoei",
  },
  {
    marketplace: "AliExpress (Vendedor BR)",
    service: "AliExpress Local BR",
    factor: 0.86,
    handlingFee: 0,
    daysAdjust: 1,
    freeShippingFrom: 79,
    sellerDiscount: 0.4,
    note: "Cupons de frete do AliExpress reduzem o custo do vendedor",
  },
  {
    marketplace: "OLX",
    service: "OLX Entrega (Correios)",
    factor: 1,
    handlingFee: 0,
    daysAdjust: 0,
    note: "Frete pago pelo comprador",
  },
];

/** Opções genéricas, usadas para qualquer marketplace sem logística própria. */
export const GENERIC_SHIPPING: MarketplaceShipping[] = [
  {
    marketplace: "*",
    service: "Correios PAC",
    factor: 1,
    handlingFee: 0,
    daysAdjust: 0,
    note: "Balcão, sem contrato",
  },
  {
    marketplace: "*",
    service: "Correios SEDEX",
    factor: 1.62,
    handlingFee: 0,
    daysAdjust: -6,
    note: "Entrega expressa",
  },
  {
    marketplace: "*",
    service: "Loggi / Jadlog .Package",
    factor: 0.93,
    handlingFee: 1.2,
    daysAdjust: -1,
    note: "Média de mercado para e-commerce",
  },
];

export const getShippingOptionsFor = (marketplace: string): MarketplaceShipping[] => {
  const own = MARKETPLACE_SHIPPING.filter((o) => o.marketplace === marketplace);
  return [...own, ...GENERIC_SHIPPING.map((o) => ({ ...o, marketplace }))];
};

export interface ShippingQuote {
  service: string;
  marketplace: string;
  /** frete cheio da tabela (antes de descontos do marketplace) */
  fullPrice: number;
  /** quanto o vendedor realmente paga */
  sellerPrice: number;
  /** quanto o marketplace subsidia */
  subsidy: number;
  /** quem paga o frete neste preço de venda */
  paidBy: "Vendedor" | "Comprador";
  days: number;
  billedWeight: number;
  note: string;
}

export interface QuoteInput {
  option: MarketplaceShipping;
  zone: Zone;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  salePrice?: number;
  /** desconto de frete do plano do marketplace (ex.: 0.5 = 50%) */
  planShippingDiscount?: number;
}

export const basePriceFor = (weight: number, zone: Zone) => {
  const row = BASE_TABLE.find((r) => weight <= r.upTo) ?? BASE_TABLE[BASE_TABLE.length - 1];
  let price = row.prices[zone - 1];
  if (weight > 30) price += (weight - 30) * EXTRA_KG_RATE;
  return price;
};

export const quoteShipping = ({
  option,
  zone,
  weight,
  length = 20,
  width = 15,
  height = 10,
  salePrice = 0,
  planShippingDiscount = 0,
}: QuoteInput): ShippingQuote => {
  const billedWeight = Math.max(weight, cubedWeight(length, width, height));
  const fullPrice = basePriceFor(billedWeight, zone) * option.factor + option.handlingFee;

  const buyerPays =
    option.freeShippingFrom === undefined || salePrice < option.freeShippingFrom;

  let sellerPrice = 0;
  if (!buyerPays) {
    const discount = Math.max(option.sellerDiscount ?? 0, planShippingDiscount);
    sellerPrice = fullPrice * (1 - discount);
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    service: option.service,
    marketplace: option.marketplace,
    fullPrice: round(fullPrice),
    sellerPrice: round(sellerPrice),
    subsidy: round(buyerPays ? 0 : fullPrice - sellerPrice),
    paidBy: buyerPays ? "Comprador" : "Vendedor",
    days: Math.max(BASE_DAYS[zone] + option.daysAdjust, 1),
    billedWeight: Math.round(billedWeight * 1000) / 1000,
    note: option.note,
  };
};
