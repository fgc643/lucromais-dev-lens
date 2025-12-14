import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductData } from "@/types/calculator";
import { ProductForm } from "@/components/ProductForm";
import { ResultCard } from "@/components/ResultCard";
import { HistoryList } from "@/components/HistoryList";
import { ComparisonModal } from "@/components/ComparisonModal";
import { ReverseCalculator } from "@/components/ReverseCalculator";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, Loader2, Sparkles, Clock, Shield, Zap, Lock, Crown } from "lucide-react";
import MercadoLivreConnect from "@/components/MercadoLivreConnect";
import { GoldenParticles } from "@/components/GoldenParticles";
const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, saveProduct, deleteProduct, clearAllProducts, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useUserSettings();
  const { toast } = useToast();
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  // DESATIVADO TEMPORARIAMENTE - trial sempre liberado
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isLoadingTrial, setIsLoadingTrial] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkTrialStatus();
    }
  }, [user, authLoading, navigate]);

  // DESATIVADO TEMPORARIAMENTE - função de trial suspensa para validação
  const checkTrialStatus = async () => {
    // Trial desativado - acesso liberado para todos
    setIsTrialExpired(false);
    setTrialDaysLeft(null);
    setIsLoadingTrial(false);
  };

  const handleCalculate = async (product: ProductData) => {
    // Bloqueio de trial desativado temporariamente
    setCurrentProduct(product);
    if (user) {
      await saveProduct(product);
      setHistoryRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: "💎 Upgrade para Premium",
      description: "Funcionalidade de pagamento será implementada em breve!",
    });
  };

  const handleHistoryDelete = async (id: string) => {
    await deleteProduct(id);
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  const handleHistoryClear = async () => {
    await clearAllProducts();
    setCurrentProduct(null);
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  if (authLoading || productsLoading || settingsLoading || isLoadingTrial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(225,25%,3%)] relative overflow-x-hidden">
      {/* Golden Particles Effect */}
      <GoldenParticles />
      
      {/* Background Premium Effects - Simplified for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[hsl(42,100%,50%,0.06)] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[hsl(280,60%,50%,0.04)] rounded-full blur-[120px]"></div>
      </div>

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-mesh pointer-events-none"></div>

      <div className="relative z-10">
        <OnboardingTutorial />
        
        {/* Header com Badge de Trial */}
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Lucro Mais IA
              </h1>
            </div>
            {!isTrialExpired && trialDaysLeft !== null && (
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Clock className="w-4 h-4" />
                {trialDaysLeft} dias restantes
              </Badge>
            )}
            {isTrialExpired && (
              <Badge variant="destructive" className="gap-2 px-4 py-2">
                <Lock className="w-4 h-4" />
                Trial Expirado
              </Badge>
            )}
          </div>
        </header>

        {/* Hero Section Persuasivo */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-4xl mx-auto space-y-6 card-3d p-8 cascade-init animate-cascade-hero">
            <Badge className="mb-4 gap-2 cascade-init animate-cascade-3d cascade-delay-2" variant="secondary">
              <Zap className="w-4 h-4" />
              Tecnologia de IA Avançada
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent cascade-init animate-title-cascade cascade-delay-3">
              Maximize Seus Lucros com Inteligência Artificial
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto cascade-init animate-cascade-3d cascade-delay-4">
              Análise em tempo real, decisões inteligentes e lucros maximizados. 
              A calculadora mais avançada do mercado agora ao seu alcance.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 card-3d hover:scale-105 transition-transform cascade-init animate-cascade-glow cascade-delay-5">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Análise Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  IA analisa seu produto em segundos e entrega insights acionáveis
                </p>
              </Card>
              
              <Card className="p-6 card-3d hover:scale-105 transition-transform cascade-init animate-cascade-glow cascade-delay-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Decisões Seguras</h3>
                <p className="text-sm text-muted-foreground">
                  Evite prejuízos com alertas inteligentes e recomendações precisas
                </p>
              </Card>
              
              <Card className="p-6 card-3d hover:scale-105 transition-transform cascade-init animate-cascade-glow cascade-delay-7">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Resultados 3D</h3>
                <p className="text-sm text-muted-foreground">
                  Interface luxuosa com feedback visual instantâneo de lucro/prejuízo
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Calculadora ou Bloqueio */}
        <main className="container mx-auto px-4 pb-16">
          {isTrialExpired ? (
            <Card className="max-w-4xl mx-auto p-12 text-center card-3d luxury-card border-2 border-destructive/50">
              <Lock className="w-24 h-24 text-destructive mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl font-bold mb-4">Trial Expirado</h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Seu período de teste de 7 dias terminou. 
                Faça upgrade para continuar usando todas as funcionalidades premium!
              </p>
              
              <div className="space-y-4 max-w-md mx-auto mb-8">
                <div className="flex items-center gap-3 text-left">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Análise ilimitada com IA</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Cálculos em tempo real</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={handleUpgrade}
                className="text-lg px-8 py-6 shadow-3d hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Fazer Upgrade Agora
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                A partir de R$ 49,90/mês
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulário */}
              <div className="lg:col-span-2 space-y-8">
                <ProductForm onCalculate={handleCalculate} />
                
                {currentProduct && (
                  <div className="animate-fade-in">
                    <ResultCard product={currentProduct} />
                  </div>
                )}
                
                {trialDaysLeft !== null && trialDaysLeft <= 3 && (
                  <Card className="p-6 border-accent/50 bg-accent/10">
                    <div className="flex items-center gap-4">
                      <Clock className="w-8 h-8 text-accent flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">
                          ⚠️ Seu trial está acabando!
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Restam apenas {trialDaysLeft} dias. Faça upgrade agora e garanta acesso ilimitado!
                        </p>
                      </div>
                      <Button onClick={handleUpgrade} variant="default">
                        Fazer Upgrade
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Histórico e Ferramentas */}
              <div className="lg:col-span-1 space-y-6">
                {/* Mercado Livre Connection */}
                <MercadoLivreConnect />
                
                <div className="flex gap-2">
                  <ReverseCalculator />
                  {currentProduct && <ComparisonModal baseProduct={currentProduct} />}
                </div>
                
                <HistoryList
                  key={historyRefreshTrigger}
                  products={products}
                  onItemClick={setCurrentProduct}
                  onItemDelete={handleHistoryDelete}
                  onClear={handleHistoryClear}
                />
              </div>
            </div>
          )}
        </main>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-8 cascade-init animate-title-cascade cascade-delay-8">
              Junte-se a milhares de empreendedores
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="cascade-init animate-stats-cascade cascade-delay-9">
                <div className="text-4xl font-bold text-primary mb-2">+5.000</div>
                <div className="text-muted-foreground">Usuários ativos</div>
              </div>
              <div className="cascade-init animate-stats-cascade cascade-delay-10">
                <div className="text-4xl font-bold text-primary mb-2">R$ 2M+</div>
                <div className="text-muted-foreground">Lucros otimizados</div>
              </div>
              <div className="cascade-init animate-stats-cascade" style={{ animationDelay: '1.1s' }}>
                <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-muted-foreground">Avaliação média</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/20 mt-16 py-8 bg-card/30 backdrop-blur-sm shadow-3d">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground card-3d">
          <div className="card-3d-content">
            <p className="font-bold mb-2 text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ✨ Lucro Mais - Sistema Multi-Usuário com IA Integrada
            </p>
            <p className="mb-1 flex items-center justify-center gap-2 flex-wrap">
              <span>🤖 Análise Inteligente 24/7</span>
              <span>|</span>
              <span>📦 Embalagem</span>
              <span>|</span>
              <span>📢 ADS</span>
              <span>|</span>
              <span>💼 Operacional</span>
              <span>|</span>
              <span>🧾 Simples Nacional</span>
            </p>
            <p className="text-xs">Varredura automática em tempo real de todos os marketplaces com dicas inteligentes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
