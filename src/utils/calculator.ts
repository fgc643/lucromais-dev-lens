import { ProductData, CalculationResults, MarketplaceFees } from "@/types/calculator";
import { MARKETPLACES } from "@/data/marketplaces";

export const calculateProfit = (product: ProductData): CalculationResults => {
  const marketplace = MARKETPLACES.find((m) => m.name === product.marketplace);
  if (!marketplace) throw new Error("Marketplace não encontrado");

  const planData = marketplace.plans[product.plan];
  if (!planData) throw new Error("Plano não encontrado");

  const { salePrice, costPrice, shippingCost } = product;

  // Calcular taxas
  const commissionFee = (salePrice * planData.commission) / 100;
  const fixedFee = planData.fixedFee || 0;
  
  // Taxa de pagamento (assumindo cartão como padrão)
  let paymentFee = 0;
  if (planData.paymentFee) {
    paymentFee = (salePrice * planData.paymentFee.card) / 100;
  }

  const shippingFee = shippingCost * (1 - (planData.shippingDiscount || 0));
  const totalFees = commissionFee + fixedFee + paymentFee + shippingFee;

  // Calcular lucros
  const grossProfit = salePrice - costPrice;
  const netProfit = salePrice - costPrice - totalFees;
  const profitMargin = (netProfit / salePrice) * 100;

  // Breakdown para gráficos
  const breakdown = [
    {
      label: "Lucro Líquido",
      value: netProfit,
      percentage: (netProfit / salePrice) * 100,
      color: "hsl(var(--success))",
    },
    {
      label: "Custo do Produto",
      value: costPrice,
      percentage: (costPrice / salePrice) * 100,
      color: "hsl(var(--chart-3))",
    },
    {
      label: "Comissão",
      value: commissionFee,
      percentage: (commissionFee / salePrice) * 100,
      color: "hsl(var(--destructive))",
    },
    {
      label: "Taxa de Pagamento",
      value: paymentFee,
      percentage: (paymentFee / salePrice) * 100,
      color: "hsl(var(--warning))",
    },
    {
      label: "Frete",
      value: shippingFee,
      percentage: (shippingFee / salePrice) * 100,
      color: "hsl(var(--info))",
    },
  ].filter(item => item.value > 0);

  return {
    grossProfit,
    netProfit,
    profitMargin,
    fees: {
      commission: commissionFee,
      payment: paymentFee,
      shipping: shippingFee,
      total: totalFees,
    },
    breakdown,
  };
};

export const calculateReversePrice = (
  desiredProfit: number,
  costPrice: number,
  shippingCost: number,
  marketplace: string,
  plan: string
): number => {
  const marketplaceData = MARKETPLACES.find((m) => m.name === marketplace);
  if (!marketplaceData) throw new Error("Marketplace não encontrado");

  const planData = marketplaceData.plans[plan];
  if (!planData) throw new Error("Plano não encontrado");

  // Fórmula reversa considerando todas as taxas
  const commissionRate = planData.commission / 100;
  const paymentRate = planData.paymentFee ? planData.paymentFee.card / 100 : 0;
  const fixedFee = planData.fixedFee || 0;
  const shippingFee = shippingCost * (1 - (planData.shippingDiscount || 0));

  // Preço de venda = (Custo + Lucro Desejado + Taxa Fixa + Frete) / (1 - Comissão - Taxa Pagamento)
  const salePrice = 
    (costPrice + desiredProfit + fixedFee + shippingFee) / 
    (1 - commissionRate - paymentRate);

  return Math.ceil(salePrice * 100) / 100; // Arredondar para cima
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
};
