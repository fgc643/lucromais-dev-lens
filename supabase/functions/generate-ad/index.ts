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

    const systemPrompt = `Você é um COPYWRITER PROFISSIONAL BRASILEIRO, especialista em vendas em marketplaces online.

⚠️ REGRA CRÍTICA - PORTUGUÊS PERFEITO:
- Você DEVE escrever em português brasileiro IMPECÁVEL, sem NENHUM erro de ortografia ou gramática
- NUNCA escreva palavras erradas como "BAÍSSIMO" - o correto é "BAIXÍSSIMO"
- NUNCA use letras maiúsculas excessivas em palavras erradas
- Revise CADA palavra antes de incluir no texto
- Use acentuação correta: "últimas" (não "ultimas"), "promoção" (não "promocao")
- Escreva de forma NATURAL e HUMANIZADA, como um vendedor experiente falaria

🎯 ESTILO DE ESCRITA HUMANIZADO:
- Escreva como se estivesse conversando com o cliente
- Use frases naturais e fluidas, não robóticas
- Evite exageros artificiais - seja persuasivo mas autêntico
- Prefira linguagem acessível e clara
- Crie conexão emocional genuína

🧠 GATILHOS MENTAIS (use com naturalidade):

1. ESCASSEZ - Transmita raridade de forma elegante:
- "Poucas unidades disponíveis"
- "Estoque limitado"
- "Últimas peças"

2. URGÊNCIA - Crie senso de oportunidade:
- "Oferta por tempo limitado"
- "Aproveite enquanto disponível"
- "Condição especial válida hoje"

3. PROVA SOCIAL - Mostre credibilidade:
- "Milhares de clientes satisfeitos"
- "Avaliações positivas"
- "Produto mais vendido"

4. AUTORIDADE - Transmita confiança:
- "Qualidade garantida"
- "Marca de confiança"
- "Padrão de excelência"

5. RECIPROCIDADE - Ofereça valor:
- "Frete grátis incluso"
- "Bônus especial"
- "Garantia estendida"

6. COMPROMISSO - Reduza riscos:
- "Satisfação garantida"
- "Devolução sem complicação"
- "Compra segura"

7. CONEXÃO EMOCIONAL - Humanize:
- Use linguagem calorosa
- Fale dos benefícios para a vida do cliente
- Mostre que você entende as necessidades dele

📝 REGRAS DE COPYWRITING:
- Transforme características em BENEFÍCIOS reais
- Use palavras de impacto: Grátis, Novo, Exclusivo, Você, Agora
- Números específicos geram credibilidade (97%, 3x mais rápido)
- Emojis estratégicos para destacar pontos importantes
- Frases curtas e objetivas
- Adapte o tom ao marketplace (${'' /* será preenchido */})

🔄 GERE 2 VERSÕES PARA TESTE A/B:
- Versão A: Foco em ESCASSEZ + URGÊNCIA (criar senso de oportunidade)
- Versão B: Foco em PROVA SOCIAL + AUTORIDADE (criar confiança)

Responda APENAS em formato JSON válido.`;

    const userPrompt = `Crie 2 anúncios persuasivos e HUMANIZADOS para este produto:

📦 PRODUTO: ${productName}
📂 CATEGORIA: ${category}  
🛒 MARKETPLACE: ${marketplace}
💰 PREÇO: R$ ${salePrice?.toFixed(2) || '0,00'}
${features ? `✨ CARACTERÍSTICAS: ${features}` : ''}

IMPORTANTE:
- Português brasileiro PERFEITO, sem erros de ortografia
- Texto natural e humanizado, como um vendedor experiente
- Persuasivo mas autêntico, sem exageros artificiais
- Use os gatilhos mentais de forma sutil e eficaz

Responda no formato JSON:
{
  "versaoA": {
    "titulo": "título persuasivo com escassez (máximo 60 caracteres)",
    "subtitulo": "subtítulo complementar (máximo 80 caracteres)",
    "descricao": "3 parágrafos naturais focando benefícios e transformação",
    "bullets": ["benefício 1 com emoji", "benefício 2 com emoji", "benefício 3 com emoji", "benefício 4 com emoji"],
    "callToAction": "chamada para ação convincente",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "gatilhos": ["escassez", "urgência"]
  },
  "versaoB": {
    "titulo": "título com prova social (máximo 60 caracteres)",
    "subtitulo": "subtítulo diferente (máximo 80 caracteres)",
    "descricao": "3 parágrafos focando credibilidade e confiança",
    "bullets": ["benefício 1 com emoji", "benefício 2 com emoji", "benefício 3 com emoji", "benefício 4 com emoji"],
    "callToAction": "chamada para ação diferente",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "gatilhos": ["prova_social", "autoridade"]
  }
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
      // Retornar resposta raw com estrutura A/B
      const fallbackAd = {
        titulo: `${productName} - Últimas Unidades Disponíveis`,
        subtitulo: `O melhor ${category} do ${marketplace} com condição especial`,
        descricao: content,
        bullets: ['✅ Qualidade Premium Garantida', '🚀 Entrega Rápida e Segura', '🔒 Compra 100% Protegida', '⭐ Avaliações Positivas'],
        callToAction: 'Garanta o Seu Agora - Estoque Limitado',
        tags: [category, marketplace, 'oferta', 'promoção', 'qualidade'],
        gatilhos: ['escassez', 'urgência']
      };
      adData = {
        versaoA: fallbackAd,
        versaoB: { ...fallbackAd, titulo: `${productName} - Escolha de Milhares de Clientes`, gatilhos: ['prova_social', 'autoridade'] }
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
