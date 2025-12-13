import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const MercadoLivreCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando autenticação...");

  useEffect(() => {
    if (error) {
      setStatus("error");
      setMessage("Autenticação cancelada ou negada pelo usuário.");
      return;
    }

    if (code) {
      exchangeCodeForToken(code);
    } else {
      setStatus("error");
      setMessage("Nenhum código de autorização recebido.");
    }
  }, [code, error]);

  const exchangeCodeForToken = async (authCode: string) => {
    try {
      setMessage("Trocando código por token de acesso...");
      
      const { data, error } = await supabase.functions.invoke("meli-auth", {
        body: {
          code: authCode,
          redirect_uri: "https://lucromais-dev-lens.lovable.app/auth/mercadolivre",
        },
      });

      if (error) {
        console.error("Erro na edge function:", error);
        throw new Error(error.message || "Erro ao processar autenticação");
      }

      if (!data.success) {
        throw new Error(data.error || "Erro desconhecido");
      }

      // Salvar tokens no localStorage
      localStorage.setItem("meli_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("meli_refresh_token", data.refresh_token);
      }
      if (data.user_id) {
        localStorage.setItem("meli_user_id", data.user_id.toString());
      }

      setStatus("success");
      setMessage("Conectado com sucesso ao Mercado Livre!");

      toast({
        title: "Mercado Livre conectado!",
        description: "Sua conta foi vinculada com sucesso.",
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Erro ao trocar código:", err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erro ao conectar com o Mercado Livre");
      
      toast({
        title: "Erro na conexão",
        description: err instanceof Error ? err.message : "Erro ao conectar com o Mercado Livre",
        variant: "destructive",
      });
    }
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
            {status === "loading" && "Conectando ao Mercado Livre"}
            {status === "success" && "Conexão estabelecida!"}
            {status === "error" && "Erro na conexão"}
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        {status === "success" && (
          <p className="text-sm text-muted-foreground">
            Redirecionando para a página principal...
          </p>
        )}

        {status === "error" && (
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para a página inicial
          </button>
        )}
      </div>
    </div>
  );
};

export default MercadoLivreCallback;
