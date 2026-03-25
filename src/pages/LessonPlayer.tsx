import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  MessageSquare,
  Play,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllLessons,
  getCurrentOrNextLesson,
  getLessonById,
  getPublishedTrails,
  getTrailProgress,
  isLessonLocked,
  useAppState,
  type LinkedMaterial,
  type ModuleEntity,
} from '@/lib/app-state';
import { toast } from 'sonner';

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const {
    trails,
    lessonProgress,
    currentCollaboratorId,
    completeLesson,
    acknowledgeLesson,
    isAuthenticated,
    activeCollaboratorTrailId,
    setActiveCollaboratorTrail,
  } = useAppState();

  const publishedTrails = getPublishedTrails(trails);
  const trail = publishedTrails.find((item) => item.id === activeCollaboratorTrailId) ?? publishedTrails[0] ?? null;
  const collaboratorProgress = lessonProgress[currentCollaboratorId];
  const allLessons = trail ? getAllLessons(trail) : [];
  const currentLesson = trail
    ? getLessonById(trail, lessonId || '') ?? getCurrentOrNextLesson(trail, collaboratorProgress)
    : null;
  const [expandedModules, setExpandedModules] = useState<string[]>(trail ? trail.modules.map((module) => module.id) : []);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const currentModuleId = useMemo(() => {
    if (!trail || !currentLesson) return '';
    for (const module of trail.modules) {
      if (module.lessons.some((lesson) => lesson.id === currentLesson.id)) return module.id;
    }
    return trail.modules[0]?.id ?? '';
  }, [trail, currentLesson]);

  if (!trail || !currentLesson) return null;

  const lessonRecord = collaboratorProgress?.[currentLesson.id];
  const isCompleted = !!lessonRecord?.completed;
  const isAcknowledged = !!lessonRecord?.acknowledged;
  const nextLesson =
    allLessons.find(
      (lesson) =>
        lesson.mandatory &&
        !collaboratorProgress?.[lesson.id]?.completed &&
        !isLessonLocked(trail, lesson.id, collaboratorProgress) &&
        lesson.id !== currentLesson.id,
    ) ??
    allLessons.find(
      (lesson) =>
        !collaboratorProgress?.[lesson.id]?.completed &&
        !isLessonLocked(trail, lesson.id, collaboratorProgress) &&
        lesson.id !== currentLesson.id,
    ) ??
    null;
  const trailProgress = getTrailProgress(trail, collaboratorProgress);
  const activeTrailIndex = publishedTrails.findIndex((item) => item.id === trail.id);

  const handleComplete = () => {
    if (currentLesson.requiresAcknowledgment && !isAcknowledged) {
      toast.error('Confirme a ciencia antes de concluir esta aula.');
      return;
    }
    completeLesson(trail.id, currentLesson.id);
    toast.success('Aula marcada como concluida.');
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const changeTrail = (direction: 'prev' | 'next') => {
    if (publishedTrails.length <= 1) return;
    const nextIndex =
      direction === 'prev'
        ? (activeTrailIndex - 1 + publishedTrails.length) % publishedTrails.length
        : (activeTrailIndex + 1) % publishedTrails.length;
    const nextTrail = publishedTrails[nextIndex];
    setActiveCollaboratorTrail(nextTrail.id);
    const nextLessonToOpen = getCurrentOrNextLesson(nextTrail, lessonProgress[currentCollaboratorId]);
    if (nextLessonToOpen) navigate(`/aula/${nextLessonToOpen.id}`);
  };

  const openMaterial = (material: LinkedMaterial) => {
    const href = `/viewer/${trail.id}/${currentLesson.id}/${material.id}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
          {currentLesson.hasVideo ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-elevated relative mb-8 aspect-video overflow-hidden rounded-lg"
              style={{ background: 'hsl(var(--graphite-deep))' }}
            >
              {currentLesson.videoUrl ? (
                <video src={currentLesson.videoUrl} controls className="h-full w-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-accent/90 transition-colors duration-200 hover:scale-105 hover:bg-accent">
                      <Play className="ml-0.5 h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-white/40">Simulacao de player de video</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                    <div className="h-full bg-accent" style={{ width: isCompleted ? '100%' : '45%' }} />
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-elevated mb-8 overflow-hidden rounded-lg border-l-4 border-l-accent p-8 lg:p-12"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <FileCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">Conteudo de leitura</p>
                  <h2 className="font-heading text-xl font-semibold text-foreground">{currentLesson.title}</h2>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{currentLesson.description}</p>
              {currentLesson.summary ? (
                <div className="mt-6 rounded-md border border-border/50 bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-foreground">{currentLesson.summary}</p>
                </div>
              ) : null}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Trilha ativa</p>
                <p className="mt-1 text-sm font-medium text-foreground">{trail.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => changeTrail('prev')} disabled={publishedTrails.length <= 1}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => changeTrail('next')} disabled={publishedTrails.length <= 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <span className={isCompleted ? 'badge-completed' : 'badge-in-progress'}>{isCompleted ? 'Concluida' : 'Em andamento'}</span>
              {currentLesson.requiresAcknowledgment ? <span className="badge-pending">Exige ciencia</span> : null}
            </div>
            <h1 className="mb-3 font-heading text-2xl font-semibold text-foreground lg:text-3xl">{currentLesson.title}</h1>
            <p className="mb-6 leading-relaxed text-muted-foreground">{currentLesson.description}</p>

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetaCard icon={<Clock className="h-4 w-4" />} label="Duracao" value={currentLesson.duration} />
              <MetaCard icon={<Users className="h-4 w-4" />} label="Publico" value={currentLesson.sector} />
              <MetaCard icon={<CalendarDays className="h-4 w-4" />} label="Atualizacao" value={currentLesson.updatedAt} />
              <MetaCard icon={<BookOpen className="h-4 w-4" />} label="Tipo" value={currentLesson.type} />
            </div>

            <div className="mb-8 rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="mb-1 text-sm font-medium text-foreground">Objetivo desta aula</p>
              <p className="text-sm text-muted-foreground">{currentLesson.objective}</p>
            </div>

            {currentLesson.requiresAcknowledgment ? (
              <div className="mb-8 rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Confirmacao de ciencia</p>
                    <p className="mt-1 text-sm text-muted-foreground">Este conteudo exige confirmacao explicita antes da conclusao.</p>
                  </div>
                  <Button
                    variant={isAcknowledged ? 'outline' : 'default'}
                    onClick={() => {
                      acknowledgeLesson(trail.id, currentLesson.id);
                      toast.success('Ciencia confirmada.');
                    }}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {isAcknowledged ? 'Ciencia confirmada' : 'Confirmar ciencia'}
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.div>

          <Tabs defaultValue="materials" className="mb-12">
            <TabsList className="flex h-auto flex-wrap gap-0.5 bg-muted/50 p-1">
              {['materials', 'summary', 'transcript', 'checklist', 'faq', 'notices'].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="px-3 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  {{
                    materials: 'Materiais',
                    summary: 'Resumo',
                    transcript: 'Transcricao',
                    checklist: 'Checklist',
                    faq: 'Duvidas',
                    notices: 'Avisos',
                  }[tab]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="materials" className="mt-6 space-y-3">
              {currentLesson.materials.length === 0 ? (
                <EmptyText text="Nenhum material vinculado a esta aula." />
              ) : (
                <>
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Materiais de apoio</p>
                    <p className="mt-2 text-sm text-muted-foreground">Abra cada material em uma nova aba para leitura completa, mantendo esta aula aberta.</p>
                  </div>

                  {currentLesson.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-accent/30">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{material.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatMaterialType(material.type)} • {material.size}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{getSupportDescription(material.type)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => openMaterial(material)}>
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        {getPrimaryMaterialActionLabel(material.type)}
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{currentLesson.summary || 'Resumo nao disponivel para esta aula.'}</p>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{currentLesson.transcript || 'Transcricao nao disponivel para esta aula.'}</p>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="mt-6 space-y-2">
              {(currentLesson.checklist || []).length === 0 ? (
                <EmptyText text="Nenhum checklist disponivel." />
              ) : (
                (currentLesson.checklist || []).map((item, index) => (
                  <label key={index} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/30">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30" />
                    <span className="text-sm text-foreground">{item}</span>
                  </label>
                ))
              )}
            </TabsContent>

            <TabsContent value="faq" className="mt-6 space-y-3">
              {(currentLesson.faq || []).length === 0 ? (
                <EmptyText text="Nenhuma duvida frequente cadastrada." />
              ) : (
                (currentLesson.faq || []).map((item, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <p className="mb-1.5 flex items-start gap-2 text-sm font-medium text-foreground">
                      <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      {item.question}
                    </p>
                    <p className="ml-6 text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="notices" className="mt-6 space-y-3">
              {(currentLesson.notices || []).length === 0 ? (
                <EmptyText text="Nenhum aviso vinculado." />
              ) : (
                (currentLesson.notices || []).map((notice, index) => (
                  <div key={index} className="rounded-lg border border-border bg-accent/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-accent" />
                      <span className="text-xs font-medium text-accent">{notice.author}</span>
                      <span className="text-xs text-muted-foreground">• {notice.date}</span>
                    </div>
                    <p className="text-sm text-foreground">{notice.content}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between border-t border-border pb-8 pt-6">
            <Button variant="outline" className="text-sm" onClick={handleComplete}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {isCompleted ? 'Aula concluida' : 'Marcar como concluida'}
            </Button>
            <Button onClick={() => nextLesson && navigate(`/aula/${nextLesson.id}`)} className="bg-accent text-sm font-medium text-white hover:bg-accent/90" disabled={!nextLesson}>
              Proxima aula
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <aside className="hidden w-80 overflow-y-auto border-l border-border bg-card scrollbar-thin xl:w-96 lg:block">
        <div className="border-b border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">Conteudo da trilha</h2>
          <p className="mt-1 text-xs text-muted-foreground">{trailProgress}% concluido</p>
        </div>
        <div className="p-3">
          {trail.modules.map((module) => (
            <ModuleGroup
              key={module.id}
              module={module}
              expanded={expandedModules.includes(module.id)}
              onToggle={() => toggleModule(module.id)}
              currentLessonId={currentLesson.id}
              isCurrentModule={module.id === currentModuleId}
              onSelectLesson={(id) => navigate(`/aula/${id}`)}
              trailId={trail.id}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

function formatMaterialType(type: string) {
  return {
    pdf: 'PDF',
    slide: 'Slide',
    thumbnail: 'Imagem',
    video: 'Video',
    'documento auxiliar': 'Documento',
    transcript: 'Degravacao',
    texto: 'Texto',
  }[type] || 'Material';
}

function getPrimaryMaterialActionLabel(type: string) {
  if (type === 'pdf') return 'Abrir PDF';
  if (type === 'documento auxiliar' || type === 'transcript' || type === 'texto') return 'Abrir material';
  if (type === 'slide' || type === 'thumbnail') return 'Visualizar';
  if (type === 'video') return 'Abrir video';
  return 'Abrir material';
}

function getSupportDescription(type: string) {
  if (type === 'pdf') return 'Documento completo aberto em nova aba para leitura ampla.';
  if (type === 'slide') return 'Apresentacao aberta em tela dedicada para consulta.';
  if (type === 'thumbnail') return 'Imagem de apoio aberta em visualizacao dedicada.';
  if (type === 'video') return 'Video complementar aberto em tela propria.';
  return 'Conteudo de apoio aberto em nova aba, sem interromper a aula.';
}

function ModuleGroup({
  module,
  expanded,
  onToggle,
  currentLessonId,
  isCurrentModule,
  onSelectLesson,
  trailId,
}: {
  module: ModuleEntity;
  expanded: boolean;
  onToggle: () => void;
  currentLessonId: string;
  isCurrentModule: boolean;
  onSelectLesson: (id: string) => void;
  trailId: string;
}) {
  const { lessonProgress, currentCollaboratorId, trails } = useAppState();
  const trail = trails.find((item) => item.id === trailId)!;
  const progress = lessonProgress[currentCollaboratorId];
  const completed = module.lessons.filter((lesson) => progress?.[lesson.id]?.completed).length;

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-md p-3 text-left transition-colors ${isCurrentModule ? 'bg-accent/5' : 'hover:bg-muted/50'}`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{module.title}</p>
          <p className="text-xs text-muted-foreground">
            {completed}/{module.lessons.length}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded ? (
        <div className="ml-3 space-y-0.5 border-l border-border/50 py-1 pl-3">
          {module.lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;
            const locked = isLessonLocked(trail, lesson.id, progress);
            const completedLesson = !!progress?.[lesson.id]?.completed;
            return (
              <button
                key={lesson.id}
                onClick={() => !locked && onSelectLesson(lesson.id)}
                disabled={locked}
                className={`flex w-full items-center gap-2.5 rounded-md p-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isCurrent ? 'border border-accent/20 bg-accent/10' : 'hover:bg-muted/40'}`}
              >
                <SidebarStatusIcon completed={completedLesson} locked={locked} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${isCurrent ? 'font-medium text-foreground' : 'text-foreground/80'}`}>{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
                {isCurrent ? <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-accent">Atual</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarStatusIcon({ completed, locked }: { completed: boolean; locked: boolean }) {
  if (completed) return <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />;
  if (locked) return <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />;
  return (
    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent">
      <div className="gold-accent-bg h-1.5 w-1.5 rounded-full" />
    </div>
  );
}
