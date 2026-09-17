import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Conhecimento específico por marketplace 2026
const MARKETPLACE_COPYWRITING_2026 = `
═══════════════════════════════════════════════════════════════
📝 GUIA DE COPYWRITING POR MARKETPLACE - 2026
═══════════════════════════════════════════════════════════════

🟡 MERCADO LIVRE:
TÍTULO (até 60 caracteres):
- Use palavra-chave principal no início
- Inclua modelo/marca/especificação
- Evite caps lock excessivo
- Exemplo: "iPhone 15 Pro Max 256GB Preto - Lacrado Original"

DESCRIÇÃO:
- Use a estrutura de ficha técnica
- Bullets organizados
- Inclua garantia e política de devolução
- Perguntas frequentes no final

PALAVRAS QUE VENDEM:
- "Original", "Lacrado", "Pronta Entrega"
- "Garantia", "Nota Fiscal", "Loja Oficial"
- "Full" (frete grátis), "Envio Imediato"

ALGORITMO 2026:
- Relevância do título (40%)
- Reputação do vendedor (25%)
- Preço competitivo (20%)
- Qualidade das fotos (15%)

🟠 AMAZON:
TÍTULO (até 200 caracteres):
- Marca + Modelo + Características principais
- Cor/Tamanho se aplicável
- Exemplo: "Apple iPhone 15 Pro Max (256 GB) - Titânio Preto, Tela Super Retina XDR de 6,7", Chip A17 Pro"

BULLETS (5 principais):
- Um benefício por bullet
- Comece com palavra de ação
- Inclua especificações técnicas

DESCRIÇÃO A+:
- Use imagens e texto formatado
- Conta a história do produto
- Comparativos são permitidos

PALAVRAS QUE VENDEM:
- "Enviado por Amazon", "Prime"
- "Bestseller", "Amazon's Choice"
- "Garantia Amazon"

BUY BOX:
- Preço competitivo é CRUCIAL
- Estoque disponível
- Métricas de vendedor perfeitas

🟧 SHOPEE:
TÍTULO (até 100 caracteres):
- Emojis permitidos e recomendados!
- Palavras promocionais: "PROMOÇÃO", "OFERTA"
- Exemplo: "🔥 iPhone 15 Pro Max 256GB ⭐ Lacrado + Nota Fiscal ✅ Envio 24h"

DESCRIÇÃO:
- Informal e direta
- Use emojis liberalmente
- Destaque cupons e cashback
- Linguagem jovem

PALAVRAS QUE VENDEM:
- "Frete Grátis", "Cupom", "Cashback"
- "Promoção Relâmpago", "Desconto"
- "Loja Oficial", "Envio Rápido"

LIVE COMMERCE:
- 35% das vendas em 2026
- Interação ao vivo aumenta conversão
- Ofertas exclusivas na live

🔵 MAGAZINE LUIZA:
TÍTULO:
- Profissional e direto
- Modelo completo
- Exemplo: "Smartphone Apple iPhone 15 Pro Max 256GB Titânio Preto"

DESCRIÇÃO:
- Foco em especificações técnicas
- Comparativo com outros produtos
- Condições de pagamento em destaque

PALAVRAS QUE VENDEM:
- "Retira em Loja", "Magalu Entrega"
- "Parcele em até 24x"
- "Produto Original Magalu"

🔴 AMERICANAS:
TÍTULO:
- Similar ao Mercado Livre
- Modelo + Especificações

DESCRIÇÃO:
- Estruturada com bullets
- Condições de frete
- Política de troca

═══════════════════════════════════════════════════════════════
🧠 GATILHOS MENTAIS AVANÇADOS 2026
═══════════════════════════════════════════════════════════════

1. ESCASSEZ INTELIGENTE:
❌ Errado: "ÚLTIMAS UNIDADES!!!"
✅ Certo: "Apenas 3 unidades disponíveis neste valor"

2. URGÊNCIA AUTÊNTICA:
❌ Errado: "CORRA! VAI ACABAR!"
✅ Certo: "Oferta válida até hoje às 23h59"

3. PROVA SOCIAL ESPECÍFICA:
❌ Errado: "Milhares de clientes"
✅ Certo: "Mais de 2.847 unidades vendidas este mês"

4. AUTORIDADE DEMONSTRADA:
❌ Errado: "Somos os melhores"
✅ Certo: "8 anos no mercado • Loja verificada • 99% de avaliações positivas"

5. RECIPROCIDADE REAL:
❌ Errado: "Frete grátis"
✅ Certo: "Frete grátis + Brinde exclusivo + Garantia estendida"

6. COMPROMISSO PROGRESSIVO:
❌ Errado: "Compre agora"
✅ Certo: "Adicione ao carrinho e ganhe 10% de desconto na finalização"

7. AFINIDADE E CONEXÃO:
- Use linguagem do público-alvo
- Referências culturais brasileiras
- Mostre que entende a dor/necessidade

═══════════════════════════════════════════════════════════════
📊 TENDÊNCIAS DE COPY 2026
═══════════════════════════════════════════════════════════════

• IA TRANSPARENTE: Mencione quando IA ajudou (gera confiança)
• SUSTENTABILIDADE: Selo verde/reciclável aumenta vendas 15%
• VÍDEO > TEXTO: Video reviews convertem 2x mais
• AUTENTICIDADE: Menos "perfeito", mais "real"
• COMUNIDADE: "Faça parte dos 10.000 que já têm"
• MICRO-INFLUENCIADORES: "Recomendado por @fulano"
`;

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

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const systemPrompt = `Você é um COPYWRITER BRASILEIRO DE ELITE, especialista em vendas em marketplaces online com conhecimento atualizado de Setembro de 2026.

${MARKETPLACE_COPYWRITING_2026}

📅 Data: ${currentDate}
🛒 Marketplace alvo: ${marketplace || 'Geral'}

⚠️ REGRAS CRÍTICAS:

1. PORTUGUÊS BRASILEIRO IMPECÁVEL:
   - Zero erros de ortografia ou gramática
   - Acentuação correta sempre
   - Palavras com grafia correta (BAIXÍSSIMO, não "baissimo")

2. COPYWRITING HUMANIZADO:
   - Escreva como um vendedor experiente falaria
   - Natural, fluido, persuasivo mas autêntico
   - Evite clichês robóticos de IA

3. ADAPTAÇÃO AO MARKETPLACE:
   ${marketplace === 'Mercado Livre' ? '- Título até 60 chars, formato profissional' : ''}
   ${marketplace === 'Shopee' ? '- Use emojis! Linguagem jovem e promocional' : ''}
   ${marketplace === 'Amazon' ? '- Formato técnico, bullets claros' : ''}
   ${marketplace === 'Magazine Luiza' ? '- Profissional, foco em parcelamento' : ''}
   - Adapte o tom e formato ao marketplace escolhido

4. GATILHOS MENTAIS SUTIS:
   - Use escassez e urgência de forma elegante
   - Prova social com números específicos
   - Autoridade demonstrada, não afirmada
   - Reciprocidade real (brindes, garantias)

5. CALL TO ACTION EFICAZ:
   - Específico para o marketplace
   - Urgência sem desespero
   - Benefício claro na ação

🎯 ESTRUTURA DO ANÚNCIO:

VERSÃO A (Escassez + Urgência):
- Foco em oportunidade limitada
- "Últimas unidades", "Oferta por tempo limitado"
- CTA: Ação imediata

VERSÃO B (Prova Social + Autoridade):
- Foco em credibilidade
- "X clientes satisfeitos", "Loja verificada"
- CTA: Confiança na escolha

Responda APENAS em JSON válido.`;

    const userPrompt = `Crie 2 anúncios PROFISSIONAIS e PERSUASIVOS para:

📦 PRODUTO: ${productName}
📂 CATEGORIA: ${category}
🛒 MARKETPLACE: ${marketplace || 'Geral'}
💰 PREÇO: R$ ${salePrice?.toFixed(2) || '0,00'}
${costPrice ? `💵 CUSTO: R$ ${costPrice.toFixed(2)}` : ''}
${features ? `✨ CARACTERÍSTICAS: ${features}` : ''}

REQUISITOS:
1. Português brasileiro PERFEITO
2. Adapte ao estilo do ${marketplace || 'marketplace'}
3. Use gatilhos mentais de forma natural
4. Títulos que capturam atenção
5. Descrições que vendem
6. CTAs que convertem

JSON OBRIGATÓRIO:
{
  "versaoA": {
    "titulo": "título persuasivo (respeitar limite do marketplace)",
    "subtitulo": "complemento que gera interesse",
    "descricao": "3 parágrafos: abertura impactante, benefícios/transformação, fechamento com urgência",
    "bullets": [
      "✅ Benefício 1 com prova",
      "🚀 Benefício 2 com resultado",
      "🔒 Benefício 3 com garantia",
      "⭐ Benefício 4 com diferencial",
      "🎁 Benefício 5 com bônus"
    ],
    "callToAction": "CTA com urgência elegante",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "gatilhos": ["escassez", "urgência"],
    "seoKeywords": ["keyword1", "keyword2", "keyword3"],
    "hashtagsRedes": ["#hash1", "#hash2", "#hash3"]
  },
  "versaoB": {
    "titulo": "título com prova social",
    "subtitulo": "complemento com autoridade",
    "descricao": "3 parágrafos: credibilidade, resultados, confiança",
    "bullets": [
      "⭐ Benefício 1 com avaliação",
      "🏆 Benefício 2 com conquista",
      "👥 Benefício 3 com comunidade",
      "✅ Benefício 4 com verificação",
      "🛡️ Benefício 5 com segurança"
    ],
    "callToAction": "CTA com confiança",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "gatilhos": ["prova_social", "autoridade"],
    "seoKeywords": ["keyword1", "keyword2", "keyword3"],
    "hashtagsRedes": ["#hash1", "#hash2", "#hash3"]
  },
  "dicasExtras": {
    "melhorHorarioPostar": "horários com maior engajamento",
    "formatoFoto": "dicas para fotos que vendem",
    "videoSugestao": "sugestão de vídeo curto",
    "respostasProntas": ["resposta FAQ 1", "resposta FAQ 2"]
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
        temperature: 0.8,
        max_tokens: 4000,
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
        titulo: `${productName} - Oferta Especial`,
        subtitulo: `O melhor ${category} do ${marketplace || 'mercado'}`,
        descricao: content,
        bullets: ['✅ Qualidade Premium', '🚀 Entrega Rápida', '🔒 Compra Segura', '⭐ Alta Avaliação', '🎁 Brinde Exclusivo'],
        callToAction: 'Garanta Já o Seu',
        tags: [category, marketplace || 'oferta', 'promoção', 'qualidade', 'original'],
        gatilhos: ['escassez', 'urgência'],
        seoKeywords: [productName, category, 'comprar'],
        hashtagsRedes: [`#${category}`, '#oferta', '#promocao']
      };
      adData = {
        versaoA: fallbackAd,
        versaoB: { ...fallbackAd, titulo: `${productName} - Escolha de Milhares`, gatilhos: ['prova_social', 'autoridade'] }
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
