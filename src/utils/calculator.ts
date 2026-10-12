import { ProductData, CalculationResults, MarketplaceFees } from "@/types/calculator";
import { MARKETPLACES } from "@/data/marketplaces";

export const calculateProfit = (product: ProductData): CalculationResults => {
  const marketplace = MARKETPLACES.find((m) => m.name === product.marketplace);
  if (!marketplace) throw new Error("Marketplace não encontrado");

  const planData = marketplace.plans[product.plan];
  if (!planData) throw new Error("Plano não encontrado");

  const { salePrice, costPrice, shippingCost, packagingCost, adsCost, operationalCost, simplesNacionalRate } = product;

  // Cada custo é calculado uma única vez e entra em exatamente uma linha.
  const commissionFee = (salePrice * planData.commission) / 100 + (planData.fixedFee || 0);

  // Taxa de pagamento/parcelamento (cartão) — só existe se o plano cobrar
  const paymentFee = planData.paymentFee ? (salePrice * planData.paymentFee.card) / 100 : 0;

  const shippingFee = (shippingCost || 0) * (1 - (planData.shippingDiscount || 0));
  const packagingFee = packagingCost || 0;
  const adsFee = (salePrice * (adsCost || 0)) / 100;
  const operationalFee = operationalCost || 0;
  const simplesNacionalFee = (salePrice * (simplesNacionalRate || 0)) / 100;

  const totalFees =
    commissionFee + paymentFee + shippingFee + packagingFee + adsFee + operationalFee + simplesNacionalFee;

  const grossProfit = salePrice - costPrice;
  // Lucro líquido = preço de venda − (produto + todas as taxas e custos)
  const netProfit = salePrice - (costPrice + totalFees);
  const profitMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

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
    {
      label: "Embalagem",
      value: packagingFee,
      percentage: (packagingFee / salePrice) * 100,
      color: "hsl(var(--chart-4))",
    },
    {
      label: "ADS",
      value: adsFee,
      percentage: (adsFee / salePrice) * 100,
      color: "hsl(var(--chart-5))",
    },
    {
      label: "Operacional",
      value: operationalFee,
      percentage: (operationalFee / salePrice) * 100,
      color: "hsl(var(--muted))",
    },
    {
      label: "Simples Nacional",
      value: simplesNacionalFee,
      percentage: (simplesNacionalFee / salePrice) * 100,
      color: "hsl(var(--chart-2))",
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
      packaging: packagingFee,
      ads: adsFee,
      operational: operationalFee,
      simplesNacional: simplesNacionalFee,
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
