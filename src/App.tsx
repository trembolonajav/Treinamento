import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppStateProvider } from "@/lib/app-state";
import TrailOverview from "./pages/TrailOverview";
import LessonPlayer from "./pages/LessonPlayer";
import MaterialViewer from "./pages/MaterialViewer";
import AdminWorkspace from "./pages/AdminWorkspace";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isMaterialViewer = location.pathname.startsWith('/viewer/');

  return (
    <div className="min-h-screen bg-background">
      {!isLogin && !isMaterialViewer && <AppHeader />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<TrailOverview />} />
        <Route path="/aula/:lessonId" element={<LessonPlayer />} />
        <Route path="/viewer/:trailId/:lessonId/:materialId" element={<MaterialViewer />} />
        <Route path="/admin" element={<AdminWorkspace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </AppStateProvider>
  </QueryClientProvider>
);

export default App;
