import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ProductData } from "@/types/calculator";
import { formatCurrency, formatPercentage } from "./calculator";

export const exportToPDF = (products: ProductData[]): void => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(252, 211, 3); // Amarelo
  doc.text("Lucro Mais - Relatório de Análise", 14, 20);
  
  // Data
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);
  
  // Tabela de produtos
  const tableData = products.map((product) => [
    product.name,
    product.marketplace,
    formatCurrency(product.salePrice),
    formatCurrency(product.costPrice),
    product.results ? formatCurrency(product.results.netProfit) : "-",
    product.results ? formatPercentage(product.results.profitMargin) : "-",
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [["Produto", "Marketplace", "Preço Venda", "Custo", "Lucro Líquido", "Margem"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [252, 211, 3],
      textColor: [26, 32, 44],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
  });
  
  // Salvar
  doc.save(`lucro-mais-relatorio-${Date.now()}.pdf`);
};

export const exportToExcel = (products: ProductData[]): void => {
  const data = products.map((product) => ({
    "Nome do Produto": product.name,
    "Categoria": product.category,
    "Marketplace": product.marketplace,
    "Plano": product.plan,
    "Preço de Venda": product.salePrice,
    "Preço de Custo": product.costPrice,
    "Frete": product.shippingCost,
    "Parcelas": product.installments,
    "Lucro Bruto": product.results?.grossProfit || 0,
    "Lucro Líquido": product.results?.netProfit || 0,
    "Margem (%)": product.results?.profitMargin || 0,
    "Taxa Comissão": product.results?.fees.commission || 0,
    "Taxa Pagamento": product.results?.fees.payment || 0,
    "Taxa Frete": product.results?.fees.shipping || 0,
    "Total Taxas": product.results?.fees.total || 0,
    "Data": new Date(product.createdAt).toLocaleString("pt-BR"),
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Análises");
  
  // Ajustar largura das colunas
  const wscols = [
    { wch: 20 }, // Nome
    { wch: 15 }, // Categoria
    { wch: 15 }, // Marketplace
    { wch: 12 }, // Plano
    { wch: 12 }, // Preço Venda
    { wch: 12 }, // Custo
    { wch: 10 }, // Frete
    { wch: 10 }, // Parcelas
    { wch: 12 }, // Lucro Bruto
    { wch: 12 }, // Lucro Líquido
    { wch: 10 }, // Margem
    { wch: 12 }, // Comissão
    { wch: 12 }, // Pagamento
    { wch: 12 }, // Frete
    { wch: 12 }, // Total Taxas
    { wch: 18 }, // Data
  ];
  ws["!cols"] = wscols;
  
  XLSX.writeFile(wb, `lucro-mais-relatorio-${Date.now()}.xlsx`);
};
