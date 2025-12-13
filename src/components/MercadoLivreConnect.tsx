import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, LogOut, Loader2, User } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MeliUser | null>(null);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch("https://api.mercadolibre.com/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleDisconnect(true);
          return null;
        }
        throw new Error("Erro ao buscar dados do usuário");
      }

      const userData = await response.json();
      return {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
      };
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return null;
    }
  }, []);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("meli_token");
    const connected = localStorage.getItem("meli_connected");
    
    if (token && connected === "true") {
      const userData = await fetchUserData(token);
      if (userData) {
        setUser(userData);
        setIsConnected(true);
        toast({
          title: "Conectado ao Mercado Livre",
          description: `Bem-vindo, ${userData.nickname}!`,
        });
      }
    }
    setIsLoading(false);
  }, [fetchUserData]);

  useEffect(() => {
    // Check initial connection
    const token = localStorage.getItem("meli_token");
    const connected = localStorage.getItem("meli_connected");
    
    if (token && connected === "true") {
      fetchUserData(token).then((userData) => {
        if (userData) {
          setUser(userData);
          setIsConnected(true);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Listen for storage changes (when popup saves token)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "meli_connected" && e.newValue === "true") {
        checkConnection();
      }
    };

    // Also poll for changes (for same-tab detection)
    const pollInterval = setInterval(() => {
      const currentConnected = localStorage.getItem("meli_connected");
      const currentToken = localStorage.getItem("meli_token");
      
      if (currentConnected === "true" && currentToken && !isConnected) {
        checkConnection();
      }
    }, 500);

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [checkConnection, fetchUserData, isConnected]);

  const handleConnect = () => {
    // Open popup centered on screen
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      MELI_AUTH_URL,
      "meli_auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
  };

  const handleDisconnect = (silent = false) => {
    localStorage.removeItem("meli_token");
    localStorage.removeItem("meli_refresh_token");
    localStorage.removeItem("meli_user_id");
    localStorage.removeItem("meli_connected");
    setIsConnected(false);
    setUser(null);
    
    if (!silent) {
      toast({
        title: "Desconectado",
        description: "Você foi desconectado do Mercado Livre.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center">
            <img 
              src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg"
              alt="Mercado Livre"
              className="w-5 h-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </div>
            {user && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <User className="w-3 h-3 flex-shrink-0" />
                {user.nickname}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDisconnect()}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
        </Button>
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
    </Button>
  );
};

export default MercadoLivreConnect;
