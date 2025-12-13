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
    const { productName, category, marketplace, salePrice, costPrice, features } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um copywriter especialista em vendas online e marketplaces brasileiros. 
Sua missão é criar anúncios EXTREMAMENTE PERSUASIVOS que VENDEM.

REGRAS DE OURO:
- Use gatilhos mentais: escassez, urgência, prova social, autoridade
- Foque em BENEFÍCIOS, não características
- Use linguagem emocional que conecta com o cliente
- Adapte o tom para o marketplace específico
- Inclua call-to-action irresistível
- Use emojis estrategicamente para chamar atenção
- Crie senso de urgência e exclusividade

ESTRUTURA DO ANÚNCIO:
1. TÍTULO: Impactante, com palavra-chave + benefício principal (máx 60 caracteres)
2. SUBTÍTULO: Complemento persuasivo (máx 80 caracteres)
3. DESCRIÇÃO: 3 parágrafos persuasivos focados em benefícios e transformação
4. BULLETS: 5-7 pontos de benefícios com emojis
5. CALL TO ACTION: Frase de fechamento irresistível
6. TAGS/PALAVRAS-CHAVE: 10 tags relevantes para SEO

Responda APENAS em formato JSON válido.`;

    const userPrompt = `Crie um anúncio SUPER PERSUASIVO para:

PRODUTO: ${productName}
CATEGORIA: ${category}
MARKETPLACE: ${marketplace}
PREÇO DE VENDA: R$ ${salePrice?.toFixed(2) || '0,00'}
${features ? `CARACTERÍSTICAS: ${features}` : ''}

Gere o anúncio otimizado para ${marketplace} que vai DOMINAR as vendas!

Responda no formato JSON:
{
  "titulo": "título impactante",
  "subtitulo": "subtítulo persuasivo",
  "descricao": "descrição completa com 3 parágrafos",
  "bullets": ["benefício 1", "benefício 2", ...],
  "callToAction": "frase de fechamento",
  "tags": ["tag1", "tag2", ...]
}`;

    console.log('Gerando anúncio para:', productName, marketplace);

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    // Extrair JSON da resposta
    let adData;
    try {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        adData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError, content);
      // Retornar resposta raw se não conseguir parsear
      adData = {
        titulo: productName,
        subtitulo: `O melhor ${category} do ${marketplace}`,
        descricao: content,
        bullets: [],
        callToAction: 'Compre agora!',
        tags: [category, marketplace]
      };
    }

    console.log('Anúncio gerado com sucesso');

    return new Response(JSON.stringify({ ad: adData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao gerar anúncio:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
