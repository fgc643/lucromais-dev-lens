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
import { ParallaxCard } from "@/components/ParallaxCard";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, Loader2, Sparkles, Clock, Shield, Zap, Lock, Crown, Users, Search } from "lucide-react";
import { GoldenParticles } from "@/components/GoldenParticles";
import { SupplierManager } from "@/components/SupplierManager";
import { SmartProductSearch } from "@/components/SmartProductSearch";
const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, saveProduct, deleteProduct, clearAllProducts, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useUserSettings();
  const { toast } = useToast();
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isLoadingTrial, setIsLoadingTrial] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkTrialStatus();
    }
  }, [user, authLoading, navigate]);

  const checkTrialStatus = async () => {
    if (!user) return;
    
    setIsLoadingTrial(true);
    try {
      const { data, error } = await supabase
        .rpc('check_subscription_status', { user_id: user.id });
      
      if (error) {
        console.error('Error checking subscription:', error);
        setIsTrialExpired(false);
        setTrialDaysLeft(null);
        setIsSubscribed(false);
        return;
      }
      
      if (data && data.length > 0) {
        const status = data[0];
        setIsTrialExpired(status.is_expired);
        setTrialDaysLeft(status.is_trial ? status.days_left : null);
        setIsSubscribed(status.is_subscribed);
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setIsLoadingTrial(false);
    }
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
      description: "Entre em contato pelo WhatsApp para liberar seu acesso: R$99/mês",
    });
    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent(`Olá! Gostaria de assinar o plano Premium do Lucro Mais IA por R$99/mês. Meu email de cadastro é: ${user?.email}`);
    window.open(`https://wa.me/5511932071021?text=${message}`, '_blank');
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
            {isSubscribed && (
              <Badge variant="default" className="gap-2 px-4 py-2 bg-primary text-primary-foreground">
                <Crown className="w-4 h-4" />
                Premium Ativo
              </Badge>
            )}
            {!isSubscribed && !isTrialExpired && trialDaysLeft !== null && (
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Clock className="w-4 h-4" />
                {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
              </Badge>
            )}
            {!isSubscribed && isTrialExpired && (
              <Badge variant="destructive" className="gap-2 px-4 py-2">
                <Lock className="w-4 h-4" />
                Acesso Bloqueado
              </Badge>
            )}
          </div>
        </header>

        {/* Hero Section Persuasivo */}
        <section className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8 card-3d p-10">
            <Badge className="mb-4 gap-2 opacity-0 animate-hero-fade-up" variant="secondary" style={{ animationDelay: '0.1s' }}>
              <Zap className="w-4 h-4" />
              Tecnologia de IA Avançada
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pb-2 opacity-0 animate-hero-slide-up" style={{ animationDelay: '0.2s' }}>
              Maximize Seus Lucros com Inteligência Artificial
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-hero-fade-up" style={{ animationDelay: '0.4s' }}>
              Análise em tempo real, decisões inteligentes e lucros maximizados. 
              A calculadora mais avançada do mercado agora ao seu alcance.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <ParallaxCard className="p-6 opacity-0 animate-hero-scale-in" style={{ animationDelay: '0.5s' }}>
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Análise Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  IA analisa seu produto em segundos e entrega insights acionáveis
                </p>
              </ParallaxCard>
              
              <ParallaxCard className="p-6 opacity-0 animate-hero-scale-in" style={{ animationDelay: '0.65s' }}>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Decisões Seguras</h3>
                <p className="text-sm text-muted-foreground">
                  Evite prejuízos com alertas inteligentes e recomendações precisas
                </p>
              </ParallaxCard>
              
              <ParallaxCard className="p-6 opacity-0 animate-hero-scale-in" style={{ animationDelay: '0.8s' }}>
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Resultados 3D</h3>
                <p className="text-sm text-muted-foreground">
                  Interface luxuosa com feedback visual instantâneo de lucro/prejuízo
                </p>
              </ParallaxCard>
            </div>
          </div>
        </section>

        {/* Calculadora ou Bloqueio */}
        <main className="container mx-auto px-4 pb-16">
          {isTrialExpired && !isSubscribed ? (
            <Card className="max-w-4xl mx-auto p-12 text-center card-3d luxury-card border-2 border-primary/50">
              <Lock className="w-24 h-24 text-primary mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Seu Período de Teste Terminou
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Seu período de teste gratuito de 7 dias expirou. 
                Assine agora por apenas R$99/mês e continue maximizando seus lucros!
              </p>
              
              <div className="space-y-4 max-w-md mx-auto mb-8">
                <div className="flex items-center gap-3 text-left">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Análise ilimitada com IA</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Cálculos em tempo real ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte prioritário via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Gerenciamento de fornecedores</span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <div className="text-4xl font-bold text-primary mb-2">R$ 99<span className="text-lg">/mês</span></div>
                <p className="text-sm text-muted-foreground">Renovação mensal • Cancele quando quiser</p>
              </div>

              <Button 
                size="lg" 
                onClick={handleUpgrade}
                className="text-lg px-8 py-6 shadow-3d hover:scale-105 transition-transform btn-premium"
              >
                <Crown className="w-5 h-5 mr-2" />
                Assinar via WhatsApp
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                📱 Você será redirecionado para o WhatsApp para concluir o pagamento
              </p>
              
              <div className="mt-6 p-4 bg-card/50 rounded-lg text-sm text-muted-foreground">
                <p><strong>Email cadastrado:</strong> {user?.email}</p>
                <p className="mt-1">Use este email para confirmar sua identidade</p>
              </div>
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

        {/* Seção de Busca Inteligente */}
        <section className="container mx-auto px-4 py-12">
          <ParallaxCard className="cascade-init animate-cascade-glow">
            <SmartProductSearch />
          </ParallaxCard>
        </section>

        {/* Seção de Fornecedores */}
        <section className="container mx-auto px-4 py-12">
          <ParallaxCard className="p-6 cascade-init animate-cascade-glow">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold">Meus Fornecedores</h3>
            </div>
            <SupplierManager />
          </ParallaxCard>
        </section>

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
