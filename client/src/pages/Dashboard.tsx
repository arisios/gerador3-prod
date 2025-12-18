import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { 
  Plus, FolderOpen, Image, Video, Users, TrendingUp, 
  Flame, Clock, ChevronRight, Loader2, LogOut 
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats } = trpc.stats.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: recentContents } = trpc.stats.recentContents.useQuery({ limit: 5 }, {
    enabled: isAuthenticated,
  });

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
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

      <main className="container px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(" ")[0] || "Criador"}!</h1>
          <p className="text-muted-foreground">O que vamos criar hoje?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="h-auto py-4 flex-col gap-2" 
            onClick={() => setLocation("/project/new")}
          >
            <Plus className="w-6 h-6" />
            <span>Novo Projeto</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setLocation("/influencers")}
          >
            <Users className="w-6 h-6" />
            <span>Influenciadores</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{projects?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Projetos</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Conteúdos</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats?.byStatus?.['downloaded'] || 0}</div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Meus Projetos
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/project/new">
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : projects && projects.length > 0 ? (
              projects.slice(0, 5).map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.sourceType === "site" && "Site"}
                        {project.sourceType === "instagram" && "Instagram"}
                        {project.sourceType === "tiktok" && "TikTok"}
                        {project.sourceType === "description" && "Descrição"}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum projeto ainda</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/project/new">Criar primeiro projeto</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contents */}
        {recentContents && recentContents.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentContents.map((content) => (
                <Link key={content.id} href={`/content/${content.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      {content.type === "carousel" && <Image className="w-4 h-4" />}
                      {content.type === "image" && <Image className="w-4 h-4" />}
                      {content.type === "video" && <Video className="w-4 h-4" />}
                      <div>
                        <div className="font-medium text-sm">{content.title || "Sem título"}</div>
                        <div className="text-xs text-muted-foreground">{content.template}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/trends">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Trends</div>
                  <div className="text-xs text-muted-foreground">Google & TikTok</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/virals">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-medium">Virais</div>
                  <div className="text-xs text-muted-foreground">ViralHog & Reddit</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="container flex justify-around py-2">
          <NavItem href="/dashboard" icon={<FolderOpen />} label="Projetos" active />
          <NavItem href="/influencers" icon={<Users />} label="Influencers" />
          <NavItem href="/trends" icon={<TrendingUp />} label="Trends" />
          <NavItem href="/history" icon={<Clock />} label="Histórico" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
        <div className="w-5 h-5">{icon}</div>
        <span className="text-xs">{label}</span>
      </div>
    </Link>
  );
}
