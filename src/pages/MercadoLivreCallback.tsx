import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MercadoLivreCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (code) {
      exchangeCodeForToken(code);
    } else {
      setStatus("error");
      setErrorMessage("Nenhum código de autorização recebido.");
    }
  }, [code]);

  const exchangeCodeForToken = async (authCode: string) => {
    try {
      const response = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "4649399957609336",
          client_secret: "UCe0tu5xOGE4PSHvoqQo17aCcKbnMLf8",
          code: authCode,
          redirect_uri: "https://lucromais-dev-lens.lovable.app/auth/mercadolivre",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Erro ao obter token");
      }

      // Salvar access_token em localStorage
      localStorage.setItem("meli_token", data.access_token);
      
      if (data.refresh_token) {
        localStorage.setItem("meli_refresh_token", data.refresh_token);
      }
      
      if (data.user_id) {
        localStorage.setItem("meli_user_id", data.user_id.toString());
      }

      setStatus("success");

      toast({
        title: "Conectado ao Mercado Livre!",
        description: "Sua conta foi vinculada com sucesso.",
      });

      // Redirecionar para página principal após 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Erro ao trocar código:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erro ao conectar com o Mercado Livre");
      
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : "Erro ao conectar com o Mercado Livre",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="w-16 h-16 rounded-full bg-[#FFE600]/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#FFE600] animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {status === "loading" && "Conectando com Mercado Livre..."}
            {status === "success" && "Conectado ao Mercado Livre!"}
            {status === "error" && "Erro na conexão"}
          </h1>
          {status === "loading" && (
            <p className="text-muted-foreground">Aguarde enquanto processamos sua autenticação...</p>
          )}
          {status === "success" && (
            <p className="text-muted-foreground">Redirecionando para a página principal...</p>
          )}
          {status === "error" && (
            <p className="text-muted-foreground">{errorMessage}</p>
          )}
        </div>

        {status === "error" && (
          <Button
            onClick={handleRetry}
            className="mt-4 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-semibold"
          >
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
};

export default MercadoLivreCallback;
