import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { 
  ArrowLeft, Plus, FolderOpen, Link2, FileText, 
  ChevronRight, Loader2 
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function Projects() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery(undefined, {
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Meus Projetos</span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-4">
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects && projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.niche} • {project.sourceType === "site" && "Site"}
                      {project.sourceType === "instagram" && "Instagram"}
                      {project.sourceType === "tiktok" && "TikTok"}
                      {project.sourceType === "description" && "Descrição"}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum projeto ainda</p>
            <p className="text-sm mt-1">Crie seu primeiro projeto para começar</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowCreateOptions(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Create Options Modal */}
      {showCreateOptions && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowCreateOptions(false)}
        >
          <div 
            className="fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
            
            <h2 className="text-lg font-bold text-center">Criar Novo Projeto</h2>
            <p className="text-sm text-muted-foreground text-center">
              Como você quer começar?
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start gap-4"
                onClick={() => {
                  setShowCreateOptions(false);
                  setLocation("/project/new/link");
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Por Link</div>
                  <div className="text-xs text-muted-foreground">
                    Cole o link do seu Instagram, TikTok, YouTube ou site
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start gap-4"
                onClick={() => {
                  setShowCreateOptions(false);
                  setLocation("/project/new");
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Por Descrição</div>
                  <div className="text-xs text-muted-foreground">
                    Descreva seu negócio manualmente
                  </div>
                </div>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setShowCreateOptions(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
