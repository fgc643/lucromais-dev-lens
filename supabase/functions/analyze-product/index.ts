import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base de conhecimento atualizada Janeiro 2026 - Marketplaces Brasileiros
const MARKETPLACE_DATA_2026 = `
📊 BASE DE DADOS ATUALIZADA - JANEIRO 2026

═══════════════════════════════════════════════════════════════
🟡 MERCADO LIVRE - Líder do e-commerce brasileiro
═══════════════════════════════════════════════════════════════
COMISSÕES POR CATEGORIA (2026):
• Eletrônicos: 13% a 17% (depende da subcategoria)
• Celulares/Smartphones: 12%
• Moda/Vestuário: 16% a 19%
• Casa/Decoração: 15% a 17%
• Esportes/Fitness: 14% a 16%
• Beleza/Cuidados: 16% a 18%
• Brinquedos/Games: 15% a 17%
• Automotivo: 13% a 15%
• Pet Shop: 15% a 17%

TAXAS DE PAGAMENTO (Mercado Pago):
• Cartão de Crédito: 4.49% + R$ 0.40 por transação
• PIX: 3.99% 
• Boleto: 3.99% + R$ 3.49

NÍVEIS DE VENDEDOR:
• MercadoLíder: Desconto de 2-4% na comissão
• MercadoLíder Platinum: Desconto de 4-6% na comissão
• Eshop verificado: Selo de confiança + destaque

FRETE (Mercado Envios 2026):
• Full (estoque no CD ML): Frete grátis acima R$ 79
• Coleta: Frete calculado por peso/distância
• Flex (entrega própria): Menor taxa mas sem destaque
• SEDEX/PAC integrado: -30% desconto Correios

FULFILLMENT (Full):
• Taxa armazenamento: R$ 0.35/unidade/mês
• Taxa logística: 8% a 15% do valor (inclui frete)
• Benefícios: Entrega em 24-48h, selo Full, prioridade busca

TENDÊNCIAS 2026:
• Live Commerce integrado (ML Live)
• Anúncios com IA (descrições geradas)
• Catálogo obrigatório para categorias principais
• Mercado Play (streaming + vendas)

═══════════════════════════════════════════════════════════════
🟠 AMAZON BRASIL - Gigante americano
═══════════════════════════════════════════════════════════════
COMISSÕES POR CATEGORIA (2026):
• Eletrônicos: 8% a 15%
• Livros: 15%
• Moda/Vestuário: 17%
• Casa/Jardim: 15%
• Beleza: 15%
• Esportes: 15%
• Brinquedos: 15%
• Alimentos: 8% a 15%
• Automotivo: 12%

PLANOS DE VENDA:
• Individual: R$ 2.00/item vendido + comissão
• Profissional: R$ 19/mês + comissão (sem taxa por item)

FBA (Fulfillment by Amazon):
• Armazenamento: R$ 25-50/m³/mês (varia por época)
• Taxa logística: R$ 7 a R$ 25 por unidade (peso/tamanho)
• Benefícios: Prime, Buy Box, frete grátis automático

FRETE:
• FBA: Frete Prime (grátis para assinantes)
• FBM: Calculado por peso, desconto até 35%
• Entrega rápida: Até 2 dias úteis nas capitais

VANTAGENS 2026:
• Buy Box algoritmo renovado (preço + avaliação + estoque)
• Amazon Ads reformulado (melhor ROI)
• Integração com Alexa para vendas por voz
• Amazon Live (live commerce)

═══════════════════════════════════════════════════════════════
🟧 SHOPEE BRASIL - O rei das promoções
═══════════════════════════════════════════════════════════════
COMISSÕES (2026):
• Taxa padrão: 14% a 20% (categoria + nível vendedor)
• Shopee Mall: 10% a 14%
• Taxa de transação: 2% adicional

TAXAS DE PAGAMENTO:
• Cartão: 2.5% (incluso na comissão para alguns)
• PIX: 2%
• ShopeePay: 0% (incentivo)

FRETE SHOPEE:
• Frete grátis acima R$ 29 (subsidiado pela Shopee)
• Pontos de coleta: +10% desconto
• Shopee Envios: Integração automática
• Express: Entrega em 24-48h em grandes centros

CASHBACK E MOEDAS:
• Shopee Coins: 1 coin = R$ 0.01
• Cashback vendedor: Até 15% oferecido
• Vouchers de frete: Ilimitados

NÍVEIS VENDEDOR:
• Preferido: Destaque + menores taxas
• Mall: Marca oficial + comissão reduzida

TENDÊNCIAS 2026:
• Shopee Live dominando vendas
• Jogos integrados (Shopee Farm, etc.)
• Super promoções: 1.1, 2.2, etc. (até 80% do GMV)

═══════════════════════════════════════════════════════════════
🔵 MAGAZINE LUIZA (MAGALU) - O ecossistema brasileiro
═══════════════════════════════════════════════════════════════
COMISSÕES (2026):
• Eletrônicos: 12% a 16%
• Moda: 18% a 22%
• Casa/Móveis: 14% a 18%
• Beleza: 16% a 20%
• Esportes: 14% a 18%

VANTAGENS MAGALU:
• Retirada em loja: +1.000 pontos físicos
• Magalu Entregas: Frota própria + Correios
• Luizalabs: Tecnologia proprietária
• Super App: Ecossistema completo

FRETE:
• Retira Loja: Grátis
• Magalu Entregas: -25% vs Correios
• Entrega Expressa: Até 3h em 50+ cidades

PAGAMENTO:
• Cartão Magalu: 0% taxa para vendedor
• PIX: 3%
• Cartão geral: 3.5%

═══════════════════════════════════════════════════════════════
🔴 AMERICANAS/B2W - Tradição no e-commerce
═══════════════════════════════════════════════════════════════
COMISSÕES (2026):
• Geral: 16% a 20%
• Eletrônicos: 14% a 17%
• Moda: 18% a 22%
• Premium (3P Select): -3% desconto

FRETE:
• Direct: Entrega própria em 200+ cidades
• Integração Correios: Desconto parceiro
• Retira em loja: 1.800+ pontos

B2W SERVICES:
• Fulfillment: R$ 6 a R$ 20/unidade
• Armazenamento: R$ 30/m³/mês
• ADS: CPC médio R$ 0.30 a R$ 1.50

═══════════════════════════════════════════════════════════════
🟢 CASAS BAHIA/VIA VAREJO
═══════════════════════════════════════════════════════════════
COMISSÕES (2026):
• Móveis/Eletrônicos: 12% a 16%
• Geral: 15% a 19%

VANTAGENS:
• Carnê digital: Parcelamento facilitado
• 1.100+ lojas físicas
• Entrega própria + Correios

═══════════════════════════════════════════════════════════════
🟣 PLATAFORMAS DE INFOPRODUTOS
═══════════════════════════════════════════════════════════════
HOTMART (2026):
• Produtor: 9.9% + R$ 1/venda
• Afiliado: Comissão definida pelo produtor (20-80%)
• HotPay: +1.49% para parcelamento
• Recuperação de vendas: +1%

EDUZZ:
• Taxa base: 8.9% + R$ 1/venda
• Eduzz Pay: Taxas similares Hotmart

MONETIZZE:
• Taxa: 9.9% sobre vendas
• Recuperação: +2%

═══════════════════════════════════════════════════════════════
🍔 PLATAFORMAS DE DELIVERY
═══════════════════════════════════════════════════════════════
IFOOD (2026):
• Básico: 23% a 27%
• Entrega própria: -5%
• iFood Loop (assinatura): 12%

RAPPI:
• Padrão: 20% a 25%
• Priority: +5% para destaque

═══════════════════════════════════════════════════════════════
📦 CUSTOS DE FRETE - TABELA CORREIOS 2026
═══════════════════════════════════════════════════════════════
PAC (referência 1kg, mesmo estado):
• Até 300g: R$ 18 a R$ 25
• 300g-1kg: R$ 22 a R$ 35
• 1kg-5kg: R$ 35 a R$ 60

SEDEX (referência 1kg, mesmo estado):
• Até 300g: R$ 25 a R$ 40
• 300g-1kg: R$ 35 a R$ 55
• 1kg-5kg: R$ 55 a R$ 90

MINI ENVIOS (até 300g, até 2cm altura):
• R$ 12 a R$ 18 (ótimo para acessórios)

═══════════════════════════════════════════════════════════════
💰 IMPOSTOS E TRIBUTAÇÃO 2026
═══════════════════════════════════════════════════════════════
SIMPLES NACIONAL:
• Faixa 1 (até R$ 180k): 4% a 6%
• Faixa 2 (180k-360k): 7.3% a 9.3%
• Faixa 3 (360k-720k): 9.5% a 11.2%
• Faixa 4 (720k-1.8M): 10.7% a 14.7%
• Faixa 5 (1.8M-3.6M): 14.3% a 22%
• Faixa 6 (3.6M-4.8M): 19% a 33%

MEI (Microempreendedor Individual):
• Limite: R$ 81.000/ano
• Taxa mensal: R$ 71.60 (comércio)
• Impostos: ISS/ICMS fixos inclusos

LUCRO PRESUMIDO:
• PIS/COFINS: 3.65%
• IRPJ/CSLL: ~5% a 8% (margem presumida)
• Total aproximado: 12% a 15%

═══════════════════════════════════════════════════════════════
📈 TENDÊNCIAS E INSIGHTS 2026
═══════════════════════════════════════════════════════════════
• Live Commerce: 35% das vendas em alguns segmentos
• Social Commerce: TikTok Shop, Instagram Shopping
• IA em descrições e atendimento: Obrigatório para escala
• Sustentabilidade: Selo verde aumenta vendas em 15%
• Quick Commerce: Entrega em 1h crescendo 200%
• Recommerce: Produtos usados/recondicionados em alta
• Voice Commerce: Vendas por assistentes de voz
• Realidade Aumentada: Try-on virtual em moda/beleza
`;

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

    console.log('Analisando produto:', productName, 'Categoria:', category);

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const systemPrompt = `Você é o ANALISTA DE MARKETPLACE MAIS COMPLETO DO BRASIL, com conhecimento profundo e atualizado sobre todos os marketplaces brasileiros em ${currentDate}.

${MARKETPLACE_DATA_2026}

🎯 SUA MISSÃO:
Analisar o produto fornecido e entregar uma análise ESTRATÉGICA e PROFISSIONAL com dados reais do mercado brasileiro de 2026.

📋 ESTRUTURA DA ANÁLISE:

1. ANÁLISE DE MERCADO:
   - Demanda atual do produto
   - Sazonalidade (quando vende mais)
   - Concorrência estimada
   - Potencial de vendas mensal

2. COMPARATIVO DE MARKETPLACES:
   Para CADA marketplace relevante, forneça:
   - Preço médio do produto (baseado em dados reais do mercado)
   - Comissão específica para a categoria
   - Taxas de pagamento
   - Custo de frete médio
   - Nível de concorrência (baixa/média/alta)
   - Vantagens específicas
   - Desvantagens/riscos

3. CÁLCULO DE RENTABILIDADE:
   - Preço sugerido de venda
   - Breakdown de custos (comissão, pagamento, frete, impostos)
   - Lucro líquido estimado por unidade
   - ROI esperado

4. ESTRATÉGIA DE PRECIFICAÇÃO:
   - Preço mínimo (para não ter prejuízo)
   - Preço competitivo (mercado)
   - Preço premium (margem alta)

5. DICAS ESTRATÉGICAS:
   - Como se destacar da concorrência
   - Melhores horários para anunciar
   - Keywords recomendadas
   - Fotos e descrição ideais

6. ALERTAS IMPORTANTES:
   - Taxas ocultas
   - Riscos da categoria
   - Mudanças recentes nas políticas

RESPONDA APENAS EM JSON VÁLIDO com esta estrutura:
{
  "analysis": "Análise detalhada do mercado (2-3 parágrafos)",
  "marketDemand": "alta/média/baixa",
  "seasonality": "descrição da sazonalidade",
  "estimatedMonthlySales": número estimado,
  "marketplaces": [
    {
      "name": "Nome do Marketplace",
      "averagePrice": valor numérico,
      "commission": "X%",
      "commissionValue": valor em R$,
      "paymentFee": "X%",
      "paymentFeeValue": valor em R$,
      "shippingCost": "R$ X a R$ Y",
      "avgShippingCost": valor médio,
      "competition": "baixa/média/alta",
      "competitorCount": número estimado,
      "advantages": ["vantagem 1", "vantagem 2"],
      "disadvantages": ["desvantagem 1"],
      "recommendation": "Por que usar ou não",
      "profitPerUnit": valor estimado,
      "score": 1 a 10
    }
  ],
  "bestMarketplace": "nome do melhor",
  "bestMarketplaceReason": "motivo detalhado",
  "pricing": {
    "suggestedPrice": valor,
    "minPrice": valor (break-even),
    "maxPrice": valor (premium),
    "competitiveRange": "R$ X a R$ Y"
  },
  "profitability": {
    "grossMargin": "X%",
    "netMargin": "X%",
    "breakEvenUnits": número,
    "roi": "X%"
  },
  "tips": [
    "dica estratégica 1",
    "dica estratégica 2",
    "dica estratégica 3",
    "dica estratégica 4",
    "dica estratégica 5"
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "bestTimeToSell": "descrição dos melhores horários/dias",
  "alerts": [
    "alerta importante 1",
    "alerta importante 2"
  ],
  "trends2026": ["tendência 1", "tendência 2"]
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
            content: `Analise este produto com MÁXIMA PROFUNDIDADE:

📦 PRODUTO: "${productName}"
📂 CATEGORIA: "${category}"

Faça uma análise completa considerando:
1. Preços praticados no mercado brasileiro em Janeiro de 2026
2. Todas as taxas e comissões de cada marketplace
3. Custos de frete por região
4. Impostos (Simples Nacional, MEI)
5. Estratégias de precificação competitiva
6. Tendências atuais do mercado

Retorne APENAS o JSON estruturado, sem texto adicional.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
