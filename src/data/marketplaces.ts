import { MarketplaceFees } from "@/types/calculator";

// Dados atualizados Setembro 2026
export const MARKETPLACES: MarketplaceFees[] = [
  {
    name: "Mercado Livre",
    plans: {
      "Clássico": { commission: 17, paymentFee: { card: 4.79, pix: 4.19 } },
      "Premium": { commission: 15, paymentFee: { card: 4.79, pix: 4.19 } },
      "Platinum": { commission: 13, paymentFee: { card: 4.79, pix: 4.19 } },
      "MercadoLíder": { commission: 12, paymentFee: { card: 4.79, pix: 4.19 } },
      "MercadoLíder Platinum": { commission: 11, paymentFee: { card: 4.79, pix: 4.19 } },
      "Full (Fulfillment)": { commission: 17, paymentFee: { card: 4.79, pix: 4.19 }, fulfillmentFee: 14 },
    },
  },
  {
    name: "Amazon",
    plans: {
      "Individual": { commission: 16, fixedFee: 2 },
      "Profissional": { commission: 16, fixedFee: 0 },
      "FBA": { commission: 16, fixedFee: 0, fulfillmentFee: 14 },
    },
  },
  {
    name: "Shopee",
    plans: {
      "Gratuito": { commission: 16, paymentFee: { card: 2.99, pix: 2.49 } },
      "Preferido": { commission: 14, paymentFee: { card: 2.99, pix: 2.49 } },
      "Mall": { commission: 12, paymentFee: { card: 2.99, pix: 2.49 } },
    },
  },
  {
    name: "Magazine Luiza",
    plans: {
      "Padrão": { commission: 19, paymentFee: { card: 3.8, pix: 3.2 } },
      "Premium": { commission: 16, paymentFee: { card: 3.8, pix: 3.2 } },
      "Parceiro Magalu": { commission: 13, paymentFee: { card: 3.8, pix: 3.2 } },
    },
  },
  {
    name: "Americanas",
    plans: {
      "Padrão": { commission: 18, paymentFee: { card: 3.99, pix: 3.39 } },
      "3P Select": { commission: 15, paymentFee: { card: 3.99, pix: 3.39 } },
    },
  },
  {
    name: "Casas Bahia",
    plans: {
      "Padrão": { commission: 17, paymentFee: { card: 3.7, pix: 3.1 } },
      "Premium": { commission: 14, paymentFee: { card: 3.7, pix: 3.1 } },
    },
  },
  {
    name: "iFood",
    plans: {
      "Básico": { commission: 26 },
      "Plano Entrega": { commission: 21 },
      "Loop (Assinatura)": { commission: 13 },
    },
  },
  {
    name: "Rappi",
    plans: {
      "Padrão": { commission: 23 },
      "Priority": { commission: 28 },
    },
  },
  {
    name: "Hotmart",
    plans: {
      "Produtor": { commission: 9.9, fixedFee: 1 },
      "Afiliado": { commission: 9.9, fixedFee: 1 },
      "HotPay Parcelado": { commission: 11.9, fixedFee: 1 },
    },
  },
  {
    name: "Eduzz",
    plans: {
      "Produtor": { commission: 9.9, fixedFee: 1 },
      "Afiliado": { commission: 9.9, fixedFee: 1 },
    },
  },
  {
    name: "Monetizze",
    plans: {
      "Produtor": { commission: 9.9 },
      "Com Recuperação": { commission: 12.5 },
    },
  },
  {
    name: "Kiwify",
    plans: {
      "Padrão": { commission: 8.99, fixedFee: 2 },
    },
  },
  {
    name: "Etsy",
    plans: {
      "Padrão": { commission: 6.5, fixedFee: 0.2 },
    },
  },
  {
    name: "OLX",
    plans: {
      "Gratuito": { commission: 0 },
      "Premium": { commission: 0, fixedFee: 19.9 },
      "Destaque": { commission: 0, fixedFee: 34.9 },
    },
  },
  {
    name: "Enjoei",
    plans: {
      "Padrão": { commission: 22, paymentFee: { card: 3.49, pix: 2.2 } },
    },
  },
  {
    name: "Elo7",
    plans: {
      "Padrão": { commission: 16, paymentFee: { card: 3.7, pix: 2.7 } },
    },
  },
  {
    name: "AliExpress (Vendedor BR)",
    plans: {
      "Padrão": { commission: 9 },
    },
  },
  {
    name: "Shein (Marketplace)",
    plans: {
      "Padrão": { commission: 12 },
    },
  },
  {
    name: "TikTok Shop",
    plans: {
      "Padrão": { commission: 8, paymentFee: { card: 2.99, pix: 2.49 } },
      "Mall": { commission: 6, paymentFee: { card: 2.99, pix: 2.49 } },
    },
  },
];

