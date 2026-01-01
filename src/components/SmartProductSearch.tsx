import { useState } from 'react';
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
  Clock, 
  ShoppingCart,
  Sparkles,
  ArrowDown,
  Award,
  RefreshCw
} from 'lucide-react';
import { CATEGORIES } from '@/data/marketplaces';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
  url?: string;
  seller?: string;
  rating?: string;
  reviews?: string;
  shipping?: string;
  specifications?: string[];
}

interface Marketplace {
  name: string;
  logo: string;
  products: Product[];
}

interface SearchInsights {
  lowestPrice: string;
  lowestPriceMarketplace: string;
  averagePrice: string;
  bestRated: string;
  recommendation: string;
}

interface SearchResults {
  searchQuery: string;
  timestamp: string;
  totalResults: number;
  marketplaces: Marketplace[];
  insights: SearchInsights;
}

export const SmartProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Digite algo para buscar",
        description: "Informe o nome do produto ou serviço que deseja pesquisar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('smart-product-search', {
        body: { searchQuery, category }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data.data);
        toast({
          title: "Busca concluída!",
          description: `Encontramos resultados em ${data.data.marketplaces?.length || 0} marketplaces.`
        });
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Erro na busca",
        description: error.message || "Não foi possível realizar a busca. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMarketplaceBgColor = (name: string) => {
    const colors: Record<string, string> = {
      'Mercado Livre': 'bg-yellow-500/20 border-yellow-500/50',
      'Amazon': 'bg-orange-500/20 border-orange-500/50',
      'Shopee': 'bg-red-500/20 border-red-500/50',
      'Magazine Luiza': 'bg-blue-500/20 border-blue-500/50',
      'Americanas': 'bg-red-600/20 border-red-600/50',
      'Casas Bahia': 'bg-blue-600/20 border-blue-600/50',
    };
    return colors[name] || 'bg-primary/20 border-primary/50';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Busca Inteligente de Produtos
              <Badge variant="secondary" className="text-xs">IA</Badge>
            </CardTitle>
            <CardDescription>
              Pesquise produtos em tempo real em todos os principais marketplaces
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Search Form */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Digite o nome do produto ou serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12 text-lg"
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
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="h-12 px-8 gap-2"
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
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Buscando em todos os marketplaces...</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-32 w-full mb-3" />
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
            {/* Insights Card */}
            {results.insights && (
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-400">Insights da Busca</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {results.timestamp}
                    </Badge>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <ArrowDown className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Menor Preço</p>
                        <p className="font-bold text-green-400">{results.insights.lowestPrice}</p>
                        <p className="text-xs text-muted-foreground">{results.insights.lowestPriceMarketplace}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <ShoppingCart className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Preço Médio</p>
                        <p className="font-bold text-blue-400">{results.insights.averagePrice}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Melhor Avaliado</p>
                        <p className="font-bold text-yellow-400 text-sm truncate">{results.insights.bestRated}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 sm:col-span-2 lg:col-span-1">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Recomendação IA</p>
                        <p className="text-sm text-purple-400">{results.insights.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Marketplace Results */}
            {results.marketplaces?.map((marketplace, idx) => (
              <div key={idx} className="space-y-3">
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${getMarketplaceBgColor(marketplace.name)}`}>
                  <span className="text-2xl">{marketplace.logo}</span>
                  <h3 className="font-semibold">{marketplace.name}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {marketplace.products?.length || 0} produtos
                  </Badge>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplace.products?.map((product, pIdx) => (
                    <Card key={pIdx} className="overflow-hidden hover:shadow-xl transition-shadow">
                      {product.image && (
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          {product.discount && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              -{product.discount}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-medium line-clamp-2 text-sm">{product.name}</h4>
                        
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-bold text-primary">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        {product.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span>{product.rating}</span>
                            {product.reviews && (
                              <span className="text-muted-foreground">({product.reviews} avaliações)</span>
                            )}
                          </div>
                        )}
                        
                        {product.seller && (
                          <p className="text-xs text-muted-foreground">
                            Vendido por: {product.seller}
                          </p>
                        )}
                        
                        {product.shipping && (
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <Truck className="h-3 w-3" />
                            {product.shipping}
                          </div>
                        )}
                        
                        {product.specifications && product.specifications.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.specifications.slice(0, 3).map((spec, sIdx) => (
                              <Badge key={sIdx} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {product.url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2"
                            onClick={() => window.open(product.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver no {marketplace.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* No results message */}
            {(!results.marketplaces || results.marketplaces.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado para sua busca.</p>
                <p className="text-sm">Tente usar termos diferentes ou mais específicos.</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-primary/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">Pesquise qualquer produto</h3>
            <p className="text-sm max-w-md mx-auto">
              Digite o nome de um produto ou serviço para ver preços, imagens, avaliações e especificações 
              em tempo real nos principais marketplaces brasileiros.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['iPhone 15', 'Notebook Gamer', 'Air Fryer', 'Smart TV 55'].map((suggestion) => (
                <Button 
                  key={suggestion}
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch();
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
