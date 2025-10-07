import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { History, Trash2, Eye, Download, RefreshCw } from "lucide-react";
import { ProductData } from "@/types/calculator";
import { getHistory, deleteFromHistory, clearHistory } from "@/utils/storage";
import { formatCurrency, formatPercentage } from "@/utils/calculator";
import { exportToPDF, exportToExcel } from "@/utils/export";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface HistoryListProps {
  onViewProduct: (product: ProductData) => void;
  triggerRefresh: number;
}

export const HistoryList = ({ onViewProduct, triggerRefresh }: HistoryListProps) => {
  const [history, setHistory] = useState<ProductData[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, [triggerRefresh]);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    loadHistory();
    toast.success("Item removido do histórico");
  };

  const handleClearAll = () => {
    clearHistory();
    loadHistory();
    setShowClearDialog(false);
    toast.success("Histórico limpo com sucesso");
  };

  const handleExportPDF = () => {
    if (history.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    exportToPDF(history);
    toast.success("PDF gerado com sucesso!");
  };

  const handleExportExcel = () => {
    if (history.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    exportToExcel(history);
    toast.success("Excel gerado com sucesso!");
  };

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum produto calculado ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece adicionando um produto acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Cálculos
            <Badge variant="secondary">{history.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowClearDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {history.map((product) => (
                <div
                  key={product.id}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all hover:shadow-md group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{product.marketplace}</Badge>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewProduct(product)}
                        title="Visualizar detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {product.results && (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Preço</p>
                        <p className="font-medium">{formatCurrency(product.salePrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Lucro</p>
                        <p
                          className={`font-medium ${
                            product.results.netProfit > 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {formatCurrency(product.results.netProfit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Margem</p>
                        <p className="font-medium">{formatPercentage(product.results.profitMargin)}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(product.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os seus cálculos salvos serão permanentemente
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive">
              Limpar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
