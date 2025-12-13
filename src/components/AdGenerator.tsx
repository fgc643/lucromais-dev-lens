import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Wand2,
  Tag,
  FileText,
  Megaphone
} from "lucide-react";

interface AdData {
  titulo: string;
  subtitulo: string;
  descricao: string;
  bullets: string[];
  callToAction: string;
  tags: string[];
}

interface AdGeneratorProps {
  productName: string;
  category: string;
  marketplace: string;
  salePrice: number;
  features?: string;
}

export const AdGenerator = ({ 
  productName, 
  category, 
  marketplace, 
  salePrice,
  features 
}: AdGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adData, setAdData] = useState<AdData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [extraFeatures, setExtraFeatures] = useState(features || "");

  const generateAd = async () => {
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

      if (error) throw error;

      if (data?.ad) {
        setAdData(data.ad);
        toast({
          title: "🎉 Anúncio Gerado!",
          description: "Seu anúncio persuasivo está pronto. Copie e cole no marketplace!",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Erro ao gerar anúncio:', error);
      toast({
        title: "Erro ao gerar anúncio",
        description: error.message || "Tente novamente em alguns segundos.",
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

  const copyFullAd = async () => {
    if (!adData) return;

    const fullAd = `${adData.titulo}

${adData.subtitulo}

${adData.descricao}

${adData.bullets.map(b => `✅ ${b}`).join('\n')}

${adData.callToAction}

Tags: ${adData.tags.join(', ')}`;

    await copyToClipboard(fullAd, 'full');
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

  return (
    <Card className="card-3d luxury-card border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Megaphone className="w-6 h-6 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerador de Anúncios IA
          </span>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Persuasivo
          </Badge>
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

        {/* Botão de gerar */}
        <Button
          onClick={generateAd}
          disabled={loading || !productName || !marketplace}
          className="w-full h-12 text-lg font-bold shadow-3d hover:scale-[1.02] transition-transform"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando anúncio persuasivo...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Gerar Anúncio com IA
            </>
          )}
        </Button>

        {/* Resultado do anúncio */}
        {adData && (
          <div className="space-y-4 mt-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Seu Anúncio Pronto
              </h3>
              <Button onClick={copyFullAd} variant="outline" size="sm">
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
                <CopyButton text={adData.titulo} field="titulo" />
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-bold text-lg">{adData.titulo}</p>
              </div>
            </div>

            {/* Subtítulo */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Subtítulo
                </Label>
                <CopyButton text={adData.subtitulo} field="subtitulo" />
              </div>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="font-medium">{adData.subtitulo}</p>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Descrição
                </Label>
                <CopyButton text={adData.descricao} field="descricao" />
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border whitespace-pre-wrap">
                {adData.descricao}
              </div>
            </div>

            {/* Bullets */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Benefícios
                </Label>
                <CopyButton 
                  text={adData.bullets.map(b => `✅ ${b}`).join('\n')} 
                  field="bullets" 
                />
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
                {adData.bullets.map((bullet, index) => (
                  <p key={index} className="flex items-start gap-2">
                    <span className="text-green-500">✅</span>
                    <span>{bullet}</span>
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
                <CopyButton text={adData.callToAction} field="cta" />
              </div>
              <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-primary/30 text-center">
                <p className="font-bold text-lg">{adData.callToAction}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Tags / Palavras-chave
                </Label>
                <CopyButton text={adData.tags.join(', ')} field="tags" />
              </div>
              <div className="flex flex-wrap gap-2">
                {adData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dica */}
        {!adData && (
          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p>
              Preencha os dados do produto acima e clique em <strong>Gerar Anúncio</strong> 
              para criar um anúncio persuasivo otimizado para o marketplace selecionado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
