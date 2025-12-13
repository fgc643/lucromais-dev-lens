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

    console.log("=== MELI AUTH START ===");
    console.log("Code recebido:", code ? "Sim" : "Não");
    console.log("Redirect URI:", redirect_uri);

    if (!code) {
      console.error("Código de autorização não fornecido");
      return new Response(JSON.stringify({
        success: false,
        error: "Código de autorização não fornecido",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = "4649399957609336";
    const clientSecret = Deno.env.get("MELI_CLIENT_SECRET");

    console.log("Client ID:", clientId);
    console.log("Client Secret configurado:", clientSecret ? "Sim (" + clientSecret.length + " chars)" : "NÃO!");

    if (!clientSecret) {
      console.error("MELI_CLIENT_SECRET não configurado nas variáveis de ambiente");
      return new Response(JSON.stringify({
        success: false,
        error: "Client secret não configurado no servidor",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirect_uri,
    });

    console.log("Enviando request para ML API...");
    console.log("Body params:", bodyParams.toString().replace(clientSecret, "***HIDDEN***"));

    const tokenResponse = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: bodyParams,
    });

    const tokenData = await tokenResponse.json();

    console.log("Status da resposta ML:", tokenResponse.status);
    console.log("Resposta ML:", JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok) {
      console.error("Erro na API do Mercado Livre:", tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: tokenData.message || tokenData.error || "Erro ao obter token do Mercado Livre",
        details: tokenData,
      }), {
        status: tokenResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!tokenData.access_token) {
      console.error("Token não retornado pela API:", tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: "Token não retornado pela API do Mercado Livre",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("=== TOKEN OBTIDO COM SUCESSO ===");
    console.log("User ID:", tokenData.user_id);
    console.log("Expires in:", tokenData.expires_in);

    return new Response(JSON.stringify({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: tokenData.user_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("=== ERRO CRÍTICO ===");
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Mensagem:", errorMessage);
    if (errorStack) console.error("Stack:", errorStack);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage || "Erro interno ao processar autenticação",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
