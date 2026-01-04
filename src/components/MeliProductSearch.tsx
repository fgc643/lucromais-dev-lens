import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Truck, 
  ExternalLink, 
  Package,
  Sparkles,
  ArrowDown,
  Award,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Zap,
  Store,
  Tag
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MercadoLivreConnect from './MercadoLivreConnect';

interface MeliProduct {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  originalPrice?: string | null;
  discount?: string | null;
  discountValue?: number | null;
  image?: string;
  url?: string;
  seller?: string;
  sellerBadge?: string;
  shipping?: string;
  freeShipping?: boolean;
  fullShipping?: boolean;
  soldQuantity?: number;
  availableQuantity?: number;
  condition?: string;
  specifications?: string[];
  installments?: string;
  isCatalog?: boolean;
}

interface SearchInsights {
  lowestPrice: string;
  highestPrice: string;
  averagePrice: string;
  priceRange: string;
  freeShippingCount: number;
  freeShippingPercentage: number;
  catalogProductsCount: number;
  bestDiscount: string;
  recommendation: string;
}

interface FilterOption {
  id: string;
  name: string;
  count: number;
}

interface SearchFilter {
  id: string;
  name: string;
  values: FilterOption[];
}

interface SearchResults {
  searchQuery: string;
  timestamp: string;
  source: string;
  isRealData: boolean;
  totalResults: number;
  showing: number;
  offset: number;
  products: MeliProduct[];
  insights: SearchInsights;
  filters: SearchFilter[];
  trendingSearches: string[];
}

const CATEGORIES = [
  'Eletrônicos',
  'Eletrodomésticos',
  'Celulares e Telefones',
  'Moda e Acessórios',
  'Casa e Decoração',
  'Esporte e Lazer',
  'Brinquedos e Hobbies',
  'Saúde e Beleza',
  'Ferramentas',
  'Automotivo',
  'Informática',
  'Games',
  'Bebês',
  'Livros',
  'Pets',
  'Alimentos e Bebidas',
];

export const MeliProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { toast } = useToast();

  const getMeliToken = useCallback(() => {
    return localStorage.getItem('meli_token');
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Digite algo para buscar",
        description: "Informe o nome do produto que deseja pesquisar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);
    setShowAllProducts(false);

    try {
      const access_token = getMeliToken();
      
      const { data, error } = await supabase.functions.invoke('meli-search', {
        body: { 
          query: searchQuery, 
          category: category || undefined,
          limit: 50,
          sort: sortBy,
          access_token: access_token || undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data.data);
        toast({
          title: "✅ Busca concluída!",
          description: `${data.data.totalResults.toLocaleString('pt-BR')} produtos encontrados no Mercado Livre`,
        });
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error: unknown) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível realizar a busca';
      toast({
        title: "Erro na busca",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayedProducts = showAllProducts 
    ? results?.products || []
    : (results?.products || []).slice(0, 12);

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-gradient-to-r from-[#FFE600]/20 to-[#FFE600]/5 border-b border-[#FFE600]/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#FFE600] shadow-lg">
              <img 
                src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg"
                alt="Mercado Livre"
                className="w-6 h-6"
              />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Busca Real - Mercado Livre
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  API Real
                </Badge>
              </CardTitle>
              <CardDescription>
                Dados em tempo real direto da API oficial do Mercado Livre
              </CardDescription>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <MercadoLivreConnect />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Search Form */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar produtos no Mercado Livre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12 text-lg border-[#FFE600]/30 focus-visible:ring-[#FFE600]/50"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48 h-12">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40 h-12">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
              <SelectItem value="sold_quantity">Mais vendidos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="h-12 px-8 gap-2 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-semibold"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Buscar
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Buscando produtos no Mercado Livre...</span>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-40 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="space-y-6">
            {/* Source Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Dados Reais
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {results.source} • Atualizado: {results.timestamp}
                </span>
              </div>
              <Badge variant="outline" className="text-lg py-1 px-3">
                {results.totalResults.toLocaleString('pt-BR')} produtos
              </Badge>
            </div>

            {/* Insights Card */}
            <Card className="bg-gradient-to-r from-[#FFE600]/10 to-orange-500/10 border-[#FFE600]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-[#FFE600]" />
                  <span className="font-semibold text-[#FFE600]">Insights em Tempo Real</span>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <ArrowDown className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Menor Preço</p>
                      <p className="font-bold text-green-500">{results.insights.lowestPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Maior Preço</p>
                      <p className="font-bold text-red-500">{results.insights.highestPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Preço Médio</p>
                      <p className="font-bold text-blue-500">{results.insights.averagePrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Truck className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Frete Grátis</p>
                      <p className="font-bold text-purple-500">{results.insights.freeShippingPercentage}% dos produtos</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm">{results.insights.recommendation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trending Searches */}
            {results.trendingSearches?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">🔥 Trending:</span>
                {results.trendingSearches.map((trend, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setSearchQuery(trend);
                      handleSearch();
                    }}
                  >
                    {trend}
                  </Button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden hover:border-[#FFE600]/50 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-white overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.discount && (
                        <Badge className="bg-green-500 text-white text-xs">
                          {product.discount}
                        </Badge>
                      )}
                      {product.freeShipping && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Grátis
                        </Badge>
                      )}
                      {product.fullShipping && (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Full
                        </Badge>
                      )}
                    </div>

                    {product.isCatalog && (
                      <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
                        Catálogo
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-3 space-y-2">
                    {/* Title */}
                    <h4 className="font-medium text-sm line-clamp-2 min-h-[40px]" title={product.name}>
                      {product.name}
                    </h4>
                    
                    {/* Price */}
                    <div className="space-y-1">
                      {product.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {product.originalPrice}
                        </p>
                      )}
                      <p className="text-xl font-bold text-green-500">
                        {product.price}
                      </p>
                      {product.installments && (
                        <p className="text-xs text-muted-foreground">
                          {product.installments}
                        </p>
                      )}
                    </div>
                    
                    {/* Seller Info */}
                    {product.sellerBadge && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {product.sellerBadge}
                      </p>
                    )}
                    
                    {/* Sold Quantity */}
                    {product.soldQuantity && product.soldQuantity > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{product.soldQuantity.toLocaleString('pt-BR')} vendidos
                      </p>
                    )}
                    
                    {/* Actions */}
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full gap-2 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black"
                        onClick={() => product.url && window.open(product.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver no ML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More Button */}
            {results.products.length > 12 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="gap-2"
                >
                  {showAllProducts ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver mais {results.products.length - 12} produtos
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">Busque produtos no Mercado Livre</p>
            <p className="text-sm">Dados reais em tempo real com preços, avaliações e frete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeliProductSearch;
