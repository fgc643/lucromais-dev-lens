import { MarketplaceFees } from "@/types/calculator";

export const MARKETPLACES: MarketplaceFees[] = [
  {
    name: "Mercado Livre",
    plans: {
      "Clássico": { commission: 16, paymentFee: { card: 4.49, pix: 3.99 } },
      "Premium": { commission: 14, paymentFee: { card: 4.49, pix: 3.99 } },
      "Platinum": { commission: 12, paymentFee: { card: 4.49, pix: 3.99 } },
    },
  },
  {
    name: "Amazon",
    plans: {
      "Individual": { commission: 15, fixedFee: 2 },
      "Profissional": { commission: 15, fixedFee: 0 },
    },
  },
  {
    name: "Shopee",
    plans: {
      "Gratuito": { commission: 14, paymentFee: { card: 2.5, pix: 2 } },
      "Premium": { commission: 12, paymentFee: { card: 2.5, pix: 2 } },
    },
  },
  {
    name: "Magazine Luiza",
    plans: {
      "Padrão": { commission: 18, paymentFee: { card: 3.5, pix: 3 } },
      "Premium": { commission: 15, paymentFee: { card: 3.5, pix: 3 } },
    },
  },
  {
    name: "Americanas",
    plans: {
      "Padrão": { commission: 17, paymentFee: { card: 3.8, pix: 3.2 } },
    },
  },
  {
    name: "iFood",
    plans: {
      "Básico": { commission: 22 },
      "Plus": { commission: 18 },
    },
  },
  {
    name: "Rappi",
    plans: {
      "Padrão": { commission: 20 },
    },
  },
  {
    name: "Hotmart",
    plans: {
      "Produtor": { commission: 9.9, fixedFee: 1 },
      "Afiliado": { commission: 9.9, fixedFee: 1 },
    },
  },
  {
    name: "Eduzz",
    plans: {
      "Produtor": { commission: 8.9, fixedFee: 1 },
    },
  },
  {
    name: "Monetizze",
    plans: {
      "Produtor": { commission: 9.9 },
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
    },
  },
];

export const CATEGORIES = [
  "Eletrônicos",
  "Moda e Acessórios",
  "Casa e Decoração",
  "Esportes e Fitness",
  "Beleza e Cuidados Pessoais",
  "Livros e Mídias",
  "Brinquedos e Games",
  "Alimentos e Bebidas",
  "Automotivo",
  "Instrumentos Musicais",
  "Papelaria e Escritório",
  "Pet Shop",
  "Saúde",
  "Jardim",
  "Outros",
];

export const INSTALLMENT_OPTIONS = [
  { value: "1x", label: "1x à vista" },
  { value: "2x", label: "2x sem juros" },
  { value: "3x", label: "3x sem juros" },
  { value: "6x", label: "6x sem juros" },
  { value: "10x", label: "10x sem juros" },
  { value: "12x", label: "12x sem juros" },
];
