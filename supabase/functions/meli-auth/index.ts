import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    console.log("Iniciando troca de código por token do Mercado Livre...");

    const clientId = "4649399957609336";
    const clientSecret = Deno.env.get("MELI_CLIENT_SECRET");

    if (!clientSecret) {
      console.error("MELI_CLIENT_SECRET não configurado");
      throw new Error("Client secret não configurado");
    }

    const tokenResponse = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirect_uri,
      }),
    });

    const tokenData = await tokenResponse.json();

    console.log("Resposta do Mercado Livre:", tokenResponse.status);

    if (!tokenResponse.ok) {
      console.error("Erro na resposta do ML:", tokenData);
      throw new Error(tokenData.message || "Erro ao obter token do Mercado Livre");
    }

    console.log("Token obtido com sucesso!");

    return new Response(JSON.stringify({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: tokenData.user_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na autenticação ML:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar autenticação";
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
