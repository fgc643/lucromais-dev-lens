import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MarketplaceData {
  name: string;
  averagePrice: number;
  competition: string;
  recommendation: string;
}

interface PricingData {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
}

interface AnalysisData {
  analysis: string;
  marketplaces?: MarketplaceData[];
  bestMarketplace?: string;
  pricing?: PricingData;
  tips?: string[];
  alerts?: string[];
}

interface AIProductAnalysisProps {
  productName: string;
  category: string;
}

export const AIProductAnalysis = ({ productName, category }: AIProductAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const analyzeProduct = async () => {
    if (!productName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do produto primeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { productName, category }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.data);
        toast({
          title: "Análise concluída!",
          description: "A IA analisou o produto em todos os marketplaces",
        });
      } else {
        throw new Error(data.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={analyzeProduct}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analisando em todos os marketplaces...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analisar Produto com IA
          </>
        )}
      </Button>

      {analysis && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise Inteligente de Mercado
            </CardTitle>
            <CardDescription>
              Varredura completa em tempo real de todos os marketplaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Análise Geral */}
            <div>
              <h3 className="font-semibold mb-2">Análise do Produto</h3>
              <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
            </div>

            <Separator />

            {/* Marketplaces */}
            {analysis.marketplaces && analysis.marketplaces.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Marketplaces Analisados
                </h3>
                <div className="grid gap-3">
                  {analysis.marketplaces.map((marketplace, index) => (
                    <Card key={index} className="bg-background/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{marketplace.name}</h4>
                            <p className="text-2xl font-bold text-primary">
                              R$ {marketplace.averagePrice?.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant={
                            marketplace.competition === 'baixa' ? 'default' : 
                            marketplace.competition === 'média' ? 'secondary' : 
                            'destructive'
                          }>
                            {marketplace.competition} concorrência
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {marketplace.recommendation}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Melhor Marketplace */}
            {analysis.bestMarketplace && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">🏆 Melhor Marketplace Recomendado</p>
                <p className="text-lg font-bold text-primary">{analysis.bestMarketplace}</p>
              </div>
            )}

            {/* Precificação Sugerida */}
            {analysis.pricing && (
              <div>
                <h3 className="font-semibold mb-3">Precificação Sugerida</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Mínimo</p>
                    <p className="text-lg font-bold">R$ {analysis.pricing.minPrice?.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground">Sugerido</p>
                    <p className="text-lg font-bold text-primary">
                      R$ {analysis.pricing.suggestedPrice?.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Máximo</p>
                    <p className="text-lg font-bold">R$ {analysis.pricing.maxPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas */}
            {analysis.tips && analysis.tips.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Dicas Inteligentes
                </h3>
                <ul className="space-y-2">
                  {analysis.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-500">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alertas */}
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Alertas Importantes
                </h3>
                <ul className="space-y-2">
                  {analysis.alerts.map((alert, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500">⚠️</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
