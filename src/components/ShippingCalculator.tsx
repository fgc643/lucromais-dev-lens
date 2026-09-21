import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Truck, MapPin, Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductData } from "@/types/calculator";
import { calculateProfit, formatCurrency, formatPercentage } from "@/utils/calculator";

interface ShippingOption {
  id: string;
  carrier: string;
  service: string;
  price: number;
  days: number;
  note: string;
}

interface ShippingResult {
  origin: { cep: string; city: string; uf: string; neighborhood: string; street: string };
  destination: { cep: string; city: string; uf: string; neighborhood: string; street: string };
  billedWeight: number;
  realWeight: number;
  cubedWeight: number;
  insurance: number;
  options: ShippingOption[];
  reference: string;
}

interface Props {
  products: ProductData[];
}

const maskCep = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export const ShippingCalculator = ({ products }: Props) => {
  const [originCep, setOriginCep] = useState("");
  const [destCep, setDestCep] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [dims, setDims] = useState({ length: "20", width: "15", height: "10" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const declaredValue = products.length
    ? products.reduce((sum, p) => sum + p.salePrice, 0) / products.length
    : 0;

  const handleCalculate = async () => {
    if (originCep.replace(/\D/g, "").length !== 8 || destCep.replace(/\D/g, "").length !== 8) {
      toast.error("Informe os dois CEPs completos (8 dígitos).");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-shipping", {
        body: {
          originCep,
          destCep,
          weight: Number(weight.replace(",", ".")) || 0,
          length: Number(dims.length) || 20,
          width: Number(dims.width) || 15,
          height: Number(dims.height) || 10,
          declaredValue,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setResult(data as ShippingResult);
      setSelected((data as ShippingResult).options[0]?.id ?? null);
      toast.success("Frete calculado com sucesso!");
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível calcular o frete agora.");
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = result?.options.find((o) => o.id === selected) ?? null;

  const productRows = (() => {
    if (!selectedOption) return [];
    return products
      .map((product) => {
        try {
          const before = calculateProfit(product);
          const after = calculateProfit({ ...product, shippingCost: selectedOption.price });
          return { product, before, after };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as {
        product: ProductData;
        before: ReturnType<typeof calculateProfit>;
        after: ReturnType<typeof calculateProfit>;
      }[];
  })();

  return (
    <Card className="w-full shadow-3d border-primary/20 luxury-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Frete por CEP e Lucro Líquido
            </p>
            <p className="text-xs text-muted-foreground font-normal">
              Endereço real consultado pelo CEP + tabelas de envio Setembro/2026
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originCep">CEP de origem (de onde você envia)</Label>
            <Input
              id="originCep"
              inputMode="numeric"
              placeholder="00000-000"
              value={originCep}
              onChange={(e) => setOriginCep(maskCep(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destCep">CEP de destino (cliente)</Label>
            <Input
              id="destCep"
              inputMode="numeric"
              placeholder="00000-000"
              value={destCep}
              onChange={(e) => setDestCep(maskCep(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input id="weight" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length">Compr. (cm)</Label>
            <Input id="length" inputMode="numeric" value={dims.length} onChange={(e) => setDims({ ...dims, length: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Largura (cm)</Label>
            <Input id="width" inputMode="numeric" value={dims.width} onChange={(e) => setDims({ ...dims, width: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input id="height" inputMode="numeric" value={dims.height} onChange={(e) => setDims({ ...dims, height: e.target.value })} />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={loading} className="w-full btn-3d" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Consultando CEP e calculando...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-5 w-5" /> Calcular Frete
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> Origem
                </p>
                <p className="font-semibold">{result.origin.city} - {result.origin.uf}</p>
                <p className="text-xs text-muted-foreground">
                  {[result.origin.street, result.origin.neighborhood].filter(Boolean).join(", ") || result.origin.cep}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> Destino
                </p>
                <p className="font-semibold">{result.destination.city} - {result.destination.uf}</p>
                <p className="text-xs text-muted-foreground">
                  {[result.destination.street, result.destination.neighborhood].filter(Boolean).join(", ") || result.destination.cep}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" /> Peso real {result.realWeight} kg
              </Badge>
              <Badge variant="secondary">Peso cubado {result.cubedWeight} kg</Badge>
              <Badge variant="default">Peso taxado {result.billedWeight} kg</Badge>
              {result.insurance > 0 && <Badge variant="outline">Seguro {formatCurrency(result.insurance)}</Badge>}
            </div>

            <div className="space-y-3">
              <p className="font-bold text-lg">Opções de envio</p>
              {result.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected === option.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-secondary/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{option.service}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.carrier} • até {Math.max(option.days, 1)} dia(s) úteis • {option.note}
                      </p>
                    </div>
                    <p className="text-xl font-black text-primary whitespace-nowrap">
                      {formatCurrency(option.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="font-bold text-lg">Lucro líquido por produto com este frete</p>
              {productRows.length === 0 ? (
                <div className="p-4 rounded-xl border border-border bg-secondary/40 text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cadastre um produto na calculadora para ver o impacto do frete no lucro.
                </div>
              ) : (
                productRows.map(({ product, before, after }) => {
                  const diff = after.netProfit - before.netProfit;
                  const positive = after.netProfit > 0;
                  return (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl border border-border bg-secondary/40 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-[160px]">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.marketplace} • {product.plan} • venda {formatCurrency(product.salePrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Frete aplicado</p>
                        <p className="font-semibold">{formatCurrency(selectedOption?.price ?? 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Lucro líquido</p>
                        <p className={`text-xl font-black ${positive ? "text-profit" : "text-loss"}`}>
                          {formatCurrency(after.netProfit)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Margem {formatPercentage(after.profitMargin)} • {diff >= 0 ? "+" : ""}
                          {formatCurrency(diff)} vs. frete salvo
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-xs text-muted-foreground">{result.reference}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
