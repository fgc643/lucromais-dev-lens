import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CurrencyInput } from "./CurrencyInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Calculator, HelpCircle, Loader2 } from "lucide-react";
import { ProductData } from "@/types/calculator";
import { MARKETPLACES, CATEGORIES, INSTALLMENT_OPTIONS } from "@/data/marketplaces";
import { calculateProfit } from "@/utils/calculator";
import { saveToHistory } from "@/utils/storage";
import { toast } from "sonner";

interface ProductFormProps {
  onCalculate: (product: ProductData) => void;
}

export const ProductForm = ({ onCalculate }: ProductFormProps) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    costPrice: 0,
    salePrice: 0,
    shippingCost: 0,
    installments: "1x",
    marketplace: "",
    plan: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const selectedMarketplace = MARKETPLACES.find((m) => m.name === formData.marketplace);
  const availablePlans = selectedMarketplace ? Object.keys(selectedMarketplace.plans) : [];

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.category) newErrors.category = "Selecione uma categoria";
    if (formData.costPrice <= 0) newErrors.costPrice = "Custo deve ser maior que zero";
    if (formData.salePrice <= 0) newErrors.salePrice = "Preço de venda deve ser maior que zero";
    if (formData.salePrice <= formData.costPrice) {
      newErrors.salePrice = "Preço de venda deve ser maior que o custo";
    }
    if (formData.shippingCost < 0) newErrors.shippingCost = "Frete não pode ser negativo";
    if (!formData.marketplace) newErrors.marketplace = "Selecione um marketplace";
    if (!formData.plan) newErrors.plan = "Selecione um plano";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsCalculating(true);

    // Simular processamento para mostrar loading
    setTimeout(() => {
      try {
        const productData: ProductData = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
        };

        const results = calculateProfit(productData);
        productData.results = results;

        saveToHistory(productData);
        onCalculate(productData);

        toast.success("Cálculo realizado com sucesso!", {
          description: `Lucro líquido: ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(results.netProfit)}`,
        });
      } catch (error) {
        toast.error("Erro ao calcular. Tente novamente.");
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  };

  const handleMarketplaceChange = (value: string) => {
    setFormData({ ...formData, marketplace: value, plan: "" });
    setErrors({ ...errors, marketplace: "", plan: "" });
  };

  return (
    <Card className="w-full shadow-elevated border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-primary" />
          Nova Análise de Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Nome do Produto
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Digite o nome completo ou identificação do produto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Fone Bluetooth"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  setErrors({ ...errors, category: "" });
                }}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-popover z-50">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="flex items-center gap-2">
                Preço de Custo (R$)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Quanto você paga pelo produto (incluindo impostos)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <CurrencyInput
                id="costPrice"
                value={formData.costPrice}
                onChange={(value) => {
                  setFormData({ ...formData, costPrice: value });
                  setErrors({ ...errors, costPrice: "" });
                }}
                className={errors.costPrice ? "border-destructive" : ""}
              />
              {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
              <CurrencyInput
                id="salePrice"
                value={formData.salePrice}
                onChange={(value) => {
                  setFormData({ ...formData, salePrice: value });
                  setErrors({ ...errors, salePrice: "" });
                }}
                className={errors.salePrice ? "border-destructive" : ""}
              />
              {errors.salePrice && <p className="text-sm text-destructive">{errors.salePrice}</p>}
            </div>
          </div>

          {/* Frete e Parcelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingCost" className="flex items-center gap-2">
                Frete Pago (R$)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Valor que você paga de frete ao enviar o produto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <CurrencyInput
                id="shippingCost"
                value={formData.shippingCost}
                onChange={(value) => setFormData({ ...formData, shippingCost: value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select
                value={formData.installments}
                onValueChange={(value) => setFormData({ ...formData, installments: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {INSTALLMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Marketplace e Plano */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select value={formData.marketplace} onValueChange={handleMarketplaceChange}>
                <SelectTrigger className={errors.marketplace ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione o marketplace" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-popover z-50">
                  {MARKETPLACES.map((mp) => (
                    <SelectItem key={mp.name} value={mp.name}>
                      {mp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.marketplace && (
                <p className="text-sm text-destructive">{errors.marketplace}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano/Tipo</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => {
                  setFormData({ ...formData, plan: value });
                  setErrors({ ...errors, plan: "" });
                }}
                disabled={!formData.marketplace}
              >
                <SelectTrigger className={errors.plan ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plan && <p className="text-sm text-destructive">{errors.plan}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-glow"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-5 w-5" />
                Calcular Lucro
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
