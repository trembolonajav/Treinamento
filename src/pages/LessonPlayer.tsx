import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, CheckCircle2, Clock, Users, CalendarDays, ChevronRight,
  FileText, Download, BookOpen, MessageSquare, AlertCircle, ClipboardCheck,
  Lock, ChevronDown, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTrail, getAllLessons, getNextLesson, type Module } from '@/data/mockData';

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const allLessons = getAllLessons(mockTrail);
  const currentLesson = allLessons.find(l => l.id === lessonId) || allLessons.find(l => l.status === 'in-progress')!;
  const nextLesson = getNextLesson(mockTrail);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    mockTrail.modules.map(m => m.id)
  );

  const currentModuleId = useMemo(() => {
    for (const m of mockTrail.modules) {
      if (m.lessons.some(l => l.id === currentLesson?.id)) return m.id;
    }
    return mockTrail.modules[0].id;
  }, [currentLesson]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (!currentLesson) return null;

  const statusLabel = currentLesson.status === 'completed' ? 'Concluída' :
    currentLesson.status === 'in-progress' ? 'Em andamento' : 'Pendente';
  const statusClass = currentLesson.status === 'completed' ? 'badge-completed' :
    currentLesson.status === 'in-progress' ? 'badge-in-progress' : 'badge-pending';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          {/* Video Player or Content Block */}
          {currentLesson.hasVideo ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-video rounded-lg overflow-hidden mb-8 card-elevated"
              style={{ background: 'hsl(var(--graphite-deep))' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center mb-4 cursor-pointer hover:bg-accent transition-colors hover:scale-105 duration-200">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
                <p className="text-sm text-white/40">Clique para reproduzir</p>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                <div className="h-full bg-accent" style={{ width: '35%' }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg overflow-hidden mb-8 card-elevated p-8 lg:p-12 border-l-4 border-l-accent"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-accent mb-1">
                    Conteúdo de Leitura Obrigatória
                  </p>
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    {currentLesson.title}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentLesson.description}
              </p>
              {currentLesson.summary && (
                <div className="mt-6 p-4 rounded-md bg-muted/40 border border-border/50">
                  <p className="text-sm text-foreground leading-relaxed">{currentLesson.summary}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Lesson Meta */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={statusClass}>{statusLabel}</span>
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold text-foreground mb-3">
              {currentLesson.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {currentLesson.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetaCard icon={<Clock className="w-4 h-4" />} label="Duração" value={currentLesson.duration} />
              <MetaCard icon={<Users className="w-4 h-4" />} label="Público" value={currentLesson.sector} />
              <MetaCard icon={<CalendarDays className="w-4 h-4" />} label="Atualização" value={currentLesson.updatedAt} />
              <MetaCard icon={<BookOpen className="w-4 h-4" />} label="Objetivo" value="Ver abaixo" />
            </div>

            <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 mb-8">
              <p className="text-sm font-medium text-foreground mb-1">🎯 Objetivo desta aula</p>
              <p className="text-sm text-muted-foreground">{currentLesson.objective}</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="materials" className="mb-12">
            <TabsList className="bg-muted/50 p-1 h-auto gap-0.5 flex-wrap">
              {['materials', 'summary', 'transcript', 'checklist', 'faq', 'notices'].map(tab => (
                <TabsTrigger key={tab} value={tab} className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  {{ materials: 'Materiais', summary: 'Resumo', transcript: 'Transcrição', checklist: 'Checklist', faq: 'Dúvidas', notices: 'Avisos' }[tab]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="materials" className="mt-6 space-y-2">
              {currentLesson.materials.map(mat => (
                <div key={mat.id} className="flex items-center justify-between p-3.5 rounded-lg border border-border hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{mat.title}</p>
                      <p className="text-xs text-muted-foreground">{mat.type.toUpperCase()} • {mat.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentLesson.summary || 'Resumo não disponível para esta aula.'}
              </p>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentLesson.transcript || 'Transcrição não disponível para esta aula.'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="mt-6 space-y-2">
              {(currentLesson.checklist || []).map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30" />
                  <span className="text-sm text-foreground">{item}</span>
                </label>
              ))}
            </TabsContent>

            <TabsContent value="faq" className="mt-6 space-y-3">
              {(currentLesson.faq || []).map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground mb-1.5 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    {item.question}
                  </p>
                  <p className="text-sm text-muted-foreground ml-6">{item.answer}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="notices" className="mt-6 space-y-3">
              {(currentLesson.notices || []).map((notice, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-accent">{notice.author}</span>
                    <span className="text-xs text-muted-foreground">• {notice.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{notice.content}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-6 pb-8">
            <Button variant="outline" className="text-sm">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Marcar como concluída
            </Button>
            <Button
              onClick={() => nextLesson && navigate(`/aula/${nextLesson.id}`)}
              className="bg-accent text-white font-medium text-sm hover:bg-accent/90"
              disabled={!nextLesson}
            >
              Próxima aula
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-80 xl:w-96 border-l border-border bg-card overflow-y-auto scrollbar-thin">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-foreground">Conteúdo da Trilha</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mockTrail.modules.reduce((a, m) => a + m.lessons.filter(l => l.status === 'completed').length, 0)}/{allLessons.length} aulas concluídas
          </p>
        </div>
        <div className="p-3">
          {mockTrail.modules.map((module) => (
            <ModuleGroup
              key={module.id}
              module={module}
              expanded={expandedModules.includes(module.id)}
              onToggle={() => toggleModule(module.id)}
              currentLessonId={currentLesson.id}
              isCurrentModule={module.id === currentModuleId}
              onSelectLesson={(id) => navigate(`/aula/${id}`)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ModuleGroup({
  module, expanded, onToggle, currentLessonId, isCurrentModule, onSelectLesson
}: {
  module: Module; expanded: boolean; onToggle: () => void;
  currentLessonId: string; isCurrentModule: boolean; onSelectLesson: (id: string) => void;
}) {
  const completed = module.lessons.filter(l => l.status === 'completed').length;

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 rounded-md text-left transition-colors ${
          isCurrentModule ? 'bg-accent/5' : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{module.title}</p>
          <p className="text-xs text-muted-foreground">{completed}/{module.lessons.length}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="ml-3 border-l border-border/50 pl-3 py-1 space-y-0.5">
          {module.lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;
            return (
              <button
                key={lesson.id}
                onClick={() => lesson.status !== 'locked' && onSelectLesson(lesson.id)}
                disabled={lesson.status === 'locked'}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-md text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-accent/10 border border-accent/20'
                    : 'hover:bg-muted/40'
                }`}
              >
                <SidebarStatusIcon status={lesson.status} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isCurrent ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-medium text-accent uppercase tracking-wider flex-shrink-0">Atual</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    case 'in-progress':
      return (
        <div className="w-4 h-4 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full gold-accent-bg" />
        </div>
      );
    case 'pending':
      return <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />;
    case 'locked':
      return <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />;
    default:
      return null;
  }
}
