import { MarketplaceFees } from "@/types/calculator";

// Dados atualizados Janeiro 2026
export const MARKETPLACES: MarketplaceFees[] = [
  {
    name: "Mercado Livre",
    plans: {
      "Clássico": { commission: 16, paymentFee: { card: 4.49, pix: 3.99 } },
      "Premium": { commission: 14, paymentFee: { card: 4.49, pix: 3.99 } },
      "Platinum": { commission: 12, paymentFee: { card: 4.49, pix: 3.99 } },
      "MercadoLíder": { commission: 11, paymentFee: { card: 4.49, pix: 3.99 } },
      "MercadoLíder Platinum": { commission: 10, paymentFee: { card: 4.49, pix: 3.99 } },
    },
  },
  {
    name: "Amazon",
    plans: {
      "Individual": { commission: 15, fixedFee: 2 },
      "Profissional": { commission: 15, fixedFee: 0 },
      "FBA": { commission: 15, fixedFee: 0, fulfillmentFee: 12 },
    },
  },
  {
    name: "Shopee",
    plans: {
      "Gratuito": { commission: 14, paymentFee: { card: 2.5, pix: 2 } },
      "Preferido": { commission: 12, paymentFee: { card: 2.5, pix: 2 } },
      "Mall": { commission: 10, paymentFee: { card: 2.5, pix: 2 } },
    },
  },
  {
    name: "Magazine Luiza",
    plans: {
      "Padrão": { commission: 18, paymentFee: { card: 3.5, pix: 3 } },
      "Premium": { commission: 15, paymentFee: { card: 3.5, pix: 3 } },
      "Parceiro Magalu": { commission: 12, paymentFee: { card: 3.5, pix: 3 } },
    },
  },
  {
    name: "Americanas",
    plans: {
      "Padrão": { commission: 17, paymentFee: { card: 3.8, pix: 3.2 } },
      "3P Select": { commission: 14, paymentFee: { card: 3.8, pix: 3.2 } },
    },
  },
  {
    name: "Casas Bahia",
    plans: {
      "Padrão": { commission: 16, paymentFee: { card: 3.5, pix: 3 } },
      "Premium": { commission: 13, paymentFee: { card: 3.5, pix: 3 } },
    },
  },
  {
    name: "iFood",
    plans: {
      "Básico": { commission: 25 },
      "Plano Entrega": { commission: 20 },
      "Loop (Assinatura)": { commission: 12 },
    },
  },
  {
    name: "Rappi",
    plans: {
      "Padrão": { commission: 22 },
      "Priority": { commission: 27 },
    },
  },
  {
    name: "Hotmart",
    plans: {
      "Produtor": { commission: 9.9, fixedFee: 1 },
      "Afiliado": { commission: 9.9, fixedFee: 1 },
      "HotPay Parcelado": { commission: 11.39, fixedFee: 1 },
    },
  },
  {
    name: "Eduzz",
    plans: {
      "Produtor": { commission: 8.9, fixedFee: 1 },
      "Afiliado": { commission: 8.9, fixedFee: 1 },
    },
  },
  {
    name: "Monetizze",
    plans: {
      "Produtor": { commission: 9.9 },
      "Com Recuperação": { commission: 11.9 },
    },
  },
  {
    name: "Kiwify",
    plans: {
      "Padrão": { commission: 8.99, fixedFee: 1 },
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
      "Premium": { commission: 0, fixedFee: 15 },
      "Destaque": { commission: 0, fixedFee: 29.9 },
    },
  },
  {
    name: "Enjoei",
    plans: {
      "Padrão": { commission: 20, paymentFee: { card: 3.18, pix: 2 } },
    },
  },
  {
    name: "Elo7",
    plans: {
      "Padrão": { commission: 15, paymentFee: { card: 3.5, pix: 2.5 } },
    },
  },
  {
    name: "AliExpress (Vendedor BR)",
    plans: {
      "Padrão": { commission: 8 },
    },
  },
  {
    name: "Shein (Marketplace)",
    plans: {
      "Padrão": { commission: 10 },
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

// Taxas de frete por região (referência Correios 2026)
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