export const CATEGORIES = [
  "Eletrônicos",
  "Celulares e Smartphones",
  "Computadores e Informática",
  "TVs e Áudio",
  "Moda e Acessórios",
  "Moda Masculina",
  "Moda Feminina",
  "Moda Infantil",
  "Calçados",
  "Bolsas e Acessórios",
  "Casa e Decoração",
  "Móveis",
  "Eletrodomésticos",
  "Cama, Mesa e Banho",
  "Esportes e Fitness",
  "Suplementos",
  "Beleza e Cuidados Pessoais",
  "Perfumaria",
  "Maquiagem",
  "Livros e Mídias",
  "Infoprodutos",
  "Cursos Online",
  "Brinquedos e Games",
  "Games e Consoles",
  "Alimentos e Bebidas",
  "Bebidas Alcoólicas",
  "Automotivo",
  "Peças e Acessórios Auto",
  "Instrumentos Musicais",
  "Papelaria e Escritório",
  "Pet Shop",
  "Rações e Petiscos",
  "Saúde",
  "Farmácia",
  "Jardim e Piscina",
  "Ferramentas",
  "Construção e Reforma",
  "Bebês",
  "Sex Shop",
  "Artesanato",
  "Colecionáveis",
  "Joias e Relógios",
  "Óculos e Acessórios",
  "Malas e Viagem",
  "Outros",
];

export const INSTALLMENT_OPTIONS = [
  { value: "1x", label: "1x à vista", fee: 0 },
  { value: "2x", label: "2x sem juros", fee: 1.5 },
  { value: "3x", label: "3x sem juros", fee: 2.5 },
  { value: "4x", label: "4x sem juros", fee: 3.5 },
  { value: "5x", label: "5x sem juros", fee: 4.5 },
  { value: "6x", label: "6x sem juros", fee: 5.5 },
  { value: "7x", label: "7x sem juros", fee: 6.5 },
  { value: "8x", label: "8x sem juros", fee: 7.5 },
  { value: "9x", label: "9x sem juros", fee: 8.5 },
  { value: "10x", label: "10x sem juros", fee: 9.5 },
  { value: "11x", label: "11x sem juros", fee: 10.5 },
  { value: "12x", label: "12x sem juros", fee: 11.5 },
  { value: "18x", label: "18x sem juros", fee: 15 },
  { value: "24x", label: "24x sem juros", fee: 18 },
];

// Taxas de frete por região (referência Correios Setembro 2026)
export const SHIPPING_REFERENCE = {
  "Até 300g": { pac: { min: 18, max: 25 }, sedex: { min: 25, max: 40 } },
  "300g - 1kg": { pac: { min: 22, max: 35 }, sedex: { min: 35, max: 55 } },
  "1kg - 3kg": { pac: { min: 30, max: 50 }, sedex: { min: 50, max: 75 } },
  "3kg - 5kg": { pac: { min: 40, max: 65 }, sedex: { min: 65, max: 95 } },
  "5kg - 10kg": { pac: { min: 55, max: 90 }, sedex: { min: 85, max: 130 } },
  "10kg - 20kg": { pac: { min: 75, max: 130 }, sedex: { min: 120, max: 200 } },
  "20kg - 30kg": { pac: { min: 100, max: 180 }, sedex: { min: 160, max: 280 } },
};

// Simples Nacional alíquotas 2026
export const SIMPLES_NACIONAL_RATES = [
  { range: "Até R$ 180.000", rate: 4.0, label: "Faixa 1 (4%)" },
  { range: "R$ 180.000 a R$ 360.000", rate: 7.3, label: "Faixa 2 (7.3%)" },
  { range: "R$ 360.000 a R$ 720.000", rate: 9.5, label: "Faixa 3 (9.5%)" },
  { range: "R$ 720.000 a R$ 1.800.000", rate: 10.7, label: "Faixa 4 (10.7%)" },
  { range: "R$ 1.800.000 a R$ 3.600.000", rate: 14.3, label: "Faixa 5 (14.3%)" },
  { range: "R$ 3.600.000 a R$ 4.800.000", rate: 19.0, label: "Faixa 6 (19%)" },
];

// MEI limite 2026
export const MEI_INFO = {
  annualLimit: 81000,
  monthlyLimit: 6750,
  monthlyTax: 71.60,
  activities: "Comércio em geral, exceto armas, combustíveis, medicamentos controlados",
};
