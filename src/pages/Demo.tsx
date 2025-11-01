import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/ProductForm";
import { ResultCard } from "@/components/ResultCard";
import { ProductData } from "@/types/calculator";
import { Sparkles, Clock, TrendingUp, Shield, Zap, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Demo = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isLoadingTrial, setIsLoadingTrial] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkTrialStatus();
    }
  }, [user, loading, navigate]);

  const checkTrialStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at, subscription_plan")
        .eq("id", user?.id)
        .single();

      if (!profile) return;

      // Se já é assinante premium, libera acesso total
      if (profile.subscription_plan === "premium") {
        setIsTrialExpired(false);
        setTrialDaysLeft(null);
        setIsLoadingTrial(false);
        return;
      }

      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysLeft = 7 - diffDays;

      setTrialDaysLeft(daysLeft);
      setIsTrialExpired(daysLeft <= 0);
      setIsLoadingTrial(false);

      if (daysLeft <= 3 && daysLeft > 0) {
        toast({
          title: "⏰ Trial acabando!",
          description: `Restam apenas ${daysLeft} dias do seu período de teste.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar trial:", error);
      setIsLoadingTrial(false);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: "💎 Upgrade para Premium",
      description: "Funcionalidade de pagamento será implementada em breve!",
    });
  };

  const handleCalculate = (product: ProductData) => {
    if (isTrialExpired) {
      toast({
        title: "⚠️ Trial Expirado",
        description: "Faça upgrade para continuar calculando!",
        variant: "destructive",
      });
      return;
    }
    setCurrentProduct(product);
  };

  if (loading || isLoadingTrial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background 3D Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10">
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
          <div className="max-w-4xl mx-auto space-y-6 card-3d p-8">
            <Badge className="mb-4 gap-2" variant="secondary">
              <Zap className="w-4 h-4" />
              Tecnologia de IA Avançada
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Maximize Seus Lucros com Inteligência Artificial
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Análise em tempo real, decisões inteligentes e lucros maximizados. 
              A calculadora mais avançada do mercado agora ao seu alcance.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 card-3d hover:scale-105 transition-transform">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Análise Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  IA analisa seu produto em segundos e entrega insights acionáveis
                </p>
              </Card>
              
              <Card className="p-6 card-3d hover:scale-105 transition-transform">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Decisões Seguras</h3>
                <p className="text-sm text-muted-foreground">
                  Evite prejuízos com alertas inteligentes e recomendações precisas
                </p>
              </Card>
              
              <Card className="p-6 card-3d hover:scale-105 transition-transform">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Resultados 3D</h3>
                <p className="text-sm text-muted-foreground">
                  Interface luxuosa com feedback visual instantâneo de lucro/prejuízo
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Calculadora Integrada ou Bloqueio */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {isTrialExpired ? (
              <Card className="p-12 text-center card-3d luxury-card border-2 border-destructive/50">
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
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2">
                    Experimente Agora - Grátis por 7 Dias
                  </h3>
                  <p className="text-muted-foreground">
                    Use todas as funcionalidades premium sem compromisso
                  </p>
                </div>
                
                <ProductForm onCalculate={handleCalculate} />
                
                {currentProduct && (
                  <div className="mt-8 animate-fade-in">
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
            )}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-8">
              Junte-se a milhares de empreendedores
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">+5.000</div>
                <div className="text-muted-foreground">Usuários ativos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">R$ 2M+</div>
                <div className="text-muted-foreground">Lucros otimizados</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-muted-foreground">Avaliação média</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Demo;
