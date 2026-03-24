import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, CheckCircle2, Award, ChevronRight, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockTrail } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export default function TrailOverview() {
  const trail = mockTrail;
  const navigate = useNavigate();
  const totalLessons = trail.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = trail.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const currentLesson = trail.modules.flatMap(m => m.lessons).find(l => l.status === 'in-progress');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — Welcome */}
      <section className="relative overflow-hidden dark-gradient">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent">
                Programa de Integração
              </span>
            </div>
            <h1 className="font-heading text-3xl lg:text-[2.5rem] font-semibold text-white leading-tight mb-4 text-balance">
              Bem-vindo ao seu Onboarding, Ricardo.
            </h1>
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-lg">
              {trail.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-white/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">{totalLessons} aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{trail.totalDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">{completedLessons} concluídas</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => navigate(`/aula/${currentLesson?.id || 'l3'}`)}
                className="bg-accent text-white font-medium px-6 py-2.5 rounded-md hover:bg-accent/90 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Continuar integração
              </Button>
              <span className="text-sm text-white/35">{trail.progress}% concluído</span>
            </div>

            <Progress value={trail.progress} className="h-1 bg-white/10 max-w-sm [&>[role=progressbar]]:bg-accent" />
          </motion.div>
        </div>
      </section>

      {/* Quick info cards */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 -mt-6 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: 'Próxima aula', desc: currentLesson?.title || 'Todas concluídas', sub: currentLesson?.duration || '' },
            { icon: BookOpen, title: 'Materiais disponíveis', desc: `${trail.modules.flatMap(m => m.lessons).reduce((a, l) => a + l.materials.length, 0)} arquivos`, sub: 'PDFs, checklists, manuais' },
            { icon: Users, title: 'Público-alvo', desc: 'Todos os setores', sub: 'Onboarding obrigatório' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="card-elevated p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <card.icon className="w-4.5 h-4.5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{card.title}</p>
                <p className="text-sm font-medium text-foreground">{card.desc}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">Módulos da Trilha</h2>
            <p className="text-sm text-muted-foreground mt-1">Complete todos os módulos para finalizar sua integração</p>
          </div>
        </div>

        <div className="grid gap-4">
          {trail.modules.map((module, moduleIdx) => {
            const moduleCompleted = module.lessons.filter(l => l.status === 'completed').length;
            const moduleProgress = Math.round((moduleCompleted / module.lessons.length) * 100);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: moduleIdx * 0.06 }}
                className="card-premium p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {String(moduleIdx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className="text-xs text-muted-foreground">{moduleCompleted}/{module.lessons.length}</span>
                    <Progress value={moduleProgress} className="w-16 h-1 bg-muted [&>[role=progressbar]]:bg-accent" />
                  </div>
                </div>

                <div className="ml-14 space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => lesson.status !== 'locked' && navigate(`/aula/${lesson.id}`)}
                      disabled={lesson.status === 'locked'}
                      className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon status={lesson.status} />
                        <div>
                          <span className="text-sm font-medium text-foreground">{lesson.title}</span>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{lesson.sector}</span>
                          </div>
                        </div>
                      </div>
                      {lesson.status !== 'locked' && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />;
    case 'in-progress':
      return (
        <div className="w-4.5 h-4.5 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full gold-accent-bg" />
        </div>
      );
    case 'pending':
      return <div className="w-4.5 h-4.5 rounded-full border-2 border-border flex-shrink-0" />;
    case 'locked':
      return <div className="w-4.5 h-4.5 rounded-full border-2 border-border/50 bg-muted/30 flex-shrink-0" />;
    default:
      return null;
  }
}
