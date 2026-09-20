import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { calculateProfit } from "@/utils/calculator";
import { MARKETPLACES } from "@/data/marketplaces";
import { ProductData } from "@/types/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Percent,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  Receipt,
  AlertTriangle,
  Wallet
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { format, subDays, startOfMonth, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = [
  "hsl(42, 100%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(200, 80%, 50%)",
  "hsl(350, 80%, 50%)",
  "hsl(30, 90%, 50%)",
  "hsl(120, 50%, 40%)",
  "hsl(260, 70%, 60%)"
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Calcula lucro sem quebrar quando o produto usa um plano antigo (taxas atualizadas em Set/2026)
const safeCalculate = (product: ProductData) => {
  try {
    return calculateProfit(product);
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "all">("30d");

  // Filtrar produtos por período
  const filteredProducts = useMemo(() => {
    if (timeFilter === "all") return products;
    
    const daysAgo = timeFilter === "7d" ? 7 : 30;
    const cutoffDate = subDays(new Date(), daysAgo);
    
    return products.filter(p => isAfter(new Date(p.createdAt), cutoffDate));
  }, [products, timeFilter]);

  // Calcular métricas
  const metrics = useMemo(() => {
    if (filteredProducts.length === 0) {
      return {
        totalProducts: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalFees: 0,
        avgMargin: 0,
        profitableCount: 0,
        unprofitableCount: 0,
        outdatedCount: 0
      };
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalFees = 0;
    let totalMargin = 0;
    let calculatedCount = 0;
    let profitableCount = 0;
    let unprofitableCount = 0;
    let outdatedCount = 0;

    filteredProducts.forEach(product => {
      const results = safeCalculate(product);
      if (!results) {
        outdatedCount++;
        return;
      }
      calculatedCount++;
      totalRevenue += product.salePrice;
      totalCost += product.costPrice;
      totalProfit += results.netProfit;
      totalFees += results.fees.total;
      totalMargin += results.profitMargin;

      if (results.netProfit > 0) {
        profitableCount++;
      } else {
        unprofitableCount++;
      }
    });

    return {
      totalProducts: filteredProducts.length,
      totalRevenue,
      totalCost,
      totalProfit,
      totalFees,
      avgMargin: calculatedCount > 0 ? totalMargin / calculatedCount : 0,
      profitableCount,
      unprofitableCount,
      outdatedCount
    };
  }, [filteredProducts]);

  // Dados por marketplace
  const marketplaceData = useMemo(() => {
    const data: Record<string, { count: number; revenue: number; profit: number; margin: number; fees: number }> = {};

    filteredProducts.forEach(product => {
      const results = safeCalculate(product);
      if (!results) return;

      if (!data[product.marketplace]) {
        data[product.marketplace] = { count: 0, revenue: 0, profit: 0, margin: 0, fees: 0 };
      }

      data[product.marketplace].count++;
      data[product.marketplace].revenue += product.salePrice;
      data[product.marketplace].profit += results.netProfit;
      data[product.marketplace].margin += results.profitMargin;
      data[product.marketplace].fees += results.fees.total;
    });

    return Object.entries(data).map(([name, values]) => ({
      name,
      count: values.count,
      revenue: values.revenue,
      profit: values.profit,
      fees: values.fees,
      margin: values.count > 0 ? values.margin / values.count : 0
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredProducts]);

  // Dados para gráfico de pizza (distribuição por marketplace)
  const pieData = useMemo(() => {
    return marketplaceData.map(item => ({
      name: item.name,
      value: item.count
    }));
  }, [marketplaceData]);

  // Dados para evolução temporal
  const timeSeriesData = useMemo(() => {
    const days = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 60;
    const data: Record<string, { date: string; profit: number; count: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), "dd/MM");
      data[date] = { date, profit: 0, count: 0 };
    }
    
    filteredProducts.forEach(product => {
      const date = format(new Date(product.createdAt), "dd/MM");
      const results = safeCalculate(product);
      if (!results) return;

      if (data[date]) {
        data[date].profit += results.netProfit;
        data[date].count++;
      }
    });

    return Object.values(data).reverse();
  }, [filteredProducts, timeFilter]);

  // Top produtos mais lucrativos
  const topProducts = useMemo(() => {
    return [...filteredProducts]
      .map(product => ({ ...product, results: safeCalculate(product) }))
      .filter((p): p is typeof p & { results: NonNullable<ReturnType<typeof safeCalculate>> } => p.results !== null)
      .sort((a, b) => b.results.netProfit - a.results.netProfit)
      .slice(0, 5);
  }, [filteredProducts]);

  // Impacto das tarifas por produto
  const feeImpact = useMemo(() => {
    return filteredProducts
      .map(product => {
        const results = safeCalculate(product);
        if (!results) {
          return { ...product, results: null as null, feePct: 0 };
        }
        return {
          ...product,
          results,
          feePct: product.salePrice > 0 ? (results.fees.total / product.salePrice) * 100 : 0
        };
      })
      .sort((a, b) => {
        const feeA = a.results ? a.results.fees.total : 0;
        const feeB = b.results ? b.results.fees.total : 0;
        return feeB - feeA;
      });
  }, [filteredProducts]);

  // Loading state
  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard de Vendas
              </h1>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={timeFilter === "7d" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("7d")}
            >
              7 dias
            </Button>
            <Button 
              variant={timeFilter === "30d" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("30d")}
            >
              30 dias
            </Button>
            <Button 
              variant={timeFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("all")}
            >
              Todos
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Produtos
              </CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalProducts}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  {metrics.profitableCount} lucrativos
                </Badge>
                <Badge variant="destructive" className="text-xs">
                  {metrics.unprofitableCount} prejuízo
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Custo: {formatCurrency(metrics.totalCost)}
              </p>
            </CardContent>
          </Card>

          <Card className={`border-primary/20 ${metrics.totalProfit >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Líquido
              </CardTitle>
              {metrics.totalProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(metrics.totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Soma de todos os produtos
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Margem Média
              </CardTitle>
              <Percent className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrics.avgMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.avgMargin.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Média de todos os produtos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lucro por Marketplace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Lucro por Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketplaceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketplaceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="profit" fill="hsl(42, 100%, 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Marketplace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Distribuição por Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evolução Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução do Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.some(d => d.profit !== 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(42, 100%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(42, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(42, 100%, 50%)"
                    fill="url(#profitGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado no período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Produtos e Performance por Marketplace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Produtos Mais Lucrativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Top 5 Produtos Mais Lucrativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.marketplace}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${product.results.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(product.results.netProfit)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.results.profitMargin.toFixed(1)}% margem
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Nenhum produto cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Detalhada por Marketplace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Performance por Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketplaceData.length > 0 ? (
                <div className="space-y-4">
                  {marketplaceData.map((mp, index) => (
                    <div 
                      key={mp.name}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{mp.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {mp.count} {mp.count === 1 ? 'produto' : 'produtos'}
                          </Badge>
                        </div>
                        <span className={`font-bold ${mp.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(mp.profit)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Receita: </span>
                          <span className="font-medium">{formatCurrency(mp.revenue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Margem média: </span>
                          <span className={`font-medium ${mp.margin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {mp.margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
