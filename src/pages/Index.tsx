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
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Calculator, TrendingUp, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, saveProduct, deleteProduct, clearAllProducts, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useUserSettings();
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="text-center">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando sistema...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Efeitos de fundo 3D */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-profit/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>
      
      <OnboardingTutorial />
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6 card-3d">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium animate-scale-in shadow-3d card-3d-content border border-primary/20">
            <TrendingUp className="w-4 h-4 animate-bounce" />
            <span>Análise Profissional de Lucro com IA 🤖</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight card-3d-content drop-shadow-2xl">
            Lucro Mais
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto card-3d-content backdrop-blur-sm">
            ✨ IA integrada analisa em tempo real todos os marketplaces 24/7. Preços, concorrência, embalagem, ADS, custos operacionais e Simples Nacional tudo automatizado.
          </p>
        </div>
      </section>

      {/* Main Content */}
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
