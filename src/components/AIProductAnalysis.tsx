import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/useAuth';
import { aiFunctionErrorMessage } from '@/lib/ai-function-error';

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
  const { user } = useAuth();

  const analyzeProduct = async () => {
    if (!user) {
      toast({ title: 'Login necessário', description: 'Faça login para usar a IA', variant: 'destructive' });
      return;
    }
    if (!productName.trim()) {
      toast({
        title: "⚠️ Nome obrigatório",
        description: "Digite o nome do produto para análise com IA",
        variant: "destructive",
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "⚠️ Categoria obrigatória",
        description: "Selecione a categoria do produto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { productName, category }
      });

      if (error) {
        toast({ title: 'Erro na análise', description: await aiFunctionErrorMessage(error), variant: 'destructive' });
        return;
      }

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
        description: 'Não foi possível concluir a análise. Tente novamente mais tarde.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-3d luxury-card card-3d overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none animate-pulse" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl card-3d-content">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 animate-pulse">
            <Sparkles className="h-7 w-7 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <p className="text-2xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              🤖 Análise Inteligente com IA
            </p>
            <p className="text-xs text-muted-foreground font-normal">Varredura automática 24/7 em todos os marketplaces brasileiros</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <Button 
          onClick={analyzeProduct}
          disabled={loading || !productName.trim()}
          className="w-full h-16 text-lg font-bold shadow-3d transition-all duration-500 bg-gradient-to-r from-primary via-accent to-primary hover:scale-105 border-2 border-primary/50"
          size="lg"
          style={{
            backgroundSize: '200% 100%',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-3 h-7 w-7 animate-spin" />
              🔍 Analisando marketplaces em tempo real...
            </>
          ) : (
            <>
              <Sparkles className="mr-3 h-7 w-7 animate-bounce" />
              🚀 Iniciar Análise com IA Agora
            </>
          )}
        </Button>
        
        {!productName.trim() && (
          <p className="text-sm text-muted-foreground text-center p-3 luxury-card rounded-lg border border-primary/10 shadow-3d">
            💡 Digite o nome do produto acima para habilitar a análise inteligente
          </p>
        )}

        {analysis && (
          <Card className="border-2 border-primary/20 shadow-3d luxury-card card-3d mt-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 card-3d-content">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-bold">✨ Análise Inteligente de Mercado</p>
                <p className="text-xs text-muted-foreground font-normal">Varredura completa em tempo real de todos os marketplaces</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Análise Geral */}
            <div className="p-4 luxury-card rounded-xl shadow-3d border border-primary/10">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                📊 Análise do Produto
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.analysis}</p>
            </div>

            <Separator className="bg-primary/20" />

            {/* Marketplaces */}
            {analysis.marketplaces && analysis.marketplaces.length > 0 && (
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  🏪 Marketplaces Analisados
                </h3>
                <div className="grid gap-4">
                  {analysis.marketplaces.map((marketplace, index) => (
                    <Card key={index} className="luxury-card shadow-3d card-3d border-2 border-primary/10 overflow-hidden hover:scale-105 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                      <CardContent className="pt-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{marketplace.name}</h4>
                            <p className="text-3xl font-black text-profit drop-shadow-lg">
                              R$ {marketplace.averagePrice?.toFixed(2)}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              marketplace.competition === 'baixa' ? 'default' : 
                              marketplace.competition === 'média' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-sm px-3 py-1 shadow-lg"
                          >
                            {marketplace.competition} concorrência
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
              <div className="p-6 profit-glow rounded-xl shadow-3d border-2 card-3d">
                <p className="text-sm font-bold mb-1">🏆 Melhor Marketplace Recomendado</p>
                <p className="text-2xl font-black text-profit drop-shadow-lg">{analysis.bestMarketplace}</p>
              </div>
            )}

            {/* Precificação Sugerida */}
            {analysis.pricing && (
              <div>
                <h3 className="font-bold mb-4 text-lg">💰 Precificação Sugerida</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 luxury-card rounded-xl shadow-3d border border-primary/10 card-3d hover:scale-105 transition-all">
                    <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
                    <p className="text-xl font-bold">R$ {analysis.pricing.minPrice?.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 profit-glow rounded-xl shadow-3d border-2 card-3d hover:scale-110 transition-all">
                    <p className="text-xs font-bold mb-1">✅ Sugerido</p>
                    <p className="text-2xl font-black text-profit drop-shadow-lg">
                      R$ {analysis.pricing.suggestedPrice?.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 luxury-card rounded-xl shadow-3d border border-primary/10 card-3d hover:scale-105 transition-all">
                    <p className="text-xs text-muted-foreground mb-1">Máximo</p>
                    <p className="text-xl font-bold">R$ {analysis.pricing.maxPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas */}
            {analysis.tips && analysis.tips.length > 0 && (
              <div className="p-6 luxury-card rounded-xl shadow-3d border border-yellow-500/20">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500 animate-pulse" />
                  💡 Dicas Inteligentes
                </h3>
                <ul className="space-y-3">
                  {analysis.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                      <span className="text-2xl">💡</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alertas */}
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div className="p-6 luxury-card rounded-xl shadow-3d border-2 border-orange-500/30 animate-pulse">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-orange-500 animate-bounce" />
                  ⚠️ Alertas Importantes
                </h3>
                <ul className="space-y-3">
                  {analysis.alerts.map((alert, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <span className="text-2xl">⚠️</span>
                      <span className="leading-relaxed">{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </CardContent>
    </Card>
  );
};
