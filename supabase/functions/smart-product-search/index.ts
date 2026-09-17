import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base de conhecimento de marketplaces 2026
const MARKETPLACE_KNOWLEDGE_2026 = `
═══════════════════════════════════════════════════════════════
📊 DADOS DE REFERÊNCIA DOS MARKETPLACES - SETEMBRO 2026
═══════════════════════════════════════════════════════════════

🟡 MERCADO LIVRE:
- Maior marketplace do Brasil (65% do mercado)
- Frete grátis acima de R$ 79 (Full)
- Comissões: 11% a 19% dependendo da categoria
- Mercado Pago: 4.49% cartão, 3.99% PIX
- Parcelamento: até 18x

🟠 AMAZON BRASIL:
- Segundo maior marketplace
- Prime: Frete grátis e entrega rápida
- Comissões: 8% a 17%
- Buy Box define visibilidade
- FBA disponível para logística

🟧 SHOPEE:
- Foco em preço baixo
- Frete grátis acima de R$ 29
- Comissões: 14% a 20%
- Muito cashback e cupons
- Lives e gamificação

🔵 MAGAZINE LUIZA:
- Forte presença física (1000+ lojas)
- Retira em loja grátis
- Comissões: 12% a 22%
- Magalu Entregas próprio

🔴 AMERICANAS:
- Tradicional no e-commerce BR
- Comissões: 16% a 20%
- Integração B2W
- Lojas físicas para retirada

🟢 CASAS BAHIA:
- Foco em móveis e eletro
- Carnê digital
- Comissões: 12% a 19%
- Via Varejo ecossistema

═══════════════════════════════════════════════════════════════
📦 REFERÊNCIA DE FRETE 2026 (CORREIOS/TRANSPORTADORAS)
═══════════════════════════════════════════════════════════════
• Produtos até 300g: R$ 15 a R$ 25
• Produtos 300g-1kg: R$ 25 a R$ 45
• Produtos 1kg-5kg: R$ 40 a R$ 80
• Produtos 5kg-10kg: R$ 70 a R$ 150
• Produtos 10kg+: R$ 100 a R$ 300+

MINI ENVIOS (até 300g, fino): R$ 12 a R$ 18
SEDEX: +50% a +80% sobre PAC
FULL/FBA: Geralmente incluso no preço

═══════════════════════════════════════════════════════════════
💳 PARCELAMENTO TÍPICO 2026
═══════════════════════════════════════════════════════════════
• 1x: Preço à vista
• 3x: Sem juros (absorvido pelo vendedor ~2%)
• 6x: Sem juros (absorvido ~4%)
• 10x: Sem juros (absorvido ~6%)
• 12x: Com/sem juros dependendo do marketplace
`;

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
  shippingDays?: string;
  specifications?: string[];
  condition?: string;
  warranty?: string;
  installments?: string;
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

    const systemPrompt = `Você é um ESPECIALISTA EM PESQUISA DE MERCADO BRASILEIRO com acesso aos dados mais atualizados de Setembro de 2026.

${MARKETPLACE_KNOWLEDGE_2026}

📅 Data atual: ${currentDate}

🎯 SUA MISSÃO:
Simular uma pesquisa REALISTA de produtos nos principais marketplaces brasileiros, retornando dados que refletem preços, condições e ofertas REAIS do mercado atual.

📋 REGRAS PARA GERAÇÃO DE DADOS:

1. PREÇOS REALISTAS:
   - Base seus preços em valores reais do mercado brasileiro 2026
   - Considere inflação e tendências de preço
   - Varie os preços entre marketplaces (Amazon geralmente mais caro, Shopee mais barato)
   - Descontos realistas: 5% a 40% (não 90%)

2. VENDEDORES:
   - Use nomes de vendedores típicos brasileiros
   - Misture lojas oficiais com sellers
   - Algumas lojas conhecidas: Loja Oficial [Marca], Tech Store, Mega Eletrônicos, Casa Digital, etc.

3. AVALIAÇÕES:
   - Ratings entre 3.8 e 5.0
   - Número de reviews proporcional ao marketplace
   - ML/Amazon: milhares de reviews
   - Shopee: centenas a milhares
   - Magalu/Americanas: centenas

4. FRETE:
   - Variar entre "Frete grátis", "R$ X,XX", "Consulte"
   - Full/Prime sempre grátis para valores acima do mínimo
   - Prazos: 1-15 dias úteis dependendo do serviço

5. ESPECIFICAÇÕES:
   - 3-5 specs relevantes para o produto
   - Dados técnicos quando aplicável

6. IMAGENS:
   - Use URLs de placeholder: https://images.unsplash.com/photo-[ID]?w=400&h=400
   - IDs realistas de fotos de produtos

RESPONDA APENAS EM JSON com estrutura:
{
  "searchQuery": "termo",
  "timestamp": "${currentDate}",
  "totalResults": número,
  "marketplaces": [
    {
      "name": "Nome Marketplace",
      "logo": "emoji",
      "totalProducts": número,
      "priceRange": "R$ X a R$ Y",
      "products": [
        {
          "name": "Nome completo do produto",
          "price": "R$ X.XXX,XX",
          "originalPrice": "R$ X.XXX,XX",
          "discount": "XX%",
          "image": "https://images.unsplash.com/...",
          "url": "https://marketplace.com/produto",
          "seller": "Nome do Vendedor",
          "sellerRating": "X.X",
          "rating": "X.X",
          "reviews": "X.XXX",
          "shipping": "Frete grátis / R$ XX,XX",
          "shippingDays": "X-X dias úteis",
          "condition": "Novo/Usado",
          "warranty": "X meses",
          "installments": "Até Xx de R$ XX,XX sem juros",
          "specifications": ["spec1", "spec2", "spec3"],
          "badges": ["Full", "Prime", "Mais Vendido", "Frete Grátis"]
        }
      ]
    }
  ],
  "insights": {
    "lowestPrice": "R$ X.XXX,XX",
    "lowestPriceMarketplace": "Nome",
    "lowestPriceProduct": "Nome do produto",
    "highestPrice": "R$ X.XXX,XX",
    "averagePrice": "R$ X.XXX,XX",
    "priceVariation": "XX%",
    "bestRated": "Nome do produto",
    "bestRatedMarketplace": "Nome",
    "bestValue": "Nome do produto (melhor custo-benefício)",
    "recommendation": "Análise detalhada de onde comprar e por quê",
    "savingsOpportunity": "Economia potencial de R$ X ao comprar no marketplace X",
    "marketTrend": "tendência de preço (subindo/estável/caindo)",
    "bestTimeToBy": "Dica de quando comprar"
  },
  "relatedSearches": ["busca relacionada 1", "busca relacionada 2"],
  "priceHistory": {
    "trend": "subindo/estável/descendo",
    "lastMonth": "R$ X.XXX,XX (média)",
    "prediction": "Texto sobre previsão"
  }
}`;

    const userPrompt = `Busque informações DETALHADAS e REALISTAS sobre: "${searchQuery}"${category ? ` na categoria: ${category}` : ''}

IMPORTANTE:
1. Retorne 3-4 produtos de cada marketplace principal (Mercado Livre, Amazon, Shopee, Magazine Luiza, Americanas)
2. Preços devem refletir o mercado brasileiro de Setembro 2026
3. Varie preços entre marketplaces (diferença de 5% a 30%)
4. Inclua produtos de diferentes faixas de preço
5. Dados de frete realistas
6. Avaliações e reviews proporcionais

Retorne APENAS o JSON estruturado, sem texto adicional.`;

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
        max_tokens: 6000,
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
