import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const norm = (s: string) =>
  s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const FIELD_ALIASES: Record<string, string[]> = {
  name: ["nome", "fornecedor", "name", "contato", "razaosocial"],
  company: ["empresa", "company", "nomefantasia"],
  cnpj: ["cnpj", "cpfcnpj", "documento"],
  city: ["cidade", "city", "municipio"],
  state: ["estado", "uf", "state"],
  products_supplied: ["produtos", "produto", "produtosfornecidos", "products", "itens"],
  average_discount: ["desconto", "descontomedio", "discount", "desconto%"],
  email: ["email", "e-mail", "mail"],
  phone: ["telefone", "fone", "phone", "tel"],
  whatsapp: ["whatsapp", "zap", "celular"],
  category: ["categoria", "category", "segmento"],
  website: ["site", "website", "url"],
  payment_terms: ["pagamento", "condicaopagamento", "condicoesdepagamento"],
  lead_time_days: ["prazo", "prazoentrega", "prazodias", "leadtime"],
  min_order_value: ["pedidominimo", "minimo", "valorminimo"],
  address: ["endereco", "address"],
  notes: ["observacoes", "obs", "notas", "notes"],
};

const aliasMap = new Map<string, string>();
Object.entries(FIELD_ALIASES).forEach(([f, arr]) => arr.forEach((a) => aliasMap.set(norm(a), f)));

const toNum = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  let s = v.toString().replace(/[R$%\s]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

const formatCnpj = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (d.length !== 14) return v.trim();
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

interface Props { userId: string; onImported: () => void; }

export const SupplierImport = ({ userId, onImported }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nome", "Empresa", "CNPJ", "Cidade", "UF", "Produtos", "Desconto (%)", "Telefone", "WhatsApp", "Email", "Categoria", "Prazo (dias)", "Pedido mínimo"],
      ["João Silva", "Distribuidora Exemplo", "12.345.678/0001-90", "São Paulo", "SP", "Capinhas, cabos", 8, "11999999999", "11999999999", "joao@exemplo.com", "Eletrônicos", 5, 500],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fornecedores");
    XLSX.writeFile(wb, "modelo-fornecedores.xlsx");
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      if (!rows.length) { toast.error("A planilha está vazia"); return; }

      const payload = rows.map((row) => {
        const rec: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => {
          const f = aliasMap.get(norm(k));
          if (f && v !== "" && rec[f] === undefined) rec[f] = v;
        });
        if (!rec.name && rec.company) rec.name = rec.company;
        if (!rec.name) return null;
        const str = (x: unknown) => (x === undefined || x === null || x === "" ? null : x.toString().trim());
        let discount = toNum(rec.average_discount);
        if (discount !== null && discount > 0 && discount < 1) discount = discount * 100;
        const lead = toNum(rec.lead_time_days);
        return {
          user_id: userId,
          name: str(rec.name)!,
          company: str(rec.company),
          cnpj: rec.cnpj ? formatCnpj(rec.cnpj.toString()) : null,
          city: str(rec.city),
          state: rec.state ? rec.state.toString().trim().toUpperCase().slice(0, 2) : null,
          products_supplied: str(rec.products_supplied),
          average_discount: discount,
          email: str(rec.email),
          phone: str(rec.phone),
          whatsapp: str(rec.whatsapp),
          category: str(rec.category),
          website: str(rec.website),
          payment_terms: str(rec.payment_terms),
          lead_time_days: lead !== null ? Math.round(lead) : null,
          min_order_value: toNum(rec.min_order_value),
          address: str(rec.address),
          notes: str(rec.notes),
          status: "ativo",
        };
      }).filter(Boolean) as any[];

      if (!payload.length) { toast.error("Nenhuma linha com nome ou empresa encontrada"); return; }
      const { error } = await supabase.from("suppliers").insert(payload);
      if (error) throw error;
      const skipped = rows.length - payload.length;
      toast.success(`${payload.length} fornecedor(es) importado(s)!${skipped ? ` ${skipped} linha(s) sem nome ignorada(s).` : ""}`);
      onImported();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível ler a planilha. Use .xlsx, .xls ou .csv");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <Button variant="outline" className="gap-2" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Importar Planilha
      </Button>
      <Button variant="ghost" size="icon" title="Baixar modelo de planilha" onClick={downloadTemplate}>
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};
