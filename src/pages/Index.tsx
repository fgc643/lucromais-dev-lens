import { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { ResultCard } from "@/components/ResultCard";
import { HistoryList } from "@/components/HistoryList";
import { ComparisonModal } from "@/components/ComparisonModal";
import { ReverseCalculator } from "@/components/ReverseCalculator";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { ProductData } from "@/types/calculator";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCalculate = (product: ProductData) => {
    setCurrentProduct(product);
    setRefreshTrigger((prev) => prev + 1);
    
    // Scroll suave para os resultados
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleViewProduct = (product: ProductData) => {
    setCurrentProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTutorial />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Calculadora Premium
                </h1>
                <p className="text-sm text-muted-foreground">Análise de Lucro para Marketplaces</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ReverseCalculator />
              {currentProduct && <ComparisonModal baseProduct={currentProduct} />}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Calcule o lucro líquido e margem de qualquer produto nos principais marketplaces do Brasil
            com precisão profissional
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Análise completa de custos, taxas e rentabilidade em tempo real
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <ProductForm onCalculate={handleCalculate} />
          </div>

          {/* Histórico */}
          <div className="lg:col-span-1">
            <HistoryList onViewProduct={handleViewProduct} triggerRefresh={refreshTrigger} />
          </div>

          {/* Resultados */}
          {currentProduct && (
            <div id="results" className="lg:col-span-3">
              <ResultCard product={currentProduct} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Lucro Mais - Calculadora Premium de Marketplaces</p>
          <p className="mt-2">Todos os cálculos são estimativas baseadas nas taxas atuais dos marketplaces.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
