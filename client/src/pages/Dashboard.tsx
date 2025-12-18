import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { FolderOpen, Users, Loader2, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Gerador 3" className="w-8 h-8" />
            <span className="font-bold">Gerador 3</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Olá, {user?.name?.split(" ")[0] || "Criador"}!</h1>
            <p className="text-muted-foreground mt-1">O que vamos criar hoje?</p>
          </div>

          {/* Two Main Options */}
          <div className="grid grid-cols-1 gap-4">
            {/* Projetos */}
            <Card 
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              onClick={() => setLocation("/projects")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Projetos</h2>
                  <p className="text-sm text-muted-foreground">
                    Crie conteúdo para seu negócio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Influenciadores */}
            <Card 
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              onClick={() => setLocation("/influencers")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Influenciadores</h2>
                  <p className="text-sm text-muted-foreground">
                    Crie influenciadores virtuais
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
