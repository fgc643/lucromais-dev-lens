import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CurrencyInput } from "./CurrencyInput";
import { Calculator, Lightbulb } from "lucide-react";
import { MARKETPLACES } from "@/data/marketplaces";
import { calculateReversePrice, formatCurrency } from "@/utils/calculator";
import { toast } from "sonner";
import { Card } from "./ui/card";

export const ReverseCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    desiredProfit: 0,
    costPrice: 0,
    shippingCost: 0,
    marketplace: "",
    plan: "",
  });
  const [result, setResult] = useState<number | null>(null);

  const selectedMarketplace = MARKETPLACES.find((m) => m.name === formData.marketplace);
  const availablePlans = selectedMarketplace ? Object.keys(selectedMarketplace.plans) : [];

  const handleCalculate = () => {
    if (!formData.marketplace || !formData.plan) {
      toast.error("Selecione o marketplace e o plano");
      return;
    }

    if (formData.desiredProfit <= 0 || formData.costPrice <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    try {
      const salePrice = calculateReversePrice(
        formData.desiredProfit,
        formData.costPrice,
        formData.shippingCost,
        formData.marketplace,
        formData.plan
      );

      setResult(salePrice);
      toast.success("Preço calculado com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular o preço");
    }
  };

  const handleReset = () => {
    setFormData({
      desiredProfit: 0,
      costPrice: 0,
      shippingCost: 0,
      marketplace: "",
      plan: "",
    });
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Calculadora Reversa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Calculadora Reversa
          </DialogTitle>
          <DialogDescription>
            Descubra por quanto você precisa vender para atingir o lucro desejado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm">
              <strong>🎯 Como funciona:</strong> Informe quanto você quer lucrar e nós calculamos o
              preço de venda ideal considerando todas as taxas do marketplace!
            </p>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desired-profit">Lucro Desejado (R$)</Label>
                <CurrencyInput
                  id="desired-profit"
                  value={formData.desiredProfit}
                  onChange={(value) => setFormData({ ...formData, desiredProfit: value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost-price">Custo do Produto (R$)</Label>
                <CurrencyInput
                  id="cost-price"
                  value={formData.costPrice}
                  onChange={(value) => setFormData({ ...formData, costPrice: value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping-cost">Custo de Frete (R$)</Label>
                <CurrencyInput
                  id="shipping-cost"
                  value={formData.shippingCost}
                  onChange={(value) => setFormData({ ...formData, shippingCost: value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketplace-select">Marketplace</Label>
                <Select
                  value={formData.marketplace}
                  onValueChange={(value) => setFormData({ ...formData, marketplace: value, plan: "" })}
                >
                  <SelectTrigger id="marketplace-select">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {MARKETPLACES.map((mp) => (
                      <SelectItem key={mp.name} value={mp.name}>
                        {mp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-select">Plano</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
                disabled={!formData.marketplace}
              >
                <SelectTrigger id="plan-select">
                  <SelectValue placeholder="Selecione o marketplace primeiro" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Preço
            </Button>
            <Button onClick={handleReset} variant="outline">
              Limpar
            </Button>
          </div>

          {/* Resultado */}
          {result !== null && (
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 animate-scale-in">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Você deve vender por:</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(result)}</p>
                <div className="pt-4 space-y-1 text-sm text-muted-foreground">
                  <p>Com este preço você terá:</p>
                  <p className="text-success font-semibold text-base">
                    {formatCurrency(formData.desiredProfit)} de lucro líquido
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Dica */}
          <div className="p-3 bg-info/10 border border-info/30 rounded-lg text-sm">
            <p>
              <strong>💡 Dica:</strong> Considere a competitividade do mercado ao definir seu preço.
              Às vezes, é melhor ter uma margem menor e vender mais!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
