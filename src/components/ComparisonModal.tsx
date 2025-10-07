import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react";
import { ProductData, ComparisonData } from "@/types/calculator";
import { MARKETPLACES } from "@/data/marketplaces";
import { calculateProfit } from "@/utils/calculator";
import { formatCurrency, formatPercentage } from "@/utils/calculator";
import { toast } from "sonner";

interface ComparisonModalProps {
  baseProduct: ProductData;
}

export const ComparisonModal = ({ baseProduct }: ComparisonModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);

  const handleCompare = () => {
    if (selectedMarketplaces.length === 0) {
      toast.error("Selecione pelo menos um marketplace para comparar");
      return;
    }

    const results: ComparisonData[] = [];

    selectedMarketplaces.forEach((mpName) => {
      const marketplace = MARKETPLACES.find((m) => m.name === mpName);
      if (!marketplace) return;

      Object.keys(marketplace.plans).forEach((planName) => {
        try {
          const testProduct: ProductData = {
            ...baseProduct,
            id: `${mpName}-${planName}`,
            marketplace: mpName,
            plan: planName,
          };

          const calc = calculateProfit(testProduct);

          results.push({
            marketplace: mpName,
            plan: planName,
            netProfit: calc.netProfit,
            profitMargin: calc.profitMargin,
            totalFees: calc.fees.total,
          });
        } catch (error) {
          console.error(`Erro ao calcular ${mpName} - ${planName}`, error);
        }
      });
    });

    // Ordenar por lucro líquido (maior para menor)
    results.sort((a, b) => b.netProfit - a.netProfit);
    setComparisons(results);
    toast.success("Comparação realizada com sucesso!");
  };

  const toggleMarketplace = (mpName: string) => {
    setSelectedMarketplaces((prev) =>
      prev.includes(mpName) ? prev.filter((m) => m !== mpName) : [...prev, mpName]
    );
  };

  const getBestDeal = () => {
    if (comparisons.length === 0) return null;
    return comparisons[0];
  };

  const bestDeal = getBestDeal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Comparar Marketplaces
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Comparar entre Marketplaces
          </DialogTitle>
          <DialogDescription>
            Compare o lucro do produto "{baseProduct.name}" em diferentes marketplaces e planos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seletor de Marketplaces */}
          <div className="space-y-3">
            <h4 className="font-semibold">Selecione os marketplaces para comparar:</h4>
            <div className="flex flex-wrap gap-2">
              {MARKETPLACES.map((mp) => (
                <Button
                  key={mp.name}
                  variant={selectedMarketplaces.includes(mp.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMarketplace(mp.name)}
                  className="transition-all"
                >
                  {mp.name}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleCompare} className="w-full" disabled={selectedMarketplaces.length === 0}>
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Comparar Agora
          </Button>

          {/* Resultados */}
          {comparisons.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Resultados da Comparação</h4>
                <Badge className="bg-success">
                  {comparisons.length} opções analisadas
                </Badge>
              </div>

              {/* Melhor Opção em Destaque */}
              {bestDeal && (
                <div className="p-4 bg-success/10 border-2 border-success rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <h5 className="font-semibold text-success">Melhor Opção!</h5>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Marketplace</p>
                      <p className="font-semibold">{bestDeal.marketplace}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <p className="font-semibold">{bestDeal.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <p className="font-semibold text-success">{formatCurrency(bestDeal.netProfit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p className="font-semibold">{formatPercentage(bestDeal.profitMargin)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela Comparativa */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Marketplace</th>
                        <th className="text-left p-3 font-semibold">Plano</th>
                        <th className="text-right p-3 font-semibold">Lucro Líquido</th>
                        <th className="text-right p-3 font-semibold">Margem</th>
                        <th className="text-right p-3 font-semibold">Total de Taxas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisons.map((comp, index) => {
                        const isBest = index === 0;
                        const isProfitable = comp.netProfit > 0;
                        return (
                          <tr
                            key={`${comp.marketplace}-${comp.plan}`}
                            className={`border-t hover:bg-muted/50 transition-colors ${
                              isBest ? "bg-success/5" : ""
                            }`}
                          >
                            <td className="p-3 font-medium">{comp.marketplace}</td>
                            <td className="p-3">
                              <Badge variant="outline">{comp.plan}</Badge>
                            </td>
                            <td className={`p-3 text-right font-semibold ${
                              isProfitable ? "text-success" : "text-destructive"
                            }`}>
                              {isProfitable ? (
                                <TrendingUp className="inline h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="inline h-4 w-4 mr-1" />
                              )}
                              {formatCurrency(comp.netProfit)}
                            </td>
                            <td className="p-3 text-right">{formatPercentage(comp.profitMargin)}</td>
                            <td className="p-3 text-right text-destructive">
                              {formatCurrency(comp.totalFees)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights */}
              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Insight:</strong> A diferença entre a melhor e a pior opção é de{" "}
                  <strong className="text-primary">
                    {formatCurrency(comparisons[0].netProfit - comparisons[comparisons.length - 1].netProfit)}
                  </strong>
                  . Escolher a plataforma certa pode fazer toda a diferença!
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
