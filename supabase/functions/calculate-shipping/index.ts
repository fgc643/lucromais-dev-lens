import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Tabela de referência Setembro/2026 (Correios PAC/SEDEX e logísticas de marketplace)
// Preços por zona de destino x faixa de peso cubado.

type Zone = 1 | 2 | 3 | 4 | 5;

const UF_REGION: Record<string, string> = {
  AC: "N", AP: "N", AM: "N", PA: "N", RO: "N", RR: "N", TO: "N",
  AL: "NE", BA: "NE", CE: "NE", MA: "NE", PB: "NE", PE: "NE", PI: "NE", RN: "NE", SE: "NE",
  DF: "CO", GO: "CO", MT: "CO", MS: "CO",
  ES: "SE", MG: "SE", RJ: "SE", SP: "SE",
  PR: "S", RS: "S", SC: "S",
};

// distância relativa entre regiões -> zona tarifária
const REGION_ZONE: Record<string, Record<string, Zone>> = {
  SE: { SE: 1, S: 2, CO: 3, NE: 4, N: 5 },
  S: { S: 1, SE: 2, CO: 3, NE: 4, N: 5 },
  CO: { CO: 1, SE: 3, S: 3, NE: 4, N: 4 },
  NE: { NE: 1, SE: 4, CO: 4, S: 5, N: 4 },
  N: { N: 1, NE: 4, CO: 4, SE: 5, S: 5 },
};

// PAC: [base zona1..5] por faixa de peso (kg)
const PAC_TABLE: { upTo: number; prices: number[] }[] = [
  { upTo: 0.3, prices: [18.9, 21.5, 24.3, 27.8, 31.4] },
  { upTo: 0.5, prices: [21.4, 24.6, 27.9, 32.1, 36.5] },
  { upTo: 1, prices: [25.9, 30.2, 34.6, 40.3, 46.2] },
  { upTo: 2, prices: [31.8, 37.4, 43.1, 50.9, 58.9] },
  { upTo: 5, prices: [44.6, 53.2, 62.0, 74.5, 87.3] },
  { upTo: 10, prices: [63.8, 77.1, 90.6, 110.2, 130.4] },
  { upTo: 20, prices: [98.4, 120.3, 142.7, 175.6, 209.3] },
  { upTo: 30, prices: [138.7, 170.9, 203.8, 252.4, 302.1] },
];

const SEDEX_MULTIPLIER = 1.62;
const PAC_DAYS: Record<Zone, number> = { 1: 4, 2: 5, 3: 7, 4: 9, 5: 12 };
const SEDEX_DAYS: Record<Zone, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 };

function cubedWeight(l: number, w: number, h: number) {
  // fator de cubagem 6000 (Correios / Mercado Envios)
  return (l * w * h) / 6000;
}

function priceFor(weight: number, zone: Zone) {
  const row = PAC_TABLE.find((r) => weight <= r.upTo) ?? PAC_TABLE[PAC_TABLE.length - 1];
  let price = row.prices[zone - 1];
  if (weight > 30) price += (weight - 30) * 4.9; // excedente por kg
  return price;
}

async function viaCep(cep: string) {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) throw new Error(`CEP inválido: ${cep}`);
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!res.ok) throw new Error("Falha ao consultar o CEP");
  const data = await res.json();
  if (data.erro) throw new Error(`CEP não encontrado: ${cep}`);
  return {
    cep: data.cep as string,
    city: data.localidade as string,
    uf: data.uf as string,
    neighborhood: (data.bairro as string) || "",
    street: (data.logradouro as string) || "",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const originCep = String(body.originCep ?? "");
    const destCep = String(body.destCep ?? "");
    const weight = Number(body.weight ?? 0);
    const length = Number(body.length ?? 20);
    const width = Number(body.width ?? 15);
    const height = Number(body.height ?? 10);
    const declaredValue = Number(body.declaredValue ?? 0);

    if (!originCep || !destCep || !(weight > 0)) {
      return new Response(
        JSON.stringify({ error: "Informe o CEP de origem, o CEP de destino e o peso do produto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [origin, destination] = await Promise.all([viaCep(originCep), viaCep(destCep)]);

    const originRegion = UF_REGION[origin.uf] ?? "SE";
    const destRegion = UF_REGION[destination.uf] ?? "SE";
    const zone: Zone = REGION_ZONE[originRegion]?.[destRegion] ?? 3;

    const billedWeight = Math.max(weight, cubedWeight(length, width, height));
    const pac = priceFor(billedWeight, zone);
    const sedex = pac * SEDEX_MULTIPLIER;
    // seguro / valor declarado acima de R$ 100
    const insurance = declaredValue > 100 ? (declaredValue - 100) * 0.011 : 0;

    const options = [
      {
        id: "pac",
        carrier: "Correios",
        service: "PAC (Encomenda Econômica)",
        price: Math.round((pac + insurance) * 100) / 100,
        days: PAC_DAYS[zone],
        note: "Contrato Correios sem desconto",
      },
      {
        id: "sedex",
        carrier: "Correios",
        service: "SEDEX",
        price: Math.round((sedex + insurance) * 100) / 100,
        days: SEDEX_DAYS[zone],
        note: "Entrega expressa",
      },
      {
        id: "meli",
        carrier: "Mercado Envios",
        service: "Mercado Envios Flex/Coleta",
        price: Math.round((pac * 0.88 + insurance) * 100) / 100,
        days: PAC_DAYS[zone] - 1,
        note: "Tabela com desconto de reputação (estimativa)",
      },
      {
        id: "shopee",
        carrier: "Shopee Xpress",
        service: "Envio Padrão Shopee",
        price: Math.round((pac * 0.8) * 100) / 100,
        days: PAC_DAYS[zone] + 1,
        note: "Programa de frete grátis pode subsidiar parte",
      },
      {
        id: "transportadora",
        carrier: "Transportadora",
        service: "Loggi / Jadlog .Package",
        price: Math.round((pac * 0.93 + insurance * 0.5) * 100) / 100,
        days: PAC_DAYS[zone] - 1,
        note: "Média de mercado para e-commerce",
      },
    ].sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({
        origin,
        destination,
        zone,
        billedWeight: Math.round(billedWeight * 1000) / 1000,
        realWeight: weight,
        cubedWeight: Math.round(cubedWeight(length, width, height) * 1000) / 1000,
        insurance: Math.round(insurance * 100) / 100,
        options,
        reference: "Tabela de referência Setembro/2026",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao calcular o frete";
    console.error("calculate-shipping error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
