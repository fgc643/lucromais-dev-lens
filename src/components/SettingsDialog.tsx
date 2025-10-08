import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { CurrencyInput } from "./CurrencyInput";
import { useUserSettings } from "@/hooks/useUserSettings";

export const SettingsDialog = () => {
  const { settings, updateSettings, loading } = useUserSettings();
  const [packagingCost, setPackagingCost] = useState(0);
  const [adsPercentage, setAdsPercentage] = useState(0);
  const [operationalCost, setOperationalCost] = useState(0);
  const [simplesRate, setSimplesRate] = useState(0);

  useEffect(() => {
    if (!loading) {
      setPackagingCost(settings.default_packaging_cost);
      setAdsPercentage(settings.default_ads_percentage);
      setOperationalCost(settings.default_operational_cost);
      setSimplesRate(settings.default_simples_nacional_rate);
    }
  }, [settings, loading]);

  const handleSave = () => {
    updateSettings({
      default_packaging_cost: packagingCost,
      default_ads_percentage: adsPercentage,
      default_operational_cost: operationalCost,
      default_simples_nacional_rate: simplesRate,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="hover-scale">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações Padrão</DialogTitle>
          <DialogDescription>
            Defina valores padrão que serão aplicados automaticamente em novos cálculos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="packaging">Custo de Embalagem (R$)</Label>
            <CurrencyInput
              id="packaging"
              value={packagingCost}
              onChange={setPackagingCost}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Custo médio de caixas, plástico bolha, fitas, etiquetas, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ads">Custo de ADS (%)</Label>
            <CurrencyInput
              id="ads"
              value={adsPercentage}
              onChange={setAdsPercentage}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Percentual do preço de venda gasto com anúncios
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operational">Custo Operacional (R$)</Label>
            <CurrencyInput
              id="operational"
              value={operationalCost}
              onChange={setOperationalCost}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Custos fixos: luz, internet, funcionários, aluguel, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="simples">Simples Nacional (%)</Label>
            <CurrencyInput
              id="simples"
              value={simplesRate}
              onChange={setSimplesRate}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Alíquota do Simples Nacional (varia de 4% a 15,5%)
            </p>
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
