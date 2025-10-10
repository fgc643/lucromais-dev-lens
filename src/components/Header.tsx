import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { SettingsDialog } from "./SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Lucro Mais
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium animate-pulse">
            🤖 IA 24/7
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SettingsDialog />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hover-scale">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
