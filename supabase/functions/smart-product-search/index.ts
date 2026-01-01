import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  marketplace: string;
  products: ProductResult[];
  timestamp: string;
}

interface ProductResult {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, category } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query de busca é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for:', searchQuery, 'Category:', category);

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const systemPrompt = `Você é um especialista em pesquisa de produtos nos principais marketplaces brasileiros. 
Sua função é fornecer informações REAIS e ATUALIZADAS sobre produtos.

Data e hora atual: ${currentDate}

IMPORTANTE: Você deve simular uma busca real nos seguintes marketplaces:
- Mercado Livre
- Amazon Brasil
- Shopee Brasil
- Magazine Luiza
- Americanas
- Casas Bahia

Para cada marketplace, forneça:
1. Nome completo do produto
2. Preço atual (em R$)
3. Preço original (se houver desconto)
4. Percentual de desconto
5. URL de imagem do produto (use placeholders realistas como https://images.unsplash.com para produtos)
6. Nome do vendedor
7. Avaliação (estrelas)
8. Número de avaliações
9. Informações de frete
10. Especificações principais

RETORNE APENAS JSON VÁLIDO no seguinte formato:
{
  "searchQuery": "termo buscado",
  "timestamp": "data/hora da busca",
  "totalResults": número,
  "marketplaces": [
    {
      "name": "Nome do Marketplace",
      "logo": "emoji do marketplace",
      "products": [
        {
          "name": "Nome do Produto",
          "price": "R$ 999,99",
          "originalPrice": "R$ 1.299,99",
          "discount": "23%",
          "image": "https://images.unsplash.com/photo-...",
          "url": "https://marketplace.com/produto",
          "seller": "Nome do Vendedor",
          "rating": "4.8",
          "reviews": "1.234",
          "shipping": "Frete grátis",
          "specifications": ["Especificação 1", "Especificação 2"]
        }
      ]
    }
  ],
  "insights": {
    "lowestPrice": "R$ XXX",
    "lowestPriceMarketplace": "Nome",
    "averagePrice": "R$ XXX",
    "bestRated": "Nome do produto",
    "recommendation": "Texto com recomendação"
  }
}`;

    const userPrompt = `Busque informações sobre: "${searchQuery}"${category ? ` na categoria: ${category}` : ''}

Retorne pelo menos 2-3 produtos de cada marketplace com dados realistas baseados em preços típicos do mercado brasileiro.
Inclua variações de preço entre os marketplaces e diferentes vendedores.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições atingido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response received, parsing...');

    // Parse the JSON response
    let searchResults;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        searchResults = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return a structured fallback
      searchResults = {
        searchQuery,
        timestamp: currentDate,
        totalResults: 0,
        marketplaces: [],
        insights: {
          lowestPrice: "N/A",
          lowestPriceMarketplace: "N/A",
          averagePrice: "N/A",
          bestRated: "N/A",
          recommendation: "Não foi possível processar a busca. Tente novamente."
        },
        error: "Erro ao processar resultados"
      };
    }

    console.log('Search completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: searchResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in smart-product-search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
