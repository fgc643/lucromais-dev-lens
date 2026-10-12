import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProductData } from "@/types/calculator";
import { formatCurrency, formatPercentage } from "@/utils/calculator";
import { TrendingUp, TrendingDown, DollarSign, Percent, Sparkles } from "lucide-react";
import { ProfitChart } from "./ProfitChart";

interface ResultCardProps {
  product: ProductData;
}

export const ResultCard = ({ product }: ResultCardProps) => {
  const { results } = product;
  
  if (!results) return null;

  const isProfitable = results.netProfit > 0;
  const profitColorClass = isProfitable ? "text-profit" : "text-loss";
  const profitBgClass = isProfitable ? "profit-glow" : "loss-glow";
  const profitBtnClass = isProfitable ? "btn-profit" : "btn-loss";
  const ProfitIcon = isProfitable ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="border-primary/20 shadow-3d luxury-card hover:shadow-glow transition-all duration-500 card-3d overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <CardHeader className="relative bg-gradient-to-r from-card to-card/50 border-b border-primary/20">
          <CardTitle className="flex items-center justify-between card-3d-content">
            <span className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
            </span>
            <Badge 
              variant={isProfitable ? "default" : "destructive"}
              className="text-lg px-4 py-2 shadow-lg"
            >
              {product.marketplace} - {product.plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="grid gap-6 p-8 relative">
          {/* Métricas Principais com Efeito 3D */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-secondary/50 rounded-xl border border-border hover:scale-105 transition-all duration-300 shadow-3d luxury-card card-3d">
              <div className="card-3d-content">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Lucro Bruto
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatCurrency(results.grossProfit)}
                </p>
              </div>
            </div>
            
            <div className={`p-6 rounded-xl border-2 transition-all duration-500 shadow-3d card-3d hover:scale-110 ${profitBgClass}`}>
              <div className="card-3d-content">
                <p className="text-sm mb-2 flex items-center gap-2 font-semibold">
                  <ProfitIcon className="h-5 w-5 animate-pulse" />
                  {isProfitable ? '✅ LUCRO LÍQUIDO' : '⚠️ PREJUÍZO'}
                </p>
                <p className={`text-4xl font-black ${profitColorClass} drop-shadow-lg`}>
                  {formatCurrency(results.netProfit)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-2 w-full rounded-full overflow-hidden bg-black/20`}>
                    <div 
                      className={`h-full ${isProfitable ? 'bg-profit' : 'bg-loss'} animate-pulse`}
                      style={{ width: `${Math.min(Math.abs(results.profitMargin), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-accent/10 rounded-xl border-2 border-accent/30 hover:scale-105 transition-all duration-300 shadow-3d luxury-card card-3d">
              <div className="card-3d-content">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Margem de Lucro
                </p>
                <p className={`text-3xl font-bold ${profitColorClass}`}>
                  {formatPercentage(results.profitMargin)}
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação Dinâmico */}
          <button 
            className={`w-full py-4 px-6 rounded-xl font-bold text-xl flex items-center justify-center gap-3 ${profitBtnClass}`}
          >
            <ProfitIcon className="h-6 w-6 animate-bounce" />
            {isProfitable 
              ? '🎉 PRODUTO LUCRATIVO - VENDER!' 
              : '❌ PRODUTO COM PREJUÍZO - REVISAR PREÇOS'
            }
            <Sparkles className="h-6 w-6 animate-spin" />
          </button>

          {/* Conta passo a passo: cada custo aparece e é subtraído uma única vez */}
          {(() => {
            const lines = [
              { label: "Custo do produto", value: product.costPrice },
              { label: "Comissão do marketplace", value: results.fees.commission },
              { label: "Taxa de pagamento / parcelamento", value: results.fees.payment, optional: true },
              { label: "Frete", value: results.fees.shipping },
              { label: "Embalagem", value: results.fees.packaging },
              { label: `Ads (${product.adsCost || 0}%)`, value: results.fees.ads },
              { label: "Custo operacional", value: results.fees.operational },
              { label: `Simples Nacional (${product.simplesNacionalRate || 0}%)`, value: results.fees.simplesNacional },
            ].filter((l) => !l.optional || l.value > 0);
            const total = lines.reduce((s, l) => s + l.value, 0);
            return (
              <div className="space-y-3 p-6 rounded-xl luxury-card shadow-3d border border-primary/10">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Conta passo a passo
                </h4>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="font-semibold">Preço de venda</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(product.salePrice)}</span>
                </div>
                {lines.map((l, i) => (
                  <div key={l.label} className="flex justify-between items-center px-3 py-2 rounded-lg bg-secondary/40 border border-border">
                    <span className="text-sm">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>− {l.label}
                    </span>
                    <span className="font-semibold text-destructive">− {formatCurrency(l.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 rounded-lg bg-destructive/15 border border-destructive/30">
                  <span className="font-semibold">Soma de todos os custos</span>
                  <span className="font-bold text-destructive text-lg">{formatCurrency(total)}</span>
                </div>
                <div className={`p-4 rounded-lg border-2 ${profitBgClass}`}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {formatCurrency(product.salePrice)} − {formatCurrency(total)} =
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Lucro líquido</span>
                    <span className={`font-black text-2xl ${profitColorClass}`}>
                      {formatCurrency(product.salePrice - total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Informações Adicionais Estilizadas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 luxury-card rounded-xl border border-primary/10">
              <span className="text-xs text-muted-foreground block mb-1">Preço de Venda</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(product.salePrice)}</span>
            </div>
            <div className="p-4 luxury-card rounded-xl border border-primary/10">
              <span className="text-xs text-muted-foreground block mb-1">Custo Total</span>
              <span className="text-2xl font-bold text-destructive">{formatCurrency(product.costPrice)}</span>
            </div>
            <div className="p-4 luxury-card rounded-xl border border-primary/10">
              <span className="text-xs text-muted-foreground block mb-1">Parcelas</span>
              <span className="text-xl font-bold">{product.installments}</span>
            </div>
            <div className="p-4 luxury-card rounded-xl border border-primary/10">
              <span className="text-xs text-muted-foreground block mb-1">Categoria</span>
              <span className="text-xl font-bold">{product.category}</span>
            </div>
          </div>

          {/* Dica Inteligente */}
          {results.profitMargin < 20 && (
            <div className="p-4 bg-warning/10 border-2 border-warning/30 rounded-xl flex items-start gap-3 shadow-3d animate-pulse">
              <span className="text-3xl">💡</span>
              <div className="text-sm">
                <p className="font-bold text-warning text-lg mb-1">⚠️ Alerta de Margem Baixa!</p>
                <p className="text-muted-foreground">
                  Sua margem está abaixo de 20%. Considere aumentar o preço ou buscar fornecedores mais baratos para melhorar a lucratividade significativamente.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Composição */}
      <div className="shadow-3d rounded-xl overflow-hidden">
        <ProfitChart results={results} />
      </div>
    </div>
  );
};
