import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    title: "👋 Bem-vindo ao Lucro Mais!",
    description: "A calculadora premium para análise de lucro em marketplaces brasileiros. Vamos te mostrar como usar!",
    icon: "🎯",
  },
  {
    title: "📝 Preencha os Dados do Produto",
    description: "Insira o nome, categoria, preço de custo e venda do seu produto. Não esqueça do valor do frete!",
    icon: "💰",
  },
  {
    title: "🏪 Escolha o Marketplace",
    description: "Selecione onde você vende (Mercado Livre, Amazon, Shopee, etc.) e o tipo de plano que você usa.",
    icon: "📊",
  },
  {
    title: "✨ Veja Resultados Detalhados",
    description: "Analise seu lucro líquido, margem, taxas detalhadas e um gráfico visual da composição de custos.",
    icon: "📈",
  },
  {
    title: "🔄 Compare e Exporte",
    description: "Compare o mesmo produto em diferentes marketplaces e exporte seus relatórios em PDF ou Excel!",
    icon: "🚀",
  },
];

export const OnboardingTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Mostrar tutorial apenas na primeira visita
    const hasSeenTutorial = localStorage.getItem("lucro_mais_tutorial_seen");
    if (!hasSeenTutorial) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("lucro_mais_tutorial_seen", "true");
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        
        <DialogHeader>
          <div className="text-6xl mb-4 text-center animate-scale-in">{step.icon}</div>
          <DialogTitle className="text-2xl text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 py-4">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {currentStep === TUTORIAL_STEPS.length - 1 ? "Começar!" : "Próximo"}
            {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>

        <button
          onClick={handleClose}
          className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors"
        >
          Pular tutorial
        </button>
      </DialogContent>
    </Dialog>
  );
};
