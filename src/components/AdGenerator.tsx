import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { aiFunctionErrorMessage } from '@/lib/ai-function-error';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Wand2,
  Tag,
  FileText,
  Megaphone,
  Zap,
  Users,
  Clock,
  Crown,
  FlaskConical
} from "lucide-react";

interface AdVersion {
  titulo: string;
  subtitulo: string;
  descricao: string;
  bullets: string[];
  callToAction: string;
  tags: string[];
  gatilhos?: string[];
}

interface AdData {
  versaoA: AdVersion;
  versaoB: AdVersion;
}

interface AdGeneratorProps {
  productName: string;
  category: string;
  marketplace: string;
  salePrice: number;
  features?: string;
}

const gatilhoIcons: Record<string, React.ReactNode> = {
  escassez: <Zap className="w-3 h-3" />,
  urgência: <Clock className="w-3 h-3" />,
  urgencia: <Clock className="w-3 h-3" />,
  prova_social: <Users className="w-3 h-3" />,
  autoridade: <Crown className="w-3 h-3" />,
};

const gatilhoColors: Record<string, string> = {
  escassez: "bg-red-500/20 text-red-400 border-red-500/30",
  urgência: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgencia: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  prova_social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  autoridade: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export const AdGenerator = ({ 
  productName, 
  category, 
  marketplace, 
  salePrice,
  features 
}: AdGeneratorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adData, setAdData] = useState<AdData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [extraFeatures, setExtraFeatures] = useState(features || "");
  const [activeVersion, setActiveVersion] = useState<"A" | "B">("A");

  const generateAd = async () => {
    if (!user) {
      toast({ title: 'Login necessário', description: 'Faça login para usar a IA', variant: 'destructive' });
      return;
    }
    if (!productName || !marketplace) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o nome do produto e selecione o marketplace primeiro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ad', {
        body: {
          productName,
          category,
          marketplace,
          salePrice,
          features: extraFeatures,
        },
      });

      if (error) {
        toast({ title: 'Erro ao gerar anúncio', description: await aiFunctionErrorMessage(error), variant: 'destructive' });
        return;
      }

      if (data?.ad) {
        // Handle both new A/B format and legacy format
        if (data.ad.versaoA && data.ad.versaoB) {
          setAdData(data.ad);
        } else {
          // Convert legacy format to A/B format
          setAdData({
            versaoA: { ...data.ad, gatilhos: ['escassez', 'urgência'] },
            versaoB: { ...data.ad, gatilhos: ['prova_social', 'autoridade'] }
          });
        }
        toast({
          title: "🎉 Anúncios A/B Gerados!",
          description: "2 versões persuasivas prontas para testar. Compare e escolha a melhor!",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      console.error('Erro ao gerar anúncio:', error);
      toast({
        title: "Erro ao gerar anúncio",
        description: 'Não foi possível gerar o anúncio. Tente novamente mais tarde.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "✅ Copiado!",
        description: "Texto copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const copyFullAd = async (version: AdVersion, versionName: string) => {
    const fullAd = `${version.titulo}

${version.subtitulo}

${version.descricao}

${version.bullets.map(b => b.startsWith('✅') || b.startsWith('🔥') || b.startsWith('⭐') ? b : `✅ ${b}`).join('\n')}

${version.callToAction}

Tags: ${version.tags.join(', ')}`;

    await copyToClipboard(fullAd, `full-${versionName}`);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-8 w-8 p-0"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const renderAdVersion = (version: AdVersion, versionName: "A" | "B") => (
    <div className="space-y-4 animate-fade-in">
      {/* Gatilhos usados */}
      {version.gatilhos && version.gatilhos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-1">Gatilhos:</span>
          {version.gatilhos.map((gatilho, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`text-xs flex items-center gap-1 ${gatilhoColors[gatilho] || 'bg-primary/20 text-primary'}`}
            >
              {gatilhoIcons[gatilho]}
              {gatilho.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Versão {versionName}
        </h3>
        <Button onClick={() => copyFullAd(version, versionName)} variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Tudo
        </Button>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Título
          </Label>
          <CopyButton text={version.titulo} field={`titulo-${versionName}`} />
        </div>
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="font-bold text-lg">{version.titulo}</p>
        </div>
      </div>

      {/* Subtítulo */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Subtítulo
          </Label>
          <CopyButton text={version.subtitulo} field={`subtitulo-${versionName}`} />
        </div>
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="font-medium">{version.subtitulo}</p>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Descrição
          </Label>
          <CopyButton text={version.descricao} field={`descricao-${versionName}`} />
        </div>
        <div className="p-4 bg-muted/50 rounded-lg border whitespace-pre-wrap">
          {version.descricao}
        </div>
      </div>

      {/* Bullets */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Benefícios
          </Label>
          <CopyButton 
            text={version.bullets.map(b => b.startsWith('✅') || b.startsWith('🔥') || b.startsWith('⭐') ? b : `✅ ${b}`).join('\n')} 
            field={`bullets-${versionName}`} 
          />
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
          {version.bullets.map((bullet, index) => (
            <p key={index} className="flex items-start gap-2">
              {bullet.startsWith('✅') || bullet.startsWith('🔥') || bullet.startsWith('⭐') ? (
                <span>{bullet}</span>
              ) : (
                <>
                  <span className="text-green-500">✅</span>
                  <span>{bullet}</span>
                </>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Call to Action
          </Label>
          <CopyButton text={version.callToAction} field={`cta-${versionName}`} />
        </div>
        <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-primary/30 text-center">
          <p className="font-bold text-lg">{version.callToAction}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Tags / Palavras-chave
          </Label>
          <CopyButton text={version.tags.join(', ')} field={`tags-${versionName}`} />
        </div>
        <div className="flex flex-wrap gap-2">
          {version.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-sm">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="card-3d luxury-card border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Megaphone className="w-6 h-6 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerador de Anúncios IA
          </span>
          <div className="ml-auto flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Persuasivo
            </Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-xs">
              <FlaskConical className="w-3 h-3 mr-1" />
              Teste A/B
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input de características extras */}
        <div className="space-y-2">
          <Label htmlFor="features" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Características do Produto (opcional)
          </Label>
          <Textarea
            id="features"
            placeholder="Ex: Material premium, garantia de 1 ano, entrega expressa, cor azul..."
            value={extraFeatures}
            onChange={(e) => setExtraFeatures(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Gatilhos mentais info */}
        <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-sm font-medium flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Gatilhos Mentais Incluídos:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Escassez
            </Badge>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Urgência
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Users className="w-3 h-3 mr-1" />
              Prova Social
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Crown className="w-3 h-3 mr-1" />
              Autoridade
            </Badge>
          </div>
        </div>

        {/* Botão de gerar */}
        <Button
          onClick={generateAd}
          disabled={loading || !productName || !marketplace}
          className="w-full h-12 text-lg font-bold shadow-3d hover:scale-[1.02] transition-transform bg-gradient-to-r from-primary to-accent"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando 2 anúncios persuasivos...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Gerar Anúncios A/B com IA
            </>
          )}
        </Button>

        {/* Resultado do anúncio com abas A/B */}
        {adData && (
          <div className="mt-6">
            <Tabs value={activeVersion} onValueChange={(v) => setActiveVersion(v as "A" | "B")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="A" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  Versão A - Escassez
                </TabsTrigger>
                <TabsTrigger value="B" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Versão B - Autoridade
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="A">
                {renderAdVersion(adData.versaoA, "A")}
              </TabsContent>
              
              <TabsContent value="B">
                {renderAdVersion(adData.versaoB, "B")}
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Dica:</strong> Teste as duas versões no marketplace e veja qual converte mais vendas!
              </p>
            </div>
          </div>
        )}

        {/* Dica */}
        {!adData && (
          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p>
              Preencha os dados do produto acima e clique em <strong>Gerar Anúncios A/B</strong> 
              para criar 2 versões persuasivas otimizadas para testar qual converte mais!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
