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
  installments: string;
  marketplace: string;
  plan: string;
  createdAt: Date;
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
