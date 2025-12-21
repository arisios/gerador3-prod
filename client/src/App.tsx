import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProjectCreate from "./pages/ProjectCreate";
import Projects from "./pages/Projects";
import ProjectCreateByLink from "./pages/ProjectCreateByLink";
import ProjectDetail from "./pages/ProjectDetail";
import ContentEdit from "./pages/ContentEdit";
import ImageEdit from "./pages/ImageEdit";
import VideoEdit from "./pages/VideoEdit";
import History from "./pages/History";
import Influencers from "./pages/Influencers";
import InfluencerCreate from "./pages/InfluencerCreate";
import InfluencerCreateByPhoto from "./pages/InfluencerCreateByPhoto";
import InfluencerDetail from "./pages/InfluencerDetail";
import InfluencerContentCreate from "./pages/InfluencerContentCreate";
import InfluencerContentEdit from "./pages/InfluencerContentEdit";
import Trends from "./pages/Trends";
import Virals from "./pages/Virals";
import Credits from "./pages/Credits";
import MediaGallery from "./pages/MediaGallery";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/project/new" component={ProjectCreate} />
      <Route path="/project/new/link" component={ProjectCreateByLink} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/content/:id" component={ContentEdit} />
      <Route path="/content/:id/image" component={ImageEdit} />
      <Route path="/content/:id/video" component={VideoEdit} />
      <Route path="/history" component={History} />
      <Route path="/influencers" component={Influencers} />
      <Route path="/influencer/new" component={InfluencerCreate} />
      <Route path="/influencer/new/photo" component={InfluencerCreateByPhoto} />
      <Route path="/influencer/:id" component={InfluencerDetail} />
      <Route path="/influencer/:id/content/new" component={InfluencerContentCreate} />
      <Route path="/influencer/:id/content/:contentId" component={InfluencerContentEdit} />
      <Route path="/trends" component={Trends} />
      <Route path="/virals" component={Virals} />
      <Route path="/credits" component={Credits} />
      <Route path="/media" component={MediaGallery} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
