import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProductData } from "@/types/calculator";
import { formatCurrency, formatPercentage } from "@/utils/calculator";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { ProfitChart } from "./ProfitChart";

interface ResultCardProps {
  product: ProductData;
}

export const ResultCard = ({ product }: ResultCardProps) => {
  const { results } = product;
  
  if (!results) return null;

  const isProfitable = results.netProfit > 0;
  const profitColor = isProfitable ? "text-success" : "text-destructive";
  const ProfitIcon = isProfitable ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-4 animate-scale-in">
      <Card className="border-primary/20 shadow-elevated hover:shadow-glow transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-card to-card/50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {product.name}
            </span>
            <Badge variant={isProfitable ? "default" : "destructive"}>
              {product.marketplace} - {product.plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg border border-border hover:scale-105 transition-transform">
              <p className="text-sm text-muted-foreground mb-1">Lucro Bruto</p>
              <p className="text-2xl font-bold">{formatCurrency(results.grossProfit)}</p>
            </div>
            
            <div className={`p-4 rounded-lg border border-border hover:scale-105 transition-transform ${
              isProfitable ? "bg-success/10" : "bg-destructive/10"
            }`}>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <ProfitIcon className="h-4 w-4" />
                Lucro Líquido
              </p>
              <p className={`text-2xl font-bold ${profitColor}`}>
                {formatCurrency(results.netProfit)}
              </p>
            </div>
            
            <div className="p-4 bg-accent/10 rounded-lg border border-border hover:scale-105 transition-transform">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Margem de Lucro
              </p>
              <p className="text-2xl font-bold text-accent-foreground">
                {formatPercentage(results.profitMargin)}
              </p>
            </div>
          </div>

          {/* Detalhamento de Taxas */}
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Detalhamento de Taxas</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comissão do Marketplace</span>
                <span className="font-medium text-destructive">
                  {formatCurrency(results.fees.commission)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Pagamento</span>
                <span className="font-medium text-warning">
                  {formatCurrency(results.fees.payment)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo de Frete</span>
                <span className="font-medium text-info">
                  {formatCurrency(results.fees.shipping)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total de Taxas</span>
                <span className="text-destructive">{formatCurrency(results.fees.total)}</span>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Categoria:</span>
              <span className="ml-2 font-medium">{product.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Parcelas:</span>
              <span className="ml-2 font-medium">{product.installments}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Preço de Venda:</span>
              <span className="ml-2 font-medium">{formatCurrency(product.salePrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Custo:</span>
              <span className="ml-2 font-medium">{formatCurrency(product.costPrice)}</span>
            </div>
          </div>

          {/* Dica Inteligente */}
          {results.profitMargin < 20 && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="text-sm">
                <p className="font-semibold text-warning-foreground">Dica:</p>
                <p className="text-muted-foreground">
                  Sua margem está abaixo de 20%. Considere aumentar o preço ou buscar fornecedores mais baratos para melhorar a lucratividade.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Composição */}
      <ProfitChart results={results} />
    </div>
  );
};
