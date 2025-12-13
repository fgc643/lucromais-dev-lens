import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, LogOut, Loader2, User, ExternalLink } from "lucide-react";

const MELI_CLIENT_ID = "4649399957609336";
const MELI_REDIRECT_URI = "https://lucromais-dev-lens.lovable.app/auth/mercadolivre";
const MELI_AUTH_URL = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${MELI_CLIENT_ID}&redirect_uri=${encodeURIComponent(MELI_REDIRECT_URI)}`;

interface MeliUser {
  id: number;
  nickname: string;
  email: string;
}

const MercadoLivreConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<MeliUser | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const token = localStorage.getItem("meli_token");
    if (token) {
      setIsConnected(true);
      fetchUserData(token);
    }
  };

  const fetchUserData = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.mercadolibre.com/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleDisconnect();
          toast({
            title: "Sessão expirada",
            description: "Por favor, conecte-se novamente ao Mercado Livre.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Erro ao buscar dados do usuário");
      }

      const userData = await response.json();
      setUser({
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar dados do Mercado Livre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.open(MELI_AUTH_URL, "_blank");
  };

  const handleDisconnect = () => {
    localStorage.removeItem("meli_token");
    localStorage.removeItem("meli_refresh_token");
    localStorage.removeItem("meli_user_id");
    setIsConnected(false);
    setUser(null);
    toast({
      title: "Desconectado",
      description: "Você foi desconectado do Mercado Livre.",
    });
  };

  const handleRefreshData = () => {
    const token = localStorage.getItem("meli_token");
    if (token) {
      fetchUserData(token);
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-gradient-to-r from-[#FFE600]/10 to-[#FFE600]/5 border border-[#FFE600]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center">
              <img 
                src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg"
                alt="Mercado Livre"
                className="w-5 h-5"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Mercado Livre</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
              </div>
              {user && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {user.nickname}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <User className="w-4 h-4 mr-2" />
            )}
            Atualizar dados
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Desconectar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <img 
        src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg"
        alt="Mercado Livre"
        className="w-5 h-5 mr-2"
      />
      Conectar Mercado Livre
      <ExternalLink className="w-4 h-4 ml-2" />
    </Button>
  );
};

export default MercadoLivreConnect;
