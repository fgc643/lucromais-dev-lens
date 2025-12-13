import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { LogOut, User, Crown } from "lucide-react";
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
    <header className="border-b border-[hsl(42,100%,50%,0.2)] bg-[hsl(225,25%,3%,0.95)] backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(225,25%,3%,0.8)] sticky top-0 z-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-[hsl(42,100%,50%)] drop-shadow-[0_0_15px_hsl(42,100%,50%,0.5)]" />
            <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-[hsl(48,100%,70%)] via-[hsl(42,100%,55%)] to-[hsl(35,90%,50%)] bg-clip-text text-transparent drop-shadow-[0_2px_10px_hsl(42,100%,50%,0.3)]">
              Lucro Mais
            </span>
          </div>
          <span className="text-xs bg-gradient-to-r from-[hsl(42,100%,50%)] to-[hsl(38,95%,45%)] text-[hsl(225,25%,3%)] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-[0_4px_20px_hsl(42,100%,50%,0.4)] animate-pulse">
            🤖 IA 24/7
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SettingsDialog />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hover:scale-110 transition-transform duration-300">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[hsl(225,20%,8%)] border-[hsl(42,30%,20%,0.5)] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
              <DropdownMenuLabel className="text-[hsl(42,100%,55%)] font-bold">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[hsl(42,30%,20%,0.3)]" />
              <div className="px-2 py-1.5 text-sm text-muted-foreground font-medium">
                {user.email}
              </div>
              <DropdownMenuSeparator className="bg-[hsl(42,30%,20%,0.3)]" />
              <DropdownMenuItem onClick={signOut} className="text-[hsl(0,90%,60%)] cursor-pointer font-semibold hover:bg-[hsl(0,90%,55%,0.1)]">
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