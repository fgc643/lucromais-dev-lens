import { useState, useEffect, useMemo } from "react";
import { SupplierImport } from "./SupplierImport";
import {
  Plus, Pencil, Trash2, Phone, Mail, MessageCircle, Building2, Tag, Search, Users,
  Star, Truck, Wallet, Globe, MapPin, TrendingUp, AlertTriangle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/calculator";

interface Supplier {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  category: string | null;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  products_supplied: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  min_order_value: number | null;
  average_discount: number | null;
  rating: number | null;
  status: string | null;
  last_purchase_at: string | null;
  created_at: string;
}

const emptySupplier = {
  name: "", company: "", email: "", phone: "", whatsapp: "", address: "", notes: "",
  category: "", cnpj: "", city: "", state: "", website: "", products_supplied: "",
  payment_terms: "", lead_time_days: "", min_order_value: "", average_discount: "",
  rating: "0", status: "ativo", last_purchase_at: "",
};

const STATUS_OPTIONS = ["ativo", "em negociação", "inativo", "bloqueado"];
const PAYMENT_TERMS = ["À vista / Pix", "7 dias", "14 dias", "21 dias", "28 dias", "30/60", "30/60/90", "Boleto faturado"];

/** Score de 0 a 100 calculado com os dados do banco. */
const supplierScore = (s: Supplier) => {
  let score = 0;
  score += (s.rating ?? 0) * 10; // até 50
  if (s.lead_time_days != null) score += s.lead_time_days <= 3 ? 20 : s.lead_time_days <= 7 ? 14 : s.lead_time_days <= 15 ? 8 : 3;
  if (s.average_discount != null) score += Math.min(s.average_discount, 20) * 0.75; // até 15
  if (s.payment_terms) score += 5;
  if (s.whatsapp || s.phone) score += 5;
  if (s.email) score += 2;
  if (s.last_purchase_at) {
    const days = (Date.now() - new Date(s.last_purchase_at).getTime()) / 86400000;
    score += days <= 60 ? 3 : days <= 180 ? 1 : 0;
  }
  if (s.status === "inativo") score -= 15;
  if (s.status === "bloqueado") score -= 40;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const scoreTone = (score: number) =>
  score >= 75 ? "text-profit border-profit/40 bg-profit/10"
    : score >= 45 ? "text-primary border-primary/40 bg-primary/10"
      : "text-loss border-loss/40 bg-loss/10";

const daysSince = (date: string | null) =>
  date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : null;

export function SupplierManager() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptySupplier);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    if (user) fetchSuppliers();
  }, [user]);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      setSuppliers((data || []) as Supplier[]);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => ({
    name: formData.name,
    company: formData.company || null,
    email: formData.email || null,
    phone: formData.phone || null,
    whatsapp: formData.whatsapp || null,
    address: formData.address || null,
    notes: formData.notes || null,
    category: formData.category || null,
    cnpj: formData.cnpj || null,
    city: formData.city || null,
    state: formData.state || null,
    website: formData.website || null,
    products_supplied: formData.products_supplied || null,
    payment_terms: formData.payment_terms || null,
    lead_time_days: formData.lead_time_days ? Number(formData.lead_time_days) : null,
    min_order_value: formData.min_order_value ? Number(String(formData.min_order_value).replace(",", ".")) : null,
    average_discount: formData.average_discount ? Number(String(formData.average_discount).replace(",", ".")) : null,
    rating: Number(formData.rating) || 0,
    status: formData.status || "ativo",
    last_purchase_at: formData.last_purchase_at || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingId) {
        const { error } = await supabase.from("suppliers").update(buildPayload()).eq("id", editingId);
        if (error) throw error;
        toast.success("Fornecedor atualizado!");
      } else {
        const { error } = await supabase.from("suppliers").insert({ user_id: user.id, ...buildPayload() });
        if (error) throw error;
        toast.success("Fornecedor adicionado!");
      }
      setIsOpen(false);
      setEditingId(null);
      setFormData(emptySupplier);
      fetchSuppliers();
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
      toast.error("Erro ao salvar fornecedor");
    }
  };

  const handleEdit = (s: Supplier) => {
    setEditingId(s.id);
    setFormData({
      name: s.name, company: s.company || "", email: s.email || "", phone: s.phone || "",
      whatsapp: s.whatsapp || "", address: s.address || "", notes: s.notes || "",
      category: s.category || "", cnpj: s.cnpj || "", city: s.city || "", state: s.state || "",
      website: s.website || "", products_supplied: s.products_supplied || "",
      payment_terms: s.payment_terms || "",
      lead_time_days: s.lead_time_days?.toString() || "",
      min_order_value: s.min_order_value?.toString() || "",
      average_discount: s.average_discount?.toString() || "",
      rating: (s.rating ?? 0).toString(), status: s.status || "ativo",
      last_purchase_at: s.last_purchase_at || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este fornecedor?")) return;
    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Fornecedor excluído!");
      fetchSuppliers();
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      toast.error("Erro ao excluir fornecedor");
    }
  };

  const openWhatsApp = (whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}`, "_blank");
  };

  const categories = useMemo(
    () => Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean))) as string[],
    [suppliers]
  );

  const visible = useMemo(() => {
    const term = search.toLowerCase();
    return suppliers
      .filter((s) =>
        (!term ||
          s.name.toLowerCase().includes(term) ||
          s.company?.toLowerCase().includes(term) ||
          s.category?.toLowerCase().includes(term) ||
          s.products_supplied?.toLowerCase().includes(term) ||
          s.city?.toLowerCase().includes(term) ||
          s.cnpj?.includes(term)) &&
        (categoryFilter === "todas" || s.category === categoryFilter) &&
        (statusFilter === "todos" || (s.status || "ativo") === statusFilter)
      )
      .sort((a, b) => {
        if (sortBy === "score") return supplierScore(b) - supplierScore(a);
        if (sortBy === "prazo") return (a.lead_time_days ?? 999) - (b.lead_time_days ?? 999);
        if (sortBy === "desconto") return (b.average_discount ?? 0) - (a.average_discount ?? 0);
        if (sortBy === "pedido") return (a.min_order_value ?? Infinity) - (b.min_order_value ?? Infinity);
        return a.name.localeCompare(b.name);
      });
  }, [suppliers, search, categoryFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const actives = suppliers.filter((s) => (s.status || "ativo") === "ativo");
    const leads = suppliers.map((s) => s.lead_time_days).filter((n): n is number => n != null);
    const best = [...suppliers].sort((a, b) => supplierScore(b) - supplierScore(a))[0];
    const stale = suppliers.filter((s) => {
      const d = daysSince(s.last_purchase_at);
      return (s.status || "ativo") === "ativo" && d !== null && d > 120;
    });
    return {
      total: suppliers.length,
      actives: actives.length,
      categories: categories.length,
      avgLead: leads.length ? Math.round(leads.reduce((a, b) => a + b, 0) / leads.length) : null,
      best,
      stale,
    };
  }, [suppliers, categories]);

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Faça login para gerenciar seus fornecedores</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Painel inteligente */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Fornecedores", value: stats.total, icon: Users },
          { label: "Ativos", value: stats.actives, icon: TrendingUp },
          { label: "Categorias", value: stats.categories, icon: Tag },
          { label: "Prazo médio", value: stats.avgLead != null ? `${stats.avgLead} dias` : "—", icon: Truck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-3 rounded-xl border border-border bg-secondary/40">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon className="w-3.5 h-3.5" /> {label}
            </p>
            <p className="text-2xl font-black text-primary">{value}</p>
          </div>
        ))}
      </div>

      {(stats.best || stats.stale.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.best && (
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 text-sm flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <span>
                Melhor fornecedor hoje: <b>{stats.best.name}</b> — score {supplierScore(stats.best)}/100
                {stats.best.lead_time_days != null && `, entrega em ${stats.best.lead_time_days} dias`}
                {stats.best.average_discount != null && `, desconto médio de ${stats.best.average_discount}%`}.
              </span>
            </div>
          )}
          {stats.stale.length > 0 && (
            <div className="p-3 rounded-xl border border-loss/30 bg-loss/5 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-loss mt-0.5" />
              <span>
                {stats.stale.length} fornecedor(es) ativo(s) sem compra há mais de 4 meses — vale renegociar preço:{" "}
                <b>{stats.stale.slice(0, 3).map((s) => s.name).join(", ")}</b>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome, empresa, produto, cidade, CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Melhor score</SelectItem>
              <SelectItem value="prazo">Menor prazo de entrega</SelectItem>
              <SelectItem value="desconto">Maior desconto médio</SelectItem>
              <SelectItem value="pedido">Menor pedido mínimo</SelectItem>
              <SelectItem value="nome">Nome (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {user && <SupplierImport userId={user.id} onImported={fetchSuppliers} />}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) { setEditingId(null); setFormData(emptySupplier); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Fornecedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do contato" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nome da empresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Eletrônicos, Roupas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+55 00 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site / Catálogo</Label>
                  <Input id="website" value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input id="state" maxLength={2} value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="SP" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="products">Produtos fornecidos</Label>
                <Input id="products" value={formData.products_supplied}
                  onChange={(e) => setFormData({ ...formData, products_supplied: e.target.value })}
                  placeholder="Ex: fones bluetooth, carregadores, cabos" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead">Prazo de entrega (dias)</Label>
                  <Input id="lead" inputMode="numeric" value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                    placeholder="7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Pedido mínimo (R$)</Label>
                  <Input id="minOrder" inputMode="decimal" value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto médio (%)</Label>
                  <Input id="discount" inputMode="decimal" value={formData.average_discount}
                    onChange={(e) => setFormData({ ...formData, average_discount: e.target.value })}
                    placeholder="10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Condição de pagamento</Label>
                  <Select value={formData.payment_terms}
                    onValueChange={(v) => setFormData({ ...formData, payment_terms: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastPurchase">Última compra</Label>
                  <Input id="lastPurchase" type="date" value={formData.last_purchase_at}
                    onChange={(e) => setFormData({ ...formData, last_purchase_at: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avaliação</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button"
                      onClick={() => setFormData({ ...formData, rating: String(n) })}
                      className="p-1">
                      <Star className={`w-6 h-6 ${n <= Number(formData.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" rows={3} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações sobre o fornecedor..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? "Salvar" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{suppliers.length ? "Nenhum fornecedor encontrado com esses filtros" : "Nenhum fornecedor cadastrado"}</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="hidden lg:table-cell">Produtos / Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Condições</TableHead>
                <TableHead className="hidden sm:table-cell">Contato</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((supplier) => {
                const score = supplierScore(supplier);
                const since = daysSince(supplier.last_purchase_at);
                return (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <p className="font-medium">{supplier.name}</p>
                      {supplier.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {supplier.company}
                        </p>
                      )}
                      {(supplier.city || supplier.state) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {[supplier.city, supplier.state].filter(Boolean).join(" - ")}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                        {supplier.status || "ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {supplier.category && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Tag className="w-3 h-3" /> {supplier.category}
                        </span>
                      )}
                      {supplier.products_supplied && (
                        <span className="text-xs text-muted-foreground">{supplier.products_supplied}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground space-y-1">
                      {supplier.lead_time_days != null && (
                        <p className="flex items-center gap-1"><Truck className="w-3 h-3" /> {supplier.lead_time_days} dias</p>
                      )}
                      {supplier.min_order_value != null && (
                        <p className="flex items-center gap-1"><Wallet className="w-3 h-3" /> mín. {formatCurrency(supplier.min_order_value)}</p>
                      )}
                      {supplier.payment_terms && <p>{supplier.payment_terms}</p>}
                      {supplier.average_discount != null && <p>Desconto médio {supplier.average_discount}%</p>}
                      {since != null && <p>Última compra há {since} dia(s)</p>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {supplier.phone && (
                        <p className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {supplier.phone}</p>
                      )}
                      {supplier.email && (
                        <p className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" /> {supplier.email}</p>
                      )}
                      {supplier.website && (
                        <a href={supplier.website} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline">
                          <Globe className="w-3 h-3" /> site
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-lg border text-center font-bold ${scoreTone(score)}`}>
                        {score}
                      </div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3 h-3 ${n <= (supplier.rating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {supplier.whatsapp && (
                          <Button variant="ghost" size="icon" onClick={() => openWhatsApp(supplier.whatsapp!)}
                            className="text-green-500 hover:text-green-600">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
