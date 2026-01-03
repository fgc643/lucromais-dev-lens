import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  Crown, 
  Search, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Loader2,
  Calendar,
  Mail,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  subscription_active: boolean | null;
  subscription_expires_at: string | null;
  subscription_plan: string | null;
  created_at: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin role:", error);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (!data) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    
    try {
      const newExpirationDate = new Date();
      newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_active: !currentStatus,
          subscription_expires_at: !currentStatus 
            ? newExpirationDate.toISOString() 
            : null,
          subscription_plan: !currentStatus ? "premium" : "free",
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: !currentStatus 
          ? "Assinatura ativada com sucesso! Válida por 30 dias." 
          : "Assinatura desativada",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar assinatura",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const extendSubscription = async (userId: string) => {
    setUpdatingUserId(userId);
    
    try {
      const currentUser = users.find(u => u.id === userId);
      let newExpirationDate: Date;
      
      if (currentUser?.subscription_expires_at) {
        newExpirationDate = new Date(currentUser.subscription_expires_at);
        newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);
      } else {
        newExpirationDate = new Date();
        newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_active: true,
          subscription_expires_at: newExpirationDate.toISOString(),
          subscription_plan: "premium",
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Assinatura estendida até ${format(newExpirationDate, "dd/MM/yyyy", { locale: ptBR })}`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast({
        title: "Erro",
        description: "Erro ao estender assinatura",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(225,25%,3%)]">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Painel Admin
            </h1>
          </div>
          <Badge variant="default" className="gap-2 px-4 py-2 bg-primary text-primary-foreground">
            <Crown className="w-4 h-4" />
            Administrador
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.subscription_active).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Em Trial</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => !u.subscription_active && u.created_at && 
                    new Date(u.created_at).getTime() + 7 * 24 * 60 * 60 * 1000 > Date.now()
                  ).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Trial Expirado</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => !u.subscription_active && u.created_at && 
                    new Date(u.created_at).getTime() + 7 * 24 * 60 * 60 * 1000 <= Date.now()
                  ).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6 bg-card/50 border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nome ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((profile) => {
                  const isInTrial = !profile.subscription_active && profile.created_at && 
                    new Date(profile.created_at).getTime() + 7 * 24 * 60 * 60 * 1000 > Date.now();
                  const trialExpired = !profile.subscription_active && profile.created_at && 
                    new Date(profile.created_at).getTime() + 7 * 24 * 60 * 60 * 1000 <= Date.now();
                  
                  return (
                    <TableRow key={profile.id} className="border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{profile.full_name || "Sem nome"}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            {profile.company_name && (
                              <p className="text-xs text-muted-foreground">{profile.company_name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.subscription_active ? (
                          <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </Badge>
                        ) : isInTrial ? (
                          <Badge variant="secondary" className="gap-1">
                            <Calendar className="w-3 h-3" />
                            Trial
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Expirado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{profile.subscription_plan || "free"}</span>
                      </TableCell>
                      <TableCell>
                        {profile.subscription_expires_at ? (
                          format(new Date(profile.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.created_at
                          ? format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {profile.subscription_active ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => extendSubscription(profile.id)}
                                disabled={updatingUserId === profile.id}
                              >
                                {updatingUserId === profile.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "+30 dias"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => toggleSubscription(profile.id, true)}
                                disabled={updatingUserId === profile.id}
                              >
                                {updatingUserId === profile.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Desativar"
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleSubscription(profile.id, false)}
                              disabled={updatingUserId === profile.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingUserId === profile.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Ativar Premium
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Admin;
