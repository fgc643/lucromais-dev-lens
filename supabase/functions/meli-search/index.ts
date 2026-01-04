import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MeliProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  condition: string;
  permalink: string;
  thumbnail: string;
  thumbnail_id: string;
  seller: {
    id: number;
    nickname: string;
    power_seller_status: string | null;
    car_dealer: boolean;
  };
  shipping: {
    free_shipping: boolean;
    logistic_type: string;
    store_pick_up: boolean;
  };
  attributes: Array<{
    id: string;
    name: string;
    value_name: string | null;
  }>;
  installments?: {
    quantity: number;
    amount: number;
    rate: number;
  };
  official_store_id?: number;
  catalog_product_id?: string;
}

interface MeliSearchResponse {
  site_id: string;
  country_default_time_zone: string;
  query: string;
  paging: {
    total: number;
    primary_results: number;
    offset: number;
    limit: number;
  };
  results: MeliProduct[];
  filters: Array<{
    id: string;
    name: string;
    type: string;
    values: Array<{
      id: string;
      name: string;
      results: number;
    }>;
  }>;
  available_filters: Array<{
    id: string;
    name: string;
    type: string;
    values: Array<{
      id: string;
      name: string;
      results: number;
    }>;
  }>;
}

interface MeliCategoryTrends {
  category_id: string;
  trends: Array<{
    keyword: string;
    url: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, limit = 20, offset = 0, sort = 'relevance', access_token } = await req.json();

    console.log("=== MELI SEARCH START ===");
    console.log("Query:", query);
    console.log("Category:", category);
    console.log("Has Access Token:", !!access_token);

