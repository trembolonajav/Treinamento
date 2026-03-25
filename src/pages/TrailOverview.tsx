import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, CheckCircle2, Award, ChevronRight, FileText, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { getAllLessons, getCurrentOrNextLesson, getPublishedTrails, getTrailProgress, isLessonLocked, useAppState } from '@/lib/app-state';

export default function TrailOverview() {
  const navigate = useNavigate();
  const { trails, lessonProgress, currentCollaboratorId, isAuthenticated, activeCollaboratorTrailId, setActiveCollaboratorTrail } = useAppState();
  const publishedTrails = getPublishedTrails(trails);
  const publishedTrail = publishedTrails.find((trail) => trail.id === activeCollaboratorTrailId) ?? publishedTrails[0] ?? null;
  const collaboratorProgress = lessonProgress[currentCollaboratorId];

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!publishedTrail) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="card-premium p-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Nenhuma trilha publicada</h1>
          <p className="mt-2 text-sm text-muted-foreground">Publique uma trilha no painel administrativo para validar a experiencia do colaborador.</p>
          <Button className="mt-6" onClick={() => navigate('/admin')}>Abrir admin</Button>
        </div>
      </div>
    );
  }

  const lessons = getAllLessons(publishedTrail);
  const completedLessons = lessons.filter((lesson) => collaboratorProgress?.[lesson.id]?.completed).length;
  const trailProgress = getTrailProgress(publishedTrail, collaboratorProgress);
  const currentLesson = getCurrentOrNextLesson(publishedTrail, collaboratorProgress);
  const activeTrailIndex = publishedTrails.findIndex((trail) => trail.id === publishedTrail.id);

  const changeTrail = (direction: 'prev' | 'next') => {
    if (publishedTrails.length <= 1) return;
    const nextIndex = direction === 'prev'
      ? (activeTrailIndex - 1 + publishedTrails.length) % publishedTrails.length
      : (activeTrailIndex + 1) % publishedTrails.length;
    setActiveCollaboratorTrail(publishedTrails[nextIndex].id);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden dark-gradient">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/30 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          {publishedTrail.coverUrl ? (
            <div className="mb-8 overflow-hidden rounded-3xl border border-white/10">
              <img src={publishedTrail.coverUrl} alt={publishedTrail.title} className="h-48 w-full object-cover opacity-80" />
            </div>
          ) : null}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Programa de Integracao</span>
            </div>
            <h1 className="mb-4 font-heading text-3xl font-semibold leading-tight text-white lg:text-[2.5rem]">
              Bem-vindo ao seu onboarding.
            </h1>
            <p className="mb-2 text-sm font-medium text-white/80">{publishedTrail.title}</p>
            <p className="mb-8 max-w-lg text-sm leading-relaxed text-white/50">{publishedTrail.description}</p>

            <div className="mb-8 flex flex-wrap items-center gap-6 text-white/40">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">{lessons.length} aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{publishedTrail.estimatedDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">{completedLessons} concluidas</span>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <Button
                onClick={() => currentLesson && navigate(`/aula/${currentLesson.id}`)}
                className="bg-accent px-6 py-2.5 font-medium text-white hover:bg-accent/90"
              >
                <Play className="mr-2 h-4 w-4" />
                Continuar integracao
              </Button>
              <span className="text-sm text-white/35">{trailProgress}% concluido</span>
            </div>

            <Progress value={trailProgress} className="h-1 max-w-sm bg-white/10 [&>[role=progressbar]]:bg-accent" />
          </motion.div>
          <div className="mt-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">Trilha atual</p>
              <p className="mt-1 text-sm font-medium text-white">{publishedTrail.title}</p>
              <p className="mt-1 text-xs text-white/40">{activeTrailIndex + 1} de {publishedTrails.length} trilhas publicadas</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => changeTrail('prev')} disabled={publishedTrails.length <= 1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => changeTrail('next')} disabled={publishedTrails.length <= 1}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-6 mb-12 max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: FileText, title: 'Proxima aula', desc: currentLesson?.title || 'Trilha concluida', sub: currentLesson?.duration || '' },
            { icon: BookOpen, title: 'Materiais disponiveis', desc: `${lessons.reduce((total, lesson) => total + lesson.materials.length, 0)} arquivos`, sub: 'PDFs, guias e documentos internos' },
            { icon: Users, title: 'Publico-alvo', desc: publishedTrail.audience, sub: publishedTrail.mandatory ? 'Trilha obrigatoria' : 'Trilha complementar' },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.06 }}
              className="card-elevated flex items-start gap-4 p-5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <card.icon className="h-4.5 w-4.5 text-accent" />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">{card.title}</p>
                <p className="text-sm font-medium text-foreground">{card.desc}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">Modulos da trilha</h2>
            <p className="mt-1 text-sm text-muted-foreground">Siga a ordem sugerida para concluir sua integracao sem bloqueios.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {publishedTrail.modules.sort((a, b) => a.order - b.order).map((module, moduleIndex) => {
            const moduleCompleted = module.lessons.filter((lesson) => collaboratorProgress?.[lesson.id]?.completed).length;
            const moduleProgress = module.lessons.length ? Math.round((moduleCompleted / module.lessons.length) * 100) : 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: moduleIndex * 0.06 }}
                className="card-premium p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <span className="text-sm font-semibold text-muted-foreground">{String(moduleIndex + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{module.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{moduleCompleted}/{module.lessons.length}</span>
                    <Progress value={moduleProgress} className="h-1 w-16 bg-muted [&>[role=progressbar]]:bg-accent" />
                  </div>
                </div>

                <div className="ml-14 space-y-1">
                  {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => {
                    const locked = isLessonLocked(publishedTrail, lesson.id, collaboratorProgress);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !locked && navigate(`/aula/${lesson.id}`)}
                        disabled={locked}
                        className="group flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon completed={!!collaboratorProgress?.[lesson.id]?.completed} locked={locked} />
                          <div>
                            <span className="text-sm font-medium text-foreground">{lesson.title}</span>
                            <div className="mt-0.5 flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{lesson.type}</span>
                            </div>
                          </div>
                        </div>
                        {!locked ? <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /> : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusIcon({ completed, locked }: { completed: boolean; locked: boolean }) {
  if (completed) return <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 text-emerald-600" />;
  if (locked) return <div className="h-4.5 w-4.5 flex-shrink-0 rounded-full border-2 border-border/50 bg-muted/30" />;
  return (
    <div className="flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent">
      <div className="gold-accent-bg h-1.5 w-1.5 rounded-full" />
    </div>
  );
}
