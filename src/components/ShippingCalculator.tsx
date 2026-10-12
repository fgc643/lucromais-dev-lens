import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, Truck, MapPin, Package, AlertCircle, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductData } from "@/types/calculator";
import { calculateProfit, formatCurrency, formatPercentage } from "@/utils/calculator";
import { MARKETPLACES } from "@/data/marketplaces";
import {
  BASE_TABLE,
  CEP_RANGES,
  ZONE_LABEL,
  Zone,
  cubedWeight,
  findCepRange,
  formatCepRange,
  getShippingOptionsFor,
  getZone,
  quoteShipping,
} from "@/data/shipping";

interface AddressInfo {
  cep: string;
  city: string;
  uf: string;
  neighborhood: string;
  street: string;
}

interface Props {
  products: ProductData[];
  currentProduct?: ProductData | null;
  onApplyShipping?: (service: string, sellerPrice: number) => void;
}

const maskCep = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export const ShippingCalculator = ({ products, currentProduct, onApplyShipping }: Props) => {
  const [originCep, setOriginCep] = useState("");
  const [destCep, setDestCep] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [dims, setDims] = useState({ length: "20", width: "15", height: "10" });
  const [marketplace, setMarketplace] = useState("Mercado Livre");
  const [salePrice, setSalePrice] = useState("129");
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<AddressInfo | null>(null);
  const [destination, setDestination] = useState<AddressInfo | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // Produto em cálculo: marketplace, preço e opção de frete vêm dele automaticamente
  const linked = !!currentProduct;
  const activeMarketplace = currentProduct?.marketplace ?? marketplace;
  const planShippingDiscount = currentProduct
    ? MARKETPLACES.find((m) => m.name === currentProduct.marketplace)?.plans[currentProduct.plan]?.shippingDiscount ?? 0
    : 0;
  useEffect(() => {
    setSelected(currentProduct?.shippingService ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct?.id, currentProduct?.marketplace]);

  const numbers = {
    weight: Number(weight.replace(",", ".")) || 0,
    length: Number(dims.length) || 20,
    width: Number(dims.width) || 15,
    height: Number(dims.height) || 10,
    salePrice: currentProduct ? currentProduct.salePrice : Number(salePrice.replace(",", ".")) || 0,
  };

  const originRange = findCepRange(originCep);
  const destRange = findCepRange(destCep);
  const zone: Zone =
    originRange && destRange ? getZone(originRange.region, destRange.region) : 1;

  const options = useMemo(() => getShippingOptionsFor(activeMarketplace), [activeMarketplace]);

  const quotes = useMemo(
    () =>
      options.map((option) =>
        quoteShipping({
          option,
          zone,
          weight: numbers.weight,
          length: numbers.length,
          width: numbers.width,
          height: numbers.height,
          salePrice: numbers.salePrice,
          planShippingDiscount,
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, zone, weight, dims.length, dims.width, dims.height, numbers.salePrice, planShippingDiscount]
  );

  const selectedQuote = quotes.find((q) => q.service === selected) ?? quotes[0] ?? null;

  useEffect(() => {
    if (currentProduct && selectedQuote && onApplyShipping) {
      onApplyShipping(selectedQuote.service, selectedQuote.sellerPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct?.id, selectedQuote?.service, selectedQuote?.sellerPrice]);

  const billedWeight = Math.max(
    numbers.weight,
    cubedWeight(numbers.length, numbers.width, numbers.height)
  );

  const handleCalculate = async () => {
    if (originCep.replace(/\D/g, "").length !== 8 || destCep.replace(/\D/g, "").length !== 8) {
      toast.error("Informe os dois CEPs completos (8 dígitos).");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-shipping", {
        body: {
          originCep,
          destCep,
          weight: numbers.weight,
          length: numbers.length,
          width: numbers.width,
          height: numbers.height,
          declaredValue: numbers.salePrice,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setOrigin(data.origin);
      setDestination(data.destination);
      setSelected(null);
      toast.success("Endereços confirmados e tabela de frete atualizada!");
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível consultar os CEPs agora.");
    } finally {
      setLoading(false);
    }
  };

  /** Tabela por faixa de CEP: preço do serviço escolhido para cada estado de destino. */
  const cepTable = useMemo(() => {
    if (!originRange || !selectedQuote) return [];
    const option = options.find((o) => o.service === selectedQuote.service)!;
    return CEP_RANGES.map((range) => {
      const z = getZone(originRange.region, range.region);
      const q = quoteShipping({
        option,
        zone: z,
        weight: numbers.weight,
        length: numbers.length,
        width: numbers.width,
        height: numbers.height,
        salePrice: numbers.salePrice,
      });
      return { range, zone: z, quote: q };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originRange?.uf, selectedQuote?.service, options, weight, dims, salePrice]);

  const productRows = useMemo(() => {
    return products
      .map((product) => {
        const productOptions = getShippingOptionsFor(product.marketplace);
        const option =
          productOptions.find((o) => o.service === selectedQuote?.service) ?? productOptions[0];
        const q = quoteShipping({
          option,
          zone,
          weight: numbers.weight,
          length: numbers.length,
          width: numbers.width,
          height: numbers.height,
          salePrice: product.salePrice,
        });
        try {
          const before = calculateProfit(product);
          const after = calculateProfit({ ...product, shippingCost: q.sellerPrice });
          return { product, before, after, quote: q };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as {
      product: ProductData;
      before: ReturnType<typeof calculateProfit>;
      after: ReturnType<typeof calculateProfit>;
      quote: ReturnType<typeof quoteShipping>;
    }[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, zone, selectedQuote?.service, weight, dims, salePrice]);

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
              Estimativa baseada na tabela dos Correios; confirme no simulador oficial do marketplace
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
            {originRange && (
              <p className="text-xs text-muted-foreground">
                {originRange.label} ({originRange.uf}) • faixa {formatCepRange(originRange)}
              </p>
            )}
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
            {destRange && (
              <p className="text-xs text-muted-foreground">
                {destRange.label} ({destRange.uf}) • {ZONE_LABEL[zone]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Marketplace</Label>
            <Select disabled={linked} value={activeMarketplace} onValueChange={(v) => { setMarketplace(v); setSelected(null); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {MARKETPLACES.map((m) => (
                  <SelectItem key={m.name} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="salePriceShip">Preço de venda (define se o frete é grátis)</Label>
            <Input id="salePriceShip" inputMode="decimal" disabled={linked} value={linked ? String(numbers.salePrice) : salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
          <Button onClick={handleCalculate} disabled={loading} className="w-full btn-3d" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Consultando CEP...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" /> Confirmar endereços pelo CEP
              </>
            )}
          </Button>
        </div>

        {(origin || destination) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {[origin, destination].map((addr, i) =>
              addr ? (
                <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5" /> {i === 0 ? "Origem" : "Destino"}
                  </p>
                  <p className="font-semibold">{addr.city} - {addr.uf}</p>
                  <p className="text-xs text-muted-foreground">
                    {[addr.street, addr.neighborhood].filter(Boolean).join(", ") || addr.cep}
                  </p>
                </div>
              ) : null
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" /> Peso real {numbers.weight} kg
          </Badge>
          <Badge variant="secondary">
            Cubado {(Math.round(cubedWeight(numbers.length, numbers.width, numbers.height) * 1000) / 1000)} kg
          </Badge>
          <Badge variant="default">Taxado {Math.round(billedWeight * 1000) / 1000} kg</Badge>
          <Badge variant="outline">{ZONE_LABEL[zone]}</Badge>
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">Opções de envio do {activeMarketplace}</p>
          {linked && (
            <p className="text-xs text-muted-foreground">
              Usando o produto <b>{currentProduct!.name}</b> ({currentProduct!.plan}). A opção escolhida vira o frete do detalhamento de custos.
            </p>
          )}
          {quotes.map((q) => (
            <button
              key={q.service}
              type="button"
              onClick={() => setSelected(q.service)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedQuote?.service === q.service
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-secondary/40 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{q.service}</p>
                  <p className="text-xs text-muted-foreground">
                    até {q.days} dia(s) úteis • {q.note}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-xl font-black text-primary">
                    {q.paidBy === "Comprador" ? formatCurrency(q.fullPrice) : formatCurrency(q.sellerPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pago pelo {q.paidBy.toLowerCase()}
                    {q.subsidy > 0 && ` • marketplace cobre ${formatCurrency(q.subsidy)}`}
                    {q.storage > 0 && ` • inclui armazenagem ${formatCurrency(q.storage)}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {cepTable.length > 0 && (
          <div className="space-y-3">
            <p className="font-bold text-lg flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              Tabela de frete por faixa de CEP — {selectedQuote?.service}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Faixa de CEP</th>
                    <th className="p-3 font-semibold">Destino</th>
                    <th className="p-3 font-semibold">Zona</th>
                    <th className="p-3 font-semibold text-right">Frete cheio</th>
                    <th className="p-3 font-semibold text-right">Custo do vendedor</th>
                    <th className="p-3 font-semibold text-right">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {cepTable.map(({ range, zone: z, quote }) => (
                    <tr
                      key={`${range.uf}-${range.from}`}
                      className={`border-t border-border ${
                        destRange && range.from === destRange.from ? "bg-primary/10" : ""
                      }`}
                    >
                      <td className="p-3 font-mono text-xs">{formatCepRange(range)}</td>
                      <td className="p-3">{range.label} ({range.uf})</td>
                      <td className="p-3">{z}</td>
                      <td className="p-3 text-right">{formatCurrency(quote.fullPrice)}</td>
                      <td className="p-3 text-right font-semibold text-primary">
                        {formatCurrency(quote.sellerPrice)}
                      </td>
                      <td className="p-3 text-right">{quote.days} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimativa baseada na tabela dos Correios PAC ({BASE_TABLE.length} faixas de peso, cubagem /6000)
              com os fatores e subsídios de cada marketplace. Ao atualizar as tarifas, esta tabela e o lucro por
              produto mudam juntos.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="font-bold text-lg">Lucro líquido por produto com este frete</p>
          {productRows.length === 0 ? (
            <div className="p-4 rounded-xl border border-border bg-secondary/40 text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Cadastre um produto na calculadora para ver o impacto do frete no lucro.
            </div>
          ) : (
            productRows.map(({ product, before, after, quote }) => {
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
                      {product.marketplace} • {quote.service} • venda {formatCurrency(product.salePrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Frete do vendedor</p>
                    <p className="font-semibold">{formatCurrency(quote.sellerPrice)}</p>
                    <p className="text-xs text-muted-foreground">Pago pelo {quote.paidBy.toLowerCase()}</p>
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
      </CardContent>
    </Card>
  );
};
