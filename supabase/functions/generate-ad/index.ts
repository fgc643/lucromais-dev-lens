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

    const systemPrompt = `Você é o MAIOR COPYWRITER do Brasil, especialista em vendas explosivas em marketplaces. 
Você domina TODOS os gatilhos mentais de persuasão e influência que fazem as pessoas COMPRAREM IMEDIATAMENTE.

🧠 GATILHOS MENTAIS OBRIGATÓRIOS EM CADA ANÚNCIO:

1. ESCASSEZ 🔥
- "Últimas unidades disponíveis"
- "Estoque limitadíssimo"
- "Só restam X em estoque"
- "Edição limitada"
- "Exclusivo - Poucos disponíveis"

2. URGÊNCIA ⏰
- "Promoção por tempo limitado"
- "Oferta válida apenas hoje"
- "Preço especial acaba em breve"
- "Não perca esta oportunidade ÚNICA"
- "Aproveite AGORA antes que acabe"

3. PROVA SOCIAL 👥
- "Mais de X mil clientes satisfeitos"
- "Avaliação 5 estrelas"
- "O mais vendido da categoria"
- "Preferido pelos brasileiros"
- "Recomendado por especialistas"
- "Milhares já compraram e aprovaram"

4. AUTORIDADE 👑
- "Qualidade Premium certificada"
- "Marca líder de mercado"
- "Tecnologia de ponta"
- "Aprovado e testado"
- "Garantia do fabricante"
- "Padrão internacional de qualidade"

5. RECIPROCIDADE 🎁
- "Brinde exclusivo incluso"
- "Frete grátis especial"
- "Bônus surpresa"
- "Garantia estendida de cortesia"

6. COMPROMISSO 🤝
- "Satisfação garantida ou dinheiro de volta"
- "Garantia total sem perguntas"
- "Experimente sem risco"

7. AFEIÇÃO ❤️
- Use linguagem calorosa e pessoal
- Conecte emocionalmente
- Mostre que se importa com o cliente

REGRAS DE OURO:
- NUNCA liste características, SEMPRE transforme em BENEFÍCIOS que mudam a vida
- Use palavras de PODER: GRÁTIS, NOVO, EXCLUSIVO, GARANTIDO, VOCÊ, AGORA
- Crie DÚVIDA no leitor: "Será que você pode perder essa oportunidade?"
- Use números específicos (97%, 3x mais, 24 horas)
- Emojis estratégicos para destacar e criar emoção
- Frases curtas e impactantes
- Adapte o tom ao marketplace (${marketplace})

GERE 2 VERSÕES (A e B) para teste A/B:
- Versão A: Foco em ESCASSEZ + URGÊNCIA
- Versão B: Foco em PROVA SOCIAL + AUTORIDADE

Responda APENAS em formato JSON válido.`;

    const userPrompt = `Crie 2 ANÚNCIOS HIPNÓTICOS que vão fazer as pessoas COMPRAREM IMEDIATAMENTE:

🎯 PRODUTO: ${productName}
📦 CATEGORIA: ${category}  
🛒 MARKETPLACE: ${marketplace}
💰 PREÇO: R$ ${salePrice?.toFixed(2) || '0,00'}
${features ? `⭐ CARACTERÍSTICAS: ${features}` : ''}

Use TODOS os gatilhos mentais de persuasão. Faça o cliente sentir que PRECISA comprar AGORA ou vai se arrepender!

Responda no formato JSON com 2 versões A/B:
{
  "versaoA": {
    "titulo": "título com escassez/urgência (máx 60 chars)",
    "subtitulo": "subtítulo persuasivo (máx 80 chars)",
    "descricao": "3 parágrafos emocionais focados em transformação e benefícios",
    "bullets": ["benefício 1 com emoji", "benefício 2 com emoji", ...],
    "callToAction": "CTA irresistível com urgência",
    "tags": ["tag1", "tag2", ...],
    "gatilhos": ["escassez", "urgência", ...]
  },
  "versaoB": {
    "titulo": "título com prova social/autoridade (máx 60 chars)",
    "subtitulo": "subtítulo persuasivo diferente (máx 80 chars)",
    "descricao": "3 parágrafos diferentes focados em credibilidade",
    "bullets": ["benefício 1 com emoji", "benefício 2 com emoji", ...],
    "callToAction": "CTA diferente com autoridade",
    "tags": ["tag1", "tag2", ...],
    "gatilhos": ["prova_social", "autoridade", ...]
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
        titulo: `🔥 ${productName} - ÚLTIMAS UNIDADES!`,
        subtitulo: `O melhor ${category} do ${marketplace} - Oferta LIMITADA`,
        descricao: content,
        bullets: ['✅ Qualidade Premium Garantida', '🚀 Entrega Rápida', '🔒 Compra 100% Segura'],
        callToAction: '🛒 COMPRE AGORA - ESTOQUE ACABANDO!',
        tags: [category, marketplace, 'oferta', 'promoção'],
        gatilhos: ['escassez', 'urgência']
      };
      adData = {
        versaoA: fallbackAd,
        versaoB: { ...fallbackAd, titulo: `⭐ ${productName} - Mais Vendido!`, gatilhos: ['prova_social', 'autoridade'] }
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
