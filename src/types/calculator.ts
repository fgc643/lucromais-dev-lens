export interface MarketplaceFees {
  name: string;
  plans: {
    [key: string]: {
      commission: number;
      fixedFee?: number;
      paymentFee?: {
        card: number;
        pix: number;
      };
      shippingDiscount?: number;
      fulfillmentFee?: number;
    };
  };
}

export interface ProductData {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  shippingCost: number;
  packagingCost: number;
  adsCost: number;
  operationalCost: number;
  simplesNacionalRate: number;
  installments: string;
  marketplace: string;
  plan: string;
  createdAt: Date;
  /** opção de frete escolhida em "Frete por CEP" */
  shippingService?: string;
  /** true quando shippingCost já é o valor final do vendedor (descontos aplicados) */
  shippingFromQuote?: boolean;
  results?: CalculationResults;
}

export interface CalculationResults {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  fees: {
    commission: number;
    payment: number;
    shipping: number;
    packaging: number;
    ads: number;
    operational: number;
    simplesNacional: number;
    total: number;
  };
  breakdown: {
    label: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

export interface ComparisonData {
  marketplace: string;
  plan: string;
  netProfit: number;
  profitMargin: number;
  totalFees: number;
}