    if (!query) {
      return new Response(JSON.stringify({
        success: false,
        error: "Query de busca não fornecida",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
    });

    // Map sort options
    const sortMapping: Record<string, string> = {
      'relevance': 'relevance',
      'price_asc': 'price_asc',
      'price_desc': 'price_desc',
      'sold_quantity': 'sold_quantity_desc',
    };
    if (sortMapping[sort]) {
      searchParams.append('sort', sortMapping[sort]);
    }

    // Map category to ML category IDs
    const categoryMapping: Record<string, string> = {
      'Eletrônicos': 'MLB1051',
      'Eletrodomésticos': 'MLB1574',
      'Celulares e Telefones': 'MLB1055',
      'Moda e Acessórios': 'MLB1430',
      'Casa e Decoração': 'MLB1574',
      'Esporte e Lazer': 'MLB1276',
      'Brinquedos e Hobbies': 'MLB1132',
      'Saúde e Beleza': 'MLB1246',
      'Ferramentas': 'MLB1500',
      'Automotivo': 'MLB1747',
      'Informática': 'MLB1648',
      'Games': 'MLB1144',
      'Bebês': 'MLB1384',
      'Livros': 'MLB1196',
      'Pets': 'MLB1071',
      'Alimentos e Bebidas': 'MLB1403',
    };

    if (category && categoryMapping[category]) {
      searchParams.append('category', categoryMapping[category]);
    }

    const searchUrl = `https://api.mercadolibre.com/sites/MLB/search?${searchParams.toString()}`;
    console.log("Search URL:", searchUrl);

    // Make request with or without auth token
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (access_token) {
      headers['Authorization'] = `Bearer ${access_token}`;
    }

    const searchResponse = await fetch(searchUrl, { headers });
    
    if (!searchResponse.ok) {
      console.error("Search API error:", searchResponse.status, searchResponse.statusText);
      const errorBody = await searchResponse.text();
      console.error("Error body:", errorBody);
      throw new Error(`Erro na API do Mercado Livre: ${searchResponse.status}`);
    }

    const searchData: MeliSearchResponse = await searchResponse.json();
    console.log("Total results found:", searchData.paging.total);
    console.log("Results returned:", searchData.results.length);

    // Get trending searches for insights
    let trendingSearches: string[] = [];
    try {
      const trendsResponse = await fetch('https://api.mercadolibre.com/trends/MLB');
      if (trendsResponse.ok) {
        const trends = await trendsResponse.json();
        trendingSearches = trends.slice(0, 5).map((t: { keyword: string }) => t.keyword);
      }
    } catch (e) {
      console.log("Could not fetch trends:", e);
    }

    // Process and format results
    const products = searchData.results.map((item) => {
      const discount = item.original_price && item.original_price > item.price 
        ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
        : null;

      // Extract relevant attributes
      const brand = item.attributes?.find(a => a.id === 'BRAND')?.value_name;
      const model = item.attributes?.find(a => a.id === 'MODEL')?.value_name;
      const color = item.attributes?.find(a => a.id === 'COLOR')?.value_name;

      // Build specifications array
      const specifications: string[] = [];
      if (brand) specifications.push(`Marca: ${brand}`);
      if (model) specifications.push(`Modelo: ${model}`);
      if (color) specifications.push(`Cor: ${color}`);
      if (item.condition === 'new') {
        specifications.push('Produto novo');
      } else if (item.condition === 'used') {
        specifications.push('Produto usado');
      }

      // Seller reputation
      let sellerBadge = '';
      if (item.seller.power_seller_status === 'platinum') {
        sellerBadge = '🏆 MercadoLíder Platinum';
      } else if (item.seller.power_seller_status === 'gold') {
        sellerBadge = '🥇 MercadoLíder Gold';
      } else if (item.seller.power_seller_status) {
        sellerBadge = '⭐ MercadoLíder';
      }
      if (item.official_store_id) {
        sellerBadge = '🏪 Loja Oficial';
      }

      // Installments info
      let installmentsInfo = '';
      if (item.installments) {
        if (item.installments.rate === 0) {
          installmentsInfo = `${item.installments.quantity}x de R$ ${item.installments.amount.toFixed(2)} sem juros`;
        } else {
          installmentsInfo = `${item.installments.quantity}x de R$ ${item.installments.amount.toFixed(2)}`;
        }
      }

      return {
        id: item.id,
        name: item.title,
        price: `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        priceValue: item.price,
        originalPrice: item.original_price 
          ? `R$ ${item.original_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : null,
        discount: discount ? `${discount}% OFF` : null,
        discountValue: discount,
        image: item.thumbnail?.replace('http://', 'https://').replace('-I.jpg', '-O.jpg'),
        url: item.permalink,
        seller: item.seller.nickname,
        sellerBadge,
        shipping: item.shipping.free_shipping ? '🚚 Frete Grátis' : 'Frete a calcular',
        freeShipping: item.shipping.free_shipping,
        fullShipping: item.shipping.logistic_type === 'fulfillment' || item.shipping.logistic_type === 'cross_docking',
        soldQuantity: item.sold_quantity,
        availableQuantity: item.available_quantity,
        condition: item.condition,
        specifications,
        installments: installmentsInfo,
        isCatalog: !!item.catalog_product_id,
      };
    });

    // Calculate insights
    const prices = products.map(p => p.priceValue).filter(p => p > 0);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const lowestPriceProduct = products.find(p => p.priceValue === lowestPrice);
    const bestDiscountProduct = products.reduce((best, current) => 
      (current.discountValue || 0) > (best.discountValue || 0) ? current : best
    , products[0]);

    const freeShippingCount = products.filter(p => p.freeShipping).length;
    const catalogCount = products.filter(p => p.isCatalog).length;

    // Generate recommendation
    let recommendation = '';
    if (lowestPriceProduct && lowestPriceProduct.freeShipping) {
      recommendation = `💡 Melhor opção: "${lowestPriceProduct.name.substring(0, 50)}..." com o menor preço e frete grátis!`;
    } else if (bestDiscountProduct && (bestDiscountProduct.discountValue || 0) >= 20) {
      recommendation = `🔥 Grande desconto: "${bestDiscountProduct.name.substring(0, 50)}..." com ${bestDiscountProduct.discount}!`;
    } else if (freeShippingCount > products.length / 2) {
      recommendation = `📦 ${freeShippingCount} de ${products.length} produtos têm frete grátis. Aproveite!`;
    } else {
      recommendation = `Encontramos ${searchData.paging.total.toLocaleString('pt-BR')} resultados para sua busca.`;
    }

    // Build response
    const response = {
      success: true,
      data: {
        searchQuery: query,
        timestamp: new Date().toLocaleString('pt-BR'),
        source: 'Mercado Livre API (Real)',
        isRealData: true,
        totalResults: searchData.paging.total,
        showing: products.length,
        offset: searchData.paging.offset,
        products,
        insights: {
          lowestPrice: `R$ ${lowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          highestPrice: `R$ ${highestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          averagePrice: `R$ ${averagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          priceRange: `R$ ${lowestPrice.toLocaleString('pt-BR')} - R$ ${highestPrice.toLocaleString('pt-BR')}`,
          freeShippingCount,
          freeShippingPercentage: Math.round((freeShippingCount / products.length) * 100),
          catalogProductsCount: catalogCount,
          bestDiscount: bestDiscountProduct?.discount || 'N/A',
          recommendation,
        },
        filters: searchData.available_filters?.map(f => ({
          id: f.id,
          name: f.name,
          values: f.values.slice(0, 10).map(v => ({
            id: v.id,
            name: v.name,
            count: v.results,
          })),
        })) || [],
        trendingSearches,
      }
    };

    console.log("=== MELI SEARCH SUCCESS ===");
    console.log("Products processed:", products.length);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("=== MELI SEARCH ERROR ===");
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage || "Erro ao buscar produtos",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
