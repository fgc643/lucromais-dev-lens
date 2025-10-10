import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Analisando produto:', productName);

    const systemPrompt = `Você é um assistente especializado em análise de marketplaces brasileiros. 
Analise o produto fornecido e retorne informações detalhadas sobre:
1. Preços médios encontrados nos principais marketplaces (Mercado Livre, Amazon, Shopee, Magazine Luiza, Americanas)
2. Melhor marketplace para vender este produto
3. Dicas de precificação e estratégia de vendas
4. Alertas sobre comissões e taxas específicas
5. Sugestões de melhorias no produto ou descrição

Retorne a resposta em formato JSON estruturado com os seguintes campos:
{
  "analysis": "análise detalhada do produto",
  "marketplaces": [
    {
      "name": "nome do marketplace",
      "averagePrice": valor numérico,
      "competition": "baixa/média/alta",
      "recommendation": "descrição da recomendação"
    }
  ],
  "bestMarketplace": "nome do melhor marketplace",
  "pricing": {
    "suggestedPrice": valor numérico,
    "minPrice": valor numérico,
    "maxPrice": valor numérico
  },
  "tips": ["dica 1", "dica 2", "dica 3"],
  "alerts": ["alerta 1", "alerta 2"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analise este produto: "${productName}" da categoria "${category}". Faça uma varredura completa nos marketplaces brasileiros e forneça uma análise detalhada com preços, concorrência e dicas estratégicas.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Resposta da IA recebida');

    // Tentar extrair JSON da resposta
    let analysisData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = { analysis: aiResponse, tips: [], alerts: [] };
      }
    } catch (e) {
      console.error('Erro ao parsear JSON:', e);
      analysisData = { analysis: aiResponse, tips: [], alerts: [] };
    }

    return new Response(
      JSON.stringify({ success: true, data: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
