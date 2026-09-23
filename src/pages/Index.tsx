import { useState, useEffect, lazy, Suspense } from "react";
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
import { Calculator, TrendingUp, Loader2, Sparkles, Shield, Zap, Users, Search, Settings, BarChart3 } from "lucide-react";
import { GoldenParticles } from "@/components/GoldenParticles";
import { SupplierManager } from "@/components/SupplierManager";
import { ShippingCalculator } from "@/components/ShippingCalculator";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, saveProduct, deleteProduct, clearAllProducts, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useUserSettings();
  const { toast } = useToast();
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
    }
  };

  const handleCalculate = async (product: ProductData) => {
    setCurrentProduct(product);
    if (user) {
      await saveProduct(product);
      setHistoryRefreshTrigger((prev) => prev + 1);
    }
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

  if (authLoading || productsLoading || settingsLoading) {
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
      {/* Golden Particles Effect - Only on desktop */}
      {!isMobile && <GoldenParticles />}
      
      {/* Background Premium Effects - Simplified for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 rounded-full ${isMobile ? 'w-[200px] h-[200px] blur-[50px]' : 'w-[400px] h-[400px] blur-[80px]'} bg-[hsl(42,100%,50%,0.04)]`}></div>
        <div className={`absolute bottom-0 right-1/4 rounded-full ${isMobile ? 'w-[250px] h-[250px] blur-[60px]' : 'w-[500px] h-[500px] blur-[100px]'} bg-[hsl(280,60%,50%,0.03)]`}></div>
      </div>

      {/* Mesh Gradient Overlay - Hidden on mobile for performance */}
      {!isMobile && <div className="absolute inset-0 bg-mesh pointer-events-none"></div>}

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
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/admin")}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-8">
              <ProductForm onCalculate={handleCalculate} />

              {currentProduct && (
                <div className="animate-fade-in">
                  <ResultCard product={currentProduct} />
                </div>
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
        </main>


        {/* Seção de Frete por CEP */}
        <section className="container mx-auto px-4 py-12">
          <ParallaxCard className="cascade-init animate-cascade-glow">
            <ShippingCalculator products={products} />
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
