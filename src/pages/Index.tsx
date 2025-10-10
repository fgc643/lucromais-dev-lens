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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <OnboardingTutorial />
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium animate-scale-in">
            <TrendingUp className="w-4 h-4" />
            <span>Análise Profissional de Lucro</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
            Lucro Mais
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Análise inteligente com IA em tempo real. Varredura completa em todos os marketplaces 24/7 com embalagem, ADS, custos operacionais e Simples Nacional integrados.
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
      <footer className="border-t border-primary/20 mt-16 py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold mb-2">🚀 Lucro Mais - Sistema Multi-Usuário com IA</p>
          <p className="mb-1">Análise Inteligente 24/7 | Embalagem | ADS | Operacional | Simples Nacional</p>
          <p className="text-xs">Varredura em tempo real em todos os marketplaces com dicas inteligentes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
