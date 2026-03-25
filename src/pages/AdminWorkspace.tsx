import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  BookOpen,
  ChevronRight,
  Copy,
  Eye,
  File,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Image,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getAllLessons,
  getCurrentOrNextLesson,
  getPublicationIssues,
  getPublishedTrails,
  getTrailProgress,
  useAppState,
  type LibraryItem,
  type LibraryItemStatus,
  type LibraryItemType,
  type LessonContentStatus,
  type LessonEntity,
  type LessonFormInput,
  type LessonType,
  type LinkedMaterial,
  type MaterialFormInput,
  type ModuleEntity,
  type ModuleFormInput,
  type TrailEntity,
  type TrailFormInput,
  type TrailStatus,
} from '@/lib/app-state';

type AdminSection = 'dashboard' | 'trails' | 'library' | 'users' | 'progress' | 'reports' | 'settings';
type TrailContextSection = 'overview' | 'modules' | 'lessons' | 'materials' | 'publication' | 'settings';
type PendingDelete =
  | { type: 'trail'; trailId: string; label: string }
  | { type: 'module'; trailId: string; moduleId: string; label: string }
  | { type: 'lesson'; trailId: string; moduleId: string; lessonId: string; label: string }
  | { type: 'material'; trailId: string; moduleId: string; lessonId: string; materialId: string; label: string }
  | { type: 'library'; itemId: string; label: string };

const adminNav: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'trails', label: 'Trilhas', icon: GraduationCap },
  { key: 'library', label: 'Biblioteca', icon: FolderOpen },
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'progress', label: 'Progresso', icon: TrendingUp },
  { key: 'reports', label: 'Relatorios', icon: BarChart3 },
  { key: 'settings', label: 'Configuracoes', icon: Settings },
];

const trailContextNav: { key: TrailContextSection; label: string }[] = [
  { key: 'overview', label: 'Visao geral' },
  { key: 'modules', label: 'Modulos' },
  { key: 'lessons', label: 'Aulas' },
  { key: 'materials', label: 'Materiais vinculados' },
  { key: 'publication', label: 'Publicacao' },
  { key: 'settings', label: 'Configuracoes' },
];

const trailDefaults: TrailFormInput = {
  title: '',
  description: '',
  audience: '',
  sector: '',
  status: 'draft',
  estimatedDuration: '',
  coverName: '',
  coverUrl: '',
  mandatory: true,
};

const moduleDefaults: ModuleFormInput = {
  title: '',
  description: '',
  required: true,
};

const lessonDefaults: LessonFormInput = {
  title: '',
  description: '',
  objective: '',
  duration: '',
  sector: 'Todos os setores',
  type: 'video',
  mandatory: true,
  requiresAcknowledgment: false,
  hasVideo: true,
  videoUrl: '',
  videoName: '',
  contentStatus: 'ready',
};

const materialDefaults: MaterialFormInput = {
  name: '',
  type: 'pdf',
  size: '',
  status: 'ativo',
  note: '',
  fileUrl: '',
  mimeType: '',
};

export default function AdminWorkspace() {
  const {
    trails,
    library,
    collaborators,
    lessonProgress,
    currentCollaboratorId,
    createTrail,
    updateTrail,
    deleteTrail,
    duplicateTrail,
    archiveTrail,
    saveTrailDraft,
    publishTrail,
    addModule,
    updateModule,
    deleteModule,
    moveModule,
    addLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
    addLessonMaterial,
    updateLessonMaterial,
    removeLessonMaterial,
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    attachLibraryItemToLesson,
    resetMockData,
  } = useAppState();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [trailTab, setTrailTab] = useState<TrailContextSection>('overview');
  const [trailDialog, setTrailDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; trailId?: string }>({ open: false, mode: 'create' });
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; trailId?: string; moduleId?: string }>({ open: false });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; trailId?: string; moduleId?: string; lessonId?: string }>({ open: false });
  const [materialDialog, setMaterialDialog] = useState<{ open: boolean; trailId?: string; moduleId?: string; lessonId?: string; materialId?: string }>({ open: false });
  const [libraryDialog, setLibraryDialog] = useState<{ open: boolean; itemId?: string }>({ open: false });
  const [linkLibraryDialog, setLinkLibraryDialog] = useState<{ open: boolean; itemId?: string }>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<'all' | LibraryItemType>('all');

  const selectedTrail = trails.find((trail) => trail.id === selectedTrailId) ?? null;
  const collaboratorLessonProgress = lessonProgress[currentCollaboratorId];
  const publishedTrail = getPublishedTrails(trails)[0] ?? null;
  const publishedTrailProgress = publishedTrail ? getTrailProgress(publishedTrail, collaboratorLessonProgress) : 0;

  const metrics = useMemo(() => {
    const moduleCount = trails.reduce((total, trail) => total + trail.modules.length, 0);
    const lessonCount = trails.reduce((total, trail) => total + getAllLessons(trail).length, 0);
    const draftCount = trails.filter((trail) => trail.status === 'draft').length;
    const publishedCount = trails.filter((trail) => trail.status === 'published').length;
    const pendingPublication = trails.reduce((total, trail) => total + getPublicationIssues(trail).length, 0);
    return { moduleCount, lessonCount, draftCount, publishedCount, pendingPublication };
  }, [trails]);

  const openTrail = (trailId: string, tab: TrailContextSection = 'overview') => {
    setSelectedTrailId(trailId);
    setTrailTab(tab);
    setActiveSection('trails');
  };

  const handlePublish = (trailId: string) => {
    const result = publishTrail(trailId);
    if (result.ok) {
      toast.success('Trilha publicada com sucesso.');
    } else {
      toast.error(result.issues[0] || 'Nao foi possivel publicar a trilha.');
      setTrailTab('publication');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Administracao</p>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">Operacao do portal</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Fluxos mockados para validacao completa sem backend.</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {adminNav.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                if (item.key !== 'trails') setSelectedTrailId(null);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                activeSection === item.key ? 'bg-accent/10 font-medium text-accent' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-4">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Eye className="h-3.5 w-3.5" />
            Ver como colaborador
          </Link>
          <button onClick={() => { resetMockData(); toast.success('Estado mockado reiniciado.'); }} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            Reiniciar estado mockado
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {activeSection === 'dashboard' && <DashboardSection metrics={metrics} progress={publishedTrailProgress} onOpenTrail={openTrail} trails={trails} />}
          {activeSection === 'trails' && (
            <TrailsSection
              trails={trails}
              selectedTrail={selectedTrail}
              trailTab={trailTab}
              onOpenTrail={openTrail}
              onBack={() => setSelectedTrailId(null)}
              onChangeTab={setTrailTab}
              onCreateTrail={() => setTrailDialog({ open: true, mode: 'create' })}
              onEditTrail={(trailId) => setTrailDialog({ open: true, mode: 'edit', trailId })}
              onDeleteTrail={(trailId, label) => setPendingDelete({ type: 'trail', trailId, label })}
              onDuplicateTrail={(trailId) => { duplicateTrail(trailId); toast.success('Trilha duplicada.'); }}
              onArchiveTrail={(trailId) => { archiveTrail(trailId); toast.success('Trilha arquivada.'); }}
              onPublishTrail={handlePublish}
              onSaveDraft={(trailId) => { saveTrailDraft(trailId); toast.success('Trilha salva como rascunho.'); }}
              onCreateModule={(trailId) => setModuleDialog({ open: true, trailId })}
              onEditModule={(trailId, moduleId) => setModuleDialog({ open: true, trailId, moduleId })}
              onDeleteModule={(trailId, moduleId, label) => setPendingDelete({ type: 'module', trailId, moduleId, label })}
              onMoveModule={moveModule}
              onCreateLesson={(trailId, moduleId) => setLessonDialog({ open: true, trailId, moduleId })}
              onEditLesson={(trailId, moduleId, lessonId) => setLessonDialog({ open: true, trailId, moduleId, lessonId })}
              onDeleteLesson={(trailId, moduleId, lessonId, label) => setPendingDelete({ type: 'lesson', trailId, moduleId, lessonId, label })}
              onMoveLesson={moveLesson}
              onAddMaterial={(trailId, moduleId, lessonId) => setMaterialDialog({ open: true, trailId, moduleId, lessonId })}
              onEditMaterial={(trailId, moduleId, lessonId, materialId) => setMaterialDialog({ open: true, trailId, moduleId, lessonId, materialId })}
              onDeleteMaterial={(trailId, moduleId, lessonId, materialId, label) => setPendingDelete({ type: 'material', trailId, moduleId, lessonId, materialId, label })}
              onAttachLibrary={(trailId, moduleId, lessonId) => setLinkLibraryDialog({ open: true, itemId: `${trailId}::${moduleId}::${lessonId}` })}
            />
          )}
          {activeSection === 'library' && (
            <LibrarySection
              library={library}
              filter={libraryFilter}
              onChangeFilter={setLibraryFilter}
              onCreate={() => setLibraryDialog({ open: true })}
              onEdit={(itemId) => setLibraryDialog({ open: true, itemId })}
              onDelete={(itemId, label) => setPendingDelete({ type: 'library', itemId, label })}
              onLink={(itemId) => setLinkLibraryDialog({ open: true, itemId })}
            />
          )}
          {activeSection === 'users' && <UsersSection trails={trails} collaborators={collaborators} lessonProgress={lessonProgress} />}
          {activeSection === 'progress' && <ProgressSection trails={trails} collaborators={collaborators} lessonProgress={lessonProgress} />}
          {activeSection === 'reports' && <ReportsSection trails={trails} collaborators={collaborators} />}
          {activeSection === 'settings' && <GlobalSettingsSection />}
        </div>
      </div>

      <TrailDialog
        open={trailDialog.open}
        trail={trailDialog.trailId ? trails.find((trail) => trail.id === trailDialog.trailId) ?? null : null}
        onClose={() => setTrailDialog({ open: false, mode: 'create' })}
        onSubmit={(values) => {
          if (trailDialog.mode === 'create') {
            createTrail(values);
            toast.success('Trilha criada com sucesso.');
          } else if (trailDialog.trailId) {
            updateTrail(trailDialog.trailId, values);
            toast.success('Trilha atualizada com sucesso.');
          }
          setTrailDialog({ open: false, mode: 'create' });
        }}
      />
      <ModuleDialog
        open={moduleDialog.open}
        module={moduleDialog.trailId && moduleDialog.moduleId ? trails.find((trail) => trail.id === moduleDialog.trailId)?.modules.find((module) => module.id === moduleDialog.moduleId) ?? null : null}
        onClose={() => setModuleDialog({ open: false })}
        onSubmit={(values) => {
          if (!moduleDialog.trailId) return;
          if (moduleDialog.moduleId) {
            updateModule(moduleDialog.trailId, moduleDialog.moduleId, values);
            toast.success('Modulo atualizado.');
          } else {
            addModule(moduleDialog.trailId, values);
            toast.success('Modulo criado.');
          }
          setModuleDialog({ open: false });
        }}
      />
      <LessonDialog
        open={lessonDialog.open}
        lesson={lessonDialog.trailId && lessonDialog.moduleId && lessonDialog.lessonId ? trails.find((trail) => trail.id === lessonDialog.trailId)?.modules.find((module) => module.id === lessonDialog.moduleId)?.lessons.find((lesson) => lesson.id === lessonDialog.lessonId) ?? null : null}
        onClose={() => setLessonDialog({ open: false })}
        onSubmit={(values) => {
          if (!lessonDialog.trailId || !lessonDialog.moduleId) return;
          if (lessonDialog.lessonId) {
            updateLesson(lessonDialog.trailId, lessonDialog.moduleId, lessonDialog.lessonId, values);
            toast.success('Aula atualizada.');
          } else {
            addLesson(lessonDialog.trailId, lessonDialog.moduleId, values);
            toast.success('Aula criada.');
          }
          setLessonDialog({ open: false });
        }}
      />
      <MaterialDialog
        open={materialDialog.open}
        material={materialDialog.trailId && materialDialog.moduleId && materialDialog.lessonId && materialDialog.materialId ? trails.find((trail) => trail.id === materialDialog.trailId)?.modules.find((module) => module.id === materialDialog.moduleId)?.lessons.find((lesson) => lesson.id === materialDialog.lessonId)?.materials.find((material) => material.id === materialDialog.materialId) ?? null : null}
        onClose={() => setMaterialDialog({ open: false })}
        onSubmit={(values) => {
          if (!materialDialog.trailId || !materialDialog.moduleId || !materialDialog.lessonId) return;
          if (materialDialog.materialId) {
            updateLessonMaterial(materialDialog.trailId, materialDialog.moduleId, materialDialog.lessonId, materialDialog.materialId, values);
            toast.success('Material atualizado.');
          } else {
            addLessonMaterial(materialDialog.trailId, materialDialog.moduleId, materialDialog.lessonId, values);
            toast.success('Material vinculado.');
          }
          setMaterialDialog({ open: false });
        }}
      />
      <LibraryItemDialog
        open={libraryDialog.open}
        item={libraryDialog.itemId ? library.find((entry) => entry.id === libraryDialog.itemId) ?? null : null}
        onClose={() => setLibraryDialog({ open: false })}
        onSubmit={(values) => {
          if (libraryDialog.itemId) {
            updateLibraryItem(libraryDialog.itemId, values);
            toast.success('Item da biblioteca atualizado.');
          } else {
            addLibraryItem(values);
            toast.success('Item da biblioteca criado.');
          }
          setLibraryDialog({ open: false });
        }}
      />
      <LinkLibraryDialog
        open={linkLibraryDialog.open}
        library={library}
        trails={trails}
        initialValue={linkLibraryDialog.itemId}
        onClose={() => setLinkLibraryDialog({ open: false })}
        onSubmit={(payload) => {
          attachLibraryItemToLesson(payload.trailId, payload.moduleId, payload.lessonId, payload.libraryItemId);
          toast.success('Item da biblioteca vinculado a aula.');
          setLinkLibraryDialog({ open: false });
        }}
      />
      <ConfirmDeleteDialog
        pending={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.type === 'trail') {
            deleteTrail(pendingDelete.trailId);
            if (selectedTrailId === pendingDelete.trailId) setSelectedTrailId(null);
          }
          if (pendingDelete.type === 'module') deleteModule(pendingDelete.trailId, pendingDelete.moduleId);
          if (pendingDelete.type === 'lesson') deleteLesson(pendingDelete.trailId, pendingDelete.moduleId, pendingDelete.lessonId);
          if (pendingDelete.type === 'material') removeLessonMaterial(pendingDelete.trailId, pendingDelete.moduleId, pendingDelete.lessonId, pendingDelete.materialId);
          if (pendingDelete.type === 'library') deleteLibraryItem(pendingDelete.itemId);
          toast.success('Item removido com sucesso.');
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function DashboardSection({
  metrics,
  progress,
  onOpenTrail,
  trails,
}: {
  metrics: { moduleCount: number; lessonCount: number; draftCount: number; publishedCount: number; pendingPublication: number };
  progress: number;
  onOpenTrail: (trailId: string, tab?: TrailContextSection) => void;
  trails: TrailEntity[];
}) {
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Painel administrativo" title="Validacao funcional do frontend" description="Indicadores e fluxos calculados a partir do estado mockado em tempo real." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Trilhas', value: String(trails.length), icon: GraduationCap },
          { label: 'Modulos', value: String(metrics.moduleCount), icon: FileText },
          { label: 'Aulas', value: String(metrics.lessonCount), icon: BookOpen },
          { label: 'Publicadas', value: String(metrics.publishedCount), icon: ShieldCheck },
          { label: 'Rascunhos', value: String(metrics.draftCount), icon: AlertTriangle },
        ].map((item) => (
          <div key={item.label} className="card-premium p-5">
            <item.icon className="mb-3 h-5 w-5 text-accent" />
            <p className="font-heading text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Trilhas recentes" description="Abra uma trilha para validar criacao, edicao, publicacao e consumo.">
          <div className="space-y-3">
            {trails.map((trail) => (
              <button key={trail.id} onClick={() => onOpenTrail(trail.id)} className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-4 text-left transition-colors hover:border-accent/40 hover:bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{trail.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{trail.modules.length} modulos • {getAllLessons(trail).length} aulas • {trail.estimatedDuration}</p>
                </div>
                <StatusPill status={trail.status} />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Estado do colaborador" description="Progresso refletido no portal com base na trilha publicada.">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Trilha publicada em consumo</p>
            <p className="mt-1 text-xs text-muted-foreground">{progress}% concluido no fluxo atual do colaborador</p>
            <Progress value={progress} className="mt-4 h-1.5 bg-muted [&>[role=progressbar]]:bg-accent" />
            <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
              Ver portal do colaborador <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Pendencias de publicacao</p>
            <p className="mt-1 text-xs text-muted-foreground">{metrics.pendingPublication} validacoes abertas nas trilhas atuais.</p>
          </div>
        </Panel>
      </div>
    </PageMotion>
  );
}

function TrailsSection(props: {
  trails: TrailEntity[];
  selectedTrail: TrailEntity | null;
  trailTab: TrailContextSection;
  onOpenTrail: (trailId: string, tab?: TrailContextSection) => void;
  onBack: () => void;
  onChangeTab: (tab: TrailContextSection) => void;
  onCreateTrail: () => void;
  onEditTrail: (trailId: string) => void;
  onDeleteTrail: (trailId: string, label: string) => void;
  onDuplicateTrail: (trailId: string) => void;
  onArchiveTrail: (trailId: string) => void;
  onPublishTrail: (trailId: string) => void;
  onSaveDraft: (trailId: string) => void;
  onCreateModule: (trailId: string) => void;
  onEditModule: (trailId: string, moduleId: string) => void;
  onDeleteModule: (trailId: string, moduleId: string, label: string) => void;
  onMoveModule: (trailId: string, moduleId: string, direction: 'up' | 'down') => void;
  onCreateLesson: (trailId: string, moduleId: string) => void;
  onEditLesson: (trailId: string, moduleId: string, lessonId: string) => void;
  onDeleteLesson: (trailId: string, moduleId: string, lessonId: string, label: string) => void;
  onMoveLesson: (trailId: string, moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
  onAddMaterial: (trailId: string, moduleId: string, lessonId: string) => void;
  onEditMaterial: (trailId: string, moduleId: string, lessonId: string, materialId: string) => void;
  onDeleteMaterial: (trailId: string, moduleId: string, lessonId: string, materialId: string, label: string) => void;
  onAttachLibrary: (trailId: string, moduleId: string, lessonId: string) => void;
}) {
  const { trails, selectedTrail, trailTab } = props;

  if (!selectedTrail) {
    return (
      <PageMotion>
        <HeaderBlock eyebrow="Trilhas" title="Gestao de trilhas" description="CRUD mockado completo para validar comportamento do painel administrativo." action={<Button className="bg-accent text-white hover:bg-accent/90" onClick={props.onCreateTrail}><Plus className="mr-1.5 h-4 w-4" />Nova trilha</Button>} />
        <SearchToolbar placeholder="Buscar trilha, setor ou publico-alvo" />
        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Trilha</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Estrutura</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Duracao</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {trails.map((trail) => (
                <tr key={trail.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="p-4">
                    <p className="font-medium text-foreground">{trail.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{trail.audience} • {trail.sector}</p>
                  </td>
                  <td className="p-4"><StatusPill status={trail.status} /></td>
                  <td className="p-4 text-muted-foreground">{trail.modules.length} modulos • {getAllLessons(trail).length} aulas</td>
                  <td className="p-4 text-muted-foreground">{trail.estimatedDuration}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => props.onOpenTrail(trail.id)}>Abrir</Button>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => props.onEditTrail(trail.id)}>Editar</Button>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => props.onDuplicateTrail(trail.id)}>Duplicar</Button>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => props.onArchiveTrail(trail.id)}>Arquivar</Button>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => props.onDeleteTrail(trail.id, trail.title)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <button onClick={props.onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista de trilhas
      </button>

      <TrailHeader
        trail={selectedTrail}
        onEdit={() => props.onEditTrail(selectedTrail.id)}
        onCreateContent={() => {
          if (trailTab === 'lessons' && selectedTrail.modules[0]) props.onCreateLesson(selectedTrail.id, selectedTrail.modules[0].id);
          else props.onCreateModule(selectedTrail.id);
        }}
        onDuplicate={() => props.onDuplicateTrail(selectedTrail.id)}
        onArchive={() => props.onArchiveTrail(selectedTrail.id)}
      />

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/70 p-2">
        {trailContextNav.map((item) => (
          <button key={item.key} onClick={() => props.onChangeTab(item.key)} className={`rounded-xl px-3 py-2 text-sm transition-colors ${trailTab === item.key ? 'bg-accent text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {trailTab === 'overview' && <TrailOverviewPanel trail={selectedTrail} />}
      {trailTab === 'modules' && <TrailModulesPanel trail={selectedTrail} onCreateModule={() => props.onCreateModule(selectedTrail.id)} onEditModule={(moduleId) => props.onEditModule(selectedTrail.id, moduleId)} onDeleteModule={(moduleId, label) => props.onDeleteModule(selectedTrail.id, moduleId, label)} onMoveModule={(moduleId, direction) => props.onMoveModule(selectedTrail.id, moduleId, direction)} />}
      {trailTab === 'lessons' && <TrailLessonsPanel trail={selectedTrail} onCreateLesson={(moduleId) => props.onCreateLesson(selectedTrail.id, moduleId)} onEditLesson={(moduleId, lessonId) => props.onEditLesson(selectedTrail.id, moduleId, lessonId)} onDeleteLesson={(moduleId, lessonId, label) => props.onDeleteLesson(selectedTrail.id, moduleId, lessonId, label)} onMoveLesson={(moduleId, lessonId, direction) => props.onMoveLesson(selectedTrail.id, moduleId, lessonId, direction)} />}
      {trailTab === 'materials' && <TrailMaterialsPanel trail={selectedTrail} onAddMaterial={(moduleId, lessonId) => props.onAddMaterial(selectedTrail.id, moduleId, lessonId)} onEditMaterial={(moduleId, lessonId, materialId) => props.onEditMaterial(selectedTrail.id, moduleId, lessonId, materialId)} onDeleteMaterial={(moduleId, lessonId, materialId, label) => props.onDeleteMaterial(selectedTrail.id, moduleId, lessonId, materialId, label)} onAttachLibrary={(moduleId, lessonId) => props.onAttachLibrary(selectedTrail.id, moduleId, lessonId)} />}
      {trailTab === 'publication' && <TrailPublicationPanel trail={selectedTrail} onPublish={() => props.onPublishTrail(selectedTrail.id)} onSaveDraft={() => props.onSaveDraft(selectedTrail.id)} onArchive={() => props.onArchiveTrail(selectedTrail.id)} />}
      {trailTab === 'settings' && <TrailSettingsPanel trail={selectedTrail} onEdit={() => props.onEditTrail(selectedTrail.id)} />}
    </PageMotion>
  );
}

function TrailHeader({ trail, onEdit, onCreateContent, onDuplicate, onArchive }: { trail: TrailEntity; onEdit: () => void; onCreateContent: () => void; onDuplicate: () => void; onArchive: () => void }) {
  return (
    <div className="mb-6 rounded-[28px] border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Trilhas</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{trail.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-foreground">{trail.title}</h1>
            <StatusPill status={trail.status} />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{trail.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <MetaToken label="Publico-alvo" value={trail.audience} />
            <MetaToken label="Setor" value={trail.sector} />
            <MetaToken label="Ultima atualizacao" value={trail.lastUpdated} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90" onClick={onCreateContent}><Plus className="mr-1.5 h-4 w-4" />Novo conteudo</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onDuplicate}><Copy className="mr-1.5 h-3.5 w-3.5" />Duplicar</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onEdit}>Editar trilha</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onArchive}><MoreHorizontal className="mr-1.5 h-3.5 w-3.5" />Arquivar</Button>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <ContextStatCard label="Total de modulos" value={String(trail.modules.length)} />
        <ContextStatCard label="Total de aulas" value={String(getAllLessons(trail).length)} />
        <ContextStatCard label="Duracao total" value={trail.estimatedDuration} />
      </div>
      {trail.coverUrl ? <img src={trail.coverUrl} alt={trail.title} className="mt-6 h-44 w-full rounded-2xl object-cover" /> : null}
    </div>
  );
}

function TrailOverviewPanel({ trail }: { trail: TrailEntity }) {
  const lessons = getAllLessons(trail);
  const materials = flattenMaterials(trail).slice(0, 4);
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Estrutura da trilha" description="Visao resumida dos modulos, aulas e materiais vinculados.">
        <div className="space-y-4">
          {trail.modules.map((module, index) => (
            <div key={module.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{String(index + 1).padStart(2, '0')} • {module.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{module.lessons.length} aulas</p>
                </div>
                <span className="text-xs text-muted-foreground">{module.lessons.reduce((total, lesson) => total + lesson.materials.length, 0)} materiais</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Sinais de consumo" description="Indicadores derivados da trilha publicada para o lado do colaborador.">
        <div className="space-y-4">
          <InfoCard title="Aulas com video" description={`${lessons.filter((lesson) => lesson.hasVideo).length} itens com player simulado.`} />
          <InfoCard title="Aulas sem video" description={`${lessons.filter((lesson) => !lesson.hasVideo).length} itens em leitura ou ciencia.`} />
          <InfoCard title="Materiais vinculados" description={`${lessons.reduce((total, lesson) => total + lesson.materials.length, 0)} arquivos ativos nesta trilha.`} />
        </div>
      </Panel>
      <Panel title="Materiais principais" description="Arquivos de apoio mais relevantes no estado atual da trilha.">
        <div className="space-y-3">
          {materials.map((item) => (
            <div key={item.material.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.material.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.lesson.title}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.material.type}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TrailModulesPanel({
  trail,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onMoveModule,
}: {
  trail: TrailEntity;
  onCreateModule: () => void;
  onEditModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string, label: string) => void;
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <Panel title="Modulos desta trilha" description="CRUD mockado com ordenacao e reflexo imediato na estrutura." action={<Button className="bg-accent text-white hover:bg-accent/90" onClick={onCreateModule}><Plus className="mr-1.5 h-4 w-4" />Criar modulo</Button>}>
      <div className="space-y-3">
        {trail.modules.map((module) => (
          <div key={module.id} className="flex flex-col gap-4 rounded-2xl border border-border/60 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{module.order}. {module.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <MetaToken label="Obrigatorio" value={module.required ? 'Sim' : 'Nao'} />
                <MetaToken label="Aulas" value={String(module.lessons.length)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => onMoveModule(module.id, 'up')}><ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />Subir</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onMoveModule(module.id, 'down')}>Descer</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onEditModule(module.id)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
              <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onDeleteModule(module.id, module.title)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Excluir</Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TrailLessonsPanel({
  trail,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: {
  trail: TrailEntity;
  onCreateLesson: (moduleId: string) => void;
  onEditLesson: (moduleId: string, lessonId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string, label: string) => void;
  onMoveLesson: (moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <div className="space-y-6">
      {trail.modules.map((module) => (
        <Panel key={module.id} title={module.title} description="Aulas ligadas diretamente a este modulo." action={<Button variant="outline" size="sm" className="text-xs" onClick={() => onCreateLesson(module.id)}><Plus className="mr-1.5 h-4 w-4" />Nova aula</Button>}>
          <div className="space-y-3">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{module.order}.{lesson.order} {lesson.title}</p>
                    <span className="badge-pending">{lesson.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{lesson.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <MetaToken label="Obrigatoria" value={lesson.mandatory ? 'Sim' : 'Nao'} />
                    <MetaToken label="Ciencia" value={lesson.requiresAcknowledgment ? 'Sim' : 'Nao'} />
                    <MetaToken label="Video" value={lesson.hasVideo ? 'Sim' : 'Nao'} />
                    <MetaToken label="Duracao" value={lesson.duration} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => onMoveLesson(module.id, lesson.id, 'up')}>Subir</Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => onMoveLesson(module.id, lesson.id, 'down')}>Descer</Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => onEditLesson(module.id, lesson.id)}>Editar</Button>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onDeleteLesson(module.id, lesson.id, lesson.title)}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

function TrailMaterialsPanel({
  trail,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onAttachLibrary,
}: {
  trail: TrailEntity;
  onAddMaterial: (moduleId: string, lessonId: string) => void;
  onEditMaterial: (moduleId: string, lessonId: string, materialId: string) => void;
  onDeleteMaterial: (moduleId: string, lessonId: string, materialId: string, label: string) => void;
  onAttachLibrary: (moduleId: string, lessonId: string) => void;
}) {
  const materials = flattenMaterials(trail);
  return (
    <Panel title="Materiais vinculados" description="Adicione manualmente ou reutilize itens da biblioteca em qualquer aula.">
      <div className="card-premium overflow-hidden shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left font-medium text-muted-foreground">Arquivo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Aula</th>
              <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item) => (
              <tr key={item.material.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <MediaIcon type={item.material.type} />
                    <div>
                      <p className="font-medium text-foreground">{item.material.name}</p>
                      <p className="text-xs text-muted-foreground">{item.material.size}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{item.material.type}</td>
                <td className="p-4"><LibraryStatusPill status={item.material.status} /></td>
                <td className="p-4 text-muted-foreground">{item.lesson.title}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => onEditMaterial(item.module.id, item.lesson.id, item.material.id)}>Editar</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onDeleteMaterial(item.module.id, item.lesson.id, item.material.id, item.material.name)}>Excluir</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 space-y-4">
        {trail.modules.map((module) => (
          <div key={module.id} className="rounded-2xl border border-border/60 p-4">
            <p className="text-sm font-medium text-foreground">{module.title}</p>
            <div className="mt-3 space-y-2">
              {module.lessons.map((lesson) => (
                <div key={lesson.id} className="flex flex-col gap-3 rounded-xl border border-border/50 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm text-foreground">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.materials.length} materiais vinculados</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => onAddMaterial(module.id, lesson.id)}><Upload className="mr-1.5 h-3.5 w-3.5" />Adicionar material</Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => onAttachLibrary(module.id, lesson.id)}>Usar biblioteca</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TrailPublicationPanel({ trail, onPublish, onSaveDraft, onArchive }: { trail: TrailEntity; onPublish: () => void; onSaveDraft: () => void; onArchive: () => void }) {
  const issues = getPublicationIssues(trail);
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Status da trilha" description="Publicacao controlada por regras mockadas reais.">
        <div className="space-y-4">
          <InfoCard title="Status atual" description={normalizeTrailStatus(trail.status)} />
          <InfoCard title="Situacao" description={trail.status === 'published' ? 'A trilha esta disponivel no portal do colaborador.' : trail.status === 'draft' ? 'A trilha ainda nao foi publicada.' : 'A trilha esta arquivada e fora da operacao ativa.'} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="bg-accent text-white hover:bg-accent/90" onClick={onPublish} disabled={issues.length > 0}>Publicar trilha</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onSaveDraft}>Salvar como rascunho</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onArchive}>Arquivar</Button>
        </div>
      </Panel>

      <Panel title="Validacoes" description={issues.length === 0 ? 'A trilha atende aos requisitos minimos de publicacao.' : 'Ajuste apenas os pontos criticos abaixo para liberar a publicacao.'}>
        {issues.length === 0 ? (
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">Nenhuma pendencia critica encontrada.</div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue} className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">{issue}</div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function TrailSettingsPanel({ trail, onEdit }: { trail: TrailEntity; onEdit: () => void }) {
  return (
    <Panel title="Configuracoes da trilha" description="Campos principais prontos para futura integracao com API.">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['Nome', trail.title],
          ['Descricao', trail.description],
          ['Publico-alvo', trail.audience],
          ['Setor', trail.sector],
          ['Obrigatoria', trail.mandatory ? 'Sim' : 'Nao'],
          ['Duracao', trail.estimatedDuration],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-6 text-xs" onClick={onEdit}>Editar configuracoes</Button>
    </Panel>
  );
}

function LibrarySection({
  library,
  filter,
  onChangeFilter,
  onCreate,
  onEdit,
  onDelete,
  onLink,
}: {
  library: LibraryItem[];
  filter: 'all' | LibraryItemType;
  onChangeFilter: (value: 'all' | LibraryItemType) => void;
  onCreate: () => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string, label: string) => void;
  onLink: (itemId: string) => void;
}) {
  const filteredItems = filter === 'all' ? library : library.filter((item) => item.type === filter);
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Biblioteca" title="Acervo transversal" description="Cadastro, edicao, exclusao, filtro e reutilizacao de itens mockados." action={<Button className="bg-accent text-white hover:bg-accent/90" onClick={onCreate}><Plus className="mr-1.5 h-4 w-4" />Novo item</Button>} />
      <div className="mb-5 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Filtrar por tipo</label>
        <select value={filter} onChange={(event) => onChangeFilter(event.target.value as 'all' | LibraryItemType)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">Todos</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="slide">Slide</option>
          <option value="documento auxiliar">Documento auxiliar</option>
          <option value="thumbnail">Thumbnail</option>
        </select>
      </div>
      <div className="card-premium overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left font-medium text-muted-foreground">Item</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Atualizacao</th>
              <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <MediaIcon type={item.type} />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{item.type}</td>
                <td className="p-4"><LibraryStatusPill status={item.status} /></td>
                <td className="p-4 text-muted-foreground">{item.updatedAt}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => onLink(item.id)}>Vincular</Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => onEdit(item.id)}>Editar</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onDelete(item.id, item.name)}>Excluir</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageMotion>
  );
}

function UsersSection({ trails, collaborators, lessonProgress }: { trails: TrailEntity[]; collaborators: ReturnType<typeof useAppState>['collaborators']; lessonProgress: ReturnType<typeof useAppState>['lessonProgress'] }) {
  const primaryTrail = getPublishedTrails(trails)[0] ?? trails[0];
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Usuarios" title="Colaboradores mockados" description="Visao de leitura para acompanhar atribuicao e progresso no prototipo." />
      <div className="card-premium overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30"><th className="p-4 text-left font-medium text-muted-foreground">Colaborador</th><th className="p-4 text-left font-medium text-muted-foreground">Setor</th><th className="p-4 text-left font-medium text-muted-foreground">Trilha</th><th className="p-4 text-left font-medium text-muted-foreground">Progresso</th></tr></thead>
          <tbody>
            {collaborators.map((collaborator) => (
              <tr key={collaborator.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-4"><UserCell name={collaborator.name} email={collaborator.email} /></td>
                <td className="p-4 text-muted-foreground">{collaborator.sector}</td>
                <td className="p-4 text-muted-foreground">{primaryTrail?.title || 'Sem trilha'}</td>
                <td className="p-4 text-muted-foreground">{primaryTrail ? `${getTrailProgress(primaryTrail, lessonProgress[collaborator.id])}%` : '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageMotion>
  );
}

function ProgressSection({ trails, collaborators, lessonProgress }: { trails: TrailEntity[]; collaborators: ReturnType<typeof useAppState>['collaborators']; lessonProgress: ReturnType<typeof useAppState>['lessonProgress'] }) {
  const publishedTrail = getPublishedTrails(trails)[0] ?? trails[0];
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Progresso" title="Progresso dinamico" description="Dados calculados em runtime a partir do progresso mockado por colaborador." />
      <div className="space-y-3">
        {collaborators.map((collaborator) => (
          <div key={collaborator.id} className="card-premium flex items-center justify-between gap-4 p-5">
            <UserCell name={collaborator.name} email={collaborator.email} />
            <div className="flex items-center gap-3">
              <Progress value={publishedTrail ? getTrailProgress(publishedTrail, lessonProgress[collaborator.id]) : 0} className="h-1.5 w-32 bg-muted [&>[role=progressbar]]:bg-accent" />
              <span className="text-xs text-muted-foreground">{publishedTrail ? getTrailProgress(publishedTrail, lessonProgress[collaborator.id]) : 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </PageMotion>
  );
}

function ReportsSection({ trails, collaborators }: { trails: TrailEntity[]; collaborators: ReturnType<typeof useAppState>['collaborators'] }) {
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Relatorios" title="Relatorios simulados" description="Indicadores sinteticos prontos para futura substituicao por chamadas reais de API." />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Trilhas em operacao" description={`${trails.length} trilhas registradas no estado atual.`} />
        <InfoCard title="Colaboradores ativos" description={`${collaborators.length} colaboradores disponiveis na base mockada.`} />
        <InfoCard title="Trilhas publicadas" description={`${trails.filter((trail) => trail.status === 'published').length} trilhas publicadas para consumo.`} />
        <InfoCard title="Pendencias de publicacao" description={`${trails.reduce((total, trail) => total + getPublicationIssues(trail).length, 0)} regras em aberto.`} />
      </div>
    </PageMotion>
  );
}

function GlobalSettingsSection() {
  return (
    <PageMotion>
      <HeaderBlock eyebrow="Configuracoes" title="Parametros globais mockados" description="Seccao mantida como referencia de produto para a futura integracao real." />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Persistencia local" description="O estado do prototipo e salvo em localStorage para validacao funcional." />
        <InfoCard title="Upload mockado" description="Materiais podem ser criados e vinculados sem backend ou armazenamento real." />
        <InfoCard title="Publicacao validada" description="Acoes de publicar, arquivar e salvar rascunho seguem regras de negocio simuladas." />
        <InfoCard title="Fluxo colaborador" description="Admin e portal interno compartilham a mesma fonte de dados mockada." />
      </div>
    </PageMotion>
  );
}

function TrailDialog({ open, trail, onClose, onSubmit }: { open: boolean; trail: TrailEntity | null; onClose: () => void; onSubmit: (values: TrailFormInput) => void }) {
  const [form, setForm] = useState<TrailFormInput>(trail ? mapTrailToForm(trail) : trailDefaults);
  useEffect(() => setForm(trail ? mapTrailToForm(trail) : trailDefaults), [trail, open]);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, coverName: file.name, coverUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <FormDialog open={open} onClose={onClose} title={trail ? 'Editar trilha' : 'Nova trilha'} description="Campos minimos para validar o CRUD de trilhas.">
      <div className="grid gap-4">
        <Field label="Nome"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Descricao"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Publico-alvo"><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Field>
          <Field label="Setor"><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></Field>
          <Field label="Status"><NativeSelect value={form.status} onChange={(value) => setForm({ ...form, status: value as TrailStatus })} options={['draft', 'published', 'archived']} /></Field>
          <Field label="Duracao estimada"><Input value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} /></Field>
        </div>
        <Field label="Capa opcional">
          <div className="space-y-3">
            <Input value={form.coverName || ''} onChange={(e) => setForm({ ...form, coverName: e.target.value })} />
            <Input type="file" accept="image/*" onChange={handleCoverChange} />
            {form.coverUrl ? <img src={form.coverUrl} alt="Preview da capa" className="h-32 w-full rounded-lg object-cover" /> : null}
          </div>
        </Field>
        <CheckboxRow label="Trilha obrigatoria" checked={form.mandatory} onCheckedChange={(checked) => setForm({ ...form, mandatory: checked })} />
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit(form)}>Salvar</Button></DialogFooter>
    </FormDialog>
  );
}

function ModuleDialog({ open, module, onClose, onSubmit }: { open: boolean; module: ModuleEntity | null; onClose: () => void; onSubmit: (values: ModuleFormInput) => void }) {
  const [form, setForm] = useState<ModuleFormInput>(module ? { title: module.title, description: module.description, required: module.required } : moduleDefaults);
  useEffect(() => setForm(module ? { title: module.title, description: module.description, required: module.required } : moduleDefaults), [module, open]);
  return (
    <FormDialog open={open} onClose={onClose} title={module ? 'Editar modulo' : 'Novo modulo'} description="Atualize nome, descricao e obrigatoriedade.">
      <div className="grid gap-4">
        <Field label="Nome"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Descricao"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <CheckboxRow label="Modulo obrigatorio" checked={form.required} onCheckedChange={(checked) => setForm({ ...form, required: checked })} />
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit(form)}>Salvar</Button></DialogFooter>
    </FormDialog>
  );
}

function LessonDialog({ open, lesson, onClose, onSubmit }: { open: boolean; lesson: LessonEntity | null; onClose: () => void; onSubmit: (values: LessonFormInput) => void }) {
  const [form, setForm] = useState<LessonFormInput>(lesson ? mapLessonToForm(lesson) : lessonDefaults);
  useEffect(() => setForm(lesson ? mapLessonToForm(lesson) : lessonDefaults), [lesson, open]);

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((current) => ({ ...current, hasVideo: true, videoUrl: URL.createObjectURL(file), videoName: file.name }));
  };

  return (
    <FormDialog open={open} onClose={onClose} title={lesson ? 'Editar aula' : 'Nova aula'} description="Campos centrais para validar o fluxo de criacao e edicao de aulas.">
      <div className="grid gap-4">
        <Field label="Titulo"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Descricao"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Objetivo"><Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Duracao"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Setor"><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></Field>
          <Field label="Tipo"><NativeSelect value={form.type} onChange={(value) => setForm({ ...form, type: value as LessonType })} options={['video', 'leitura obrigatoria', 'comunicado', 'procedimento interno', 'termo de ciencia']} /></Field>
          <Field label="Status do conteudo"><NativeSelect value={form.contentStatus} onChange={(value) => setForm({ ...form, contentStatus: value as LessonContentStatus })} options={['ready', 'draft']} /></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <CheckboxRow label="Obrigatoria" checked={form.mandatory} onCheckedChange={(checked) => setForm({ ...form, mandatory: checked })} />
          <CheckboxRow label="Exige ciencia" checked={form.requiresAcknowledgment} onCheckedChange={(checked) => setForm({ ...form, requiresAcknowledgment: checked })} />
          <CheckboxRow label="Possui video" checked={form.hasVideo} onCheckedChange={(checked) => setForm({ ...form, hasVideo: checked, videoUrl: checked ? form.videoUrl : '', videoName: checked ? form.videoName : '' })} />
        </div>
        {form.hasVideo ? (
          <Field label="Video local para teste">
            <div className="space-y-3">
              <Input type="file" accept="video/*" onChange={handleVideoChange} />
              {form.videoName ? <p className="text-xs text-muted-foreground">Arquivo selecionado: {form.videoName}</p> : null}
            </div>
          </Field>
        ) : null}
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit(form)}>Salvar</Button></DialogFooter>
    </FormDialog>
  );
}

function MaterialDialog({ open, material, onClose, onSubmit }: { open: boolean; material: LinkedMaterial | null; onClose: () => void; onSubmit: (values: MaterialFormInput) => void }) {
  const [form, setForm] = useState<MaterialFormInput>(material ? mapMaterialToForm(material) : materialDefaults);
  useEffect(() => setForm(material ? mapMaterialToForm(material) : materialDefaults), [material, open]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const normalizedType = file.type.startsWith('image/')
      ? 'thumbnail'
      : file.type.includes('pdf')
        ? 'pdf'
        : file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')
          ? 'slide'
          : 'documento auxiliar';
    setForm((current) => ({
      ...current,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: normalizedType,
      fileUrl: URL.createObjectURL(file),
      mimeType: file.type,
    }));
  };

  return (
    <FormDialog open={open} onClose={onClose} title={material ? 'Editar material' : 'Novo material'} description="Cadastro manual de material sem upload real.">
      <div className="grid gap-4">
        <Field label="Nome do arquivo"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tipo"><NativeSelect value={form.type} onChange={(value) => setForm({ ...form, type: value as LibraryItemType })} options={['video', 'pdf', 'slide', 'documento auxiliar', 'thumbnail']} /></Field>
          <Field label="Tamanho"><Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field>
          <Field label="Status"><NativeSelect value={form.status} onChange={(value) => setForm({ ...form, status: value as LibraryItemStatus })} options={['ativo', 'em revisao', 'arquivado']} /></Field>
        </div>
        <Field label="Selecionar arquivo local"><Input type="file" onChange={handleFileChange} /></Field>
        <Field label="Observacao"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit(form)}>Salvar</Button></DialogFooter>
    </FormDialog>
  );
}

function LibraryItemDialog({ open, item, onClose, onSubmit }: { open: boolean; item: LibraryItem | null; onClose: () => void; onSubmit: (values: { name: string; type: LibraryItemType; size: string; status: LibraryItemStatus; note: string; fileUrl?: string; mimeType?: string }) => void }) {
  const [form, setForm] = useState(item ? { name: item.name, type: item.type, size: item.size, status: item.status, note: item.note } : materialDefaults);
  useEffect(() => setForm(item ? { name: item.name, type: item.type, size: item.size, status: item.status, note: item.note } : materialDefaults), [item, open]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const normalizedType = file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('image/')
        ? 'thumbnail'
        : file.type.includes('pdf')
          ? 'pdf'
          : file.name.endsWith('.ppt') || file.name.endsWith('.pptx')
            ? 'slide'
            : 'documento auxiliar';
    setForm((current) => ({
      ...current,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: normalizedType,
      fileUrl: URL.createObjectURL(file),
      mimeType: file.type,
    }));
  };

  return (
    <FormDialog open={open} onClose={onClose} title={item ? 'Editar item da biblioteca' : 'Novo item da biblioteca'} description="Acervo transversal reutilizavel entre aulas e trilhas.">
      <div className="grid gap-4">
        <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tipo"><NativeSelect value={form.type} onChange={(value) => setForm({ ...form, type: value as LibraryItemType })} options={['video', 'pdf', 'slide', 'documento auxiliar', 'thumbnail']} /></Field>
          <Field label="Tamanho"><Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field>
          <Field label="Status"><NativeSelect value={form.status} onChange={(value) => setForm({ ...form, status: value as LibraryItemStatus })} options={['ativo', 'em revisao', 'arquivado']} /></Field>
        </div>
        <Field label="Selecionar arquivo local"><Input type="file" onChange={handleFileChange} /></Field>
        <Field label="Observacao"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit(form)}>Salvar</Button></DialogFooter>
    </FormDialog>
  );
}

function LinkLibraryDialog({ open, library, trails, initialValue, onClose, onSubmit }: { open: boolean; library: LibraryItem[]; trails: TrailEntity[]; initialValue?: string; onClose: () => void; onSubmit: (payload: { libraryItemId: string; trailId: string; moduleId: string; lessonId: string }) => void }) {
  const [libraryItemId, setLibraryItemId] = useState('');
  const [trailId, setTrailId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [lessonId, setLessonId] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialValue?.includes('::')) {
      const [nextTrailId, nextModuleId, nextLessonId] = initialValue.split('::');
      setTrailId(nextTrailId);
      setModuleId(nextModuleId);
      setLessonId(nextLessonId);
      setLibraryItemId(library[0]?.id || '');
    } else {
      setLibraryItemId(initialValue || library[0]?.id || '');
      setTrailId(trails[0]?.id || '');
      setModuleId(trails[0]?.modules[0]?.id || '');
      setLessonId(trails[0]?.modules[0]?.lessons[0]?.id || '');
    }
  }, [open, initialValue, library, trails]);

  const selectedTrail = trails.find((trail) => trail.id === trailId) ?? trails[0];
  const selectedModule = selectedTrail?.modules.find((module) => module.id === moduleId) ?? selectedTrail?.modules[0];

  return (
    <FormDialog open={open} onClose={onClose} title="Vincular item da biblioteca" description="Selecione um item e uma aula para criar o vinculo imediatamente.">
      <div className="grid gap-4">
        <Field label="Item da biblioteca"><NativeSelect value={libraryItemId} onChange={setLibraryItemId} options={library.map((item) => item.id)} labels={Object.fromEntries(library.map((item) => [item.id, item.name]))} /></Field>
        <Field label="Trilha"><NativeSelect value={trailId} onChange={(value) => { setTrailId(value); const nextTrail = trails.find((trail) => trail.id === value); setModuleId(nextTrail?.modules[0]?.id || ''); setLessonId(nextTrail?.modules[0]?.lessons[0]?.id || ''); }} options={trails.map((trail) => trail.id)} labels={Object.fromEntries(trails.map((trail) => [trail.id, trail.title]))} /></Field>
        <Field label="Modulo"><NativeSelect value={moduleId} onChange={(value) => { setModuleId(value); const nextModule = selectedTrail?.modules.find((module) => module.id === value); setLessonId(nextModule?.lessons[0]?.id || ''); }} options={(selectedTrail?.modules || []).map((module) => module.id)} labels={Object.fromEntries((selectedTrail?.modules || []).map((module) => [module.id, module.title]))} /></Field>
        <Field label="Aula"><NativeSelect value={lessonId} onChange={setLessonId} options={(selectedModule?.lessons || []).map((lesson) => lesson.id)} labels={Object.fromEntries((selectedModule?.lessons || []).map((lesson) => [lesson.id, lesson.title]))} /></Field>
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSubmit({ libraryItemId, trailId, moduleId, lessonId })}>Vincular</Button></DialogFooter>
    </FormDialog>
  );
}

function ConfirmDeleteDialog({ pending, onClose, onConfirm }: { pending: PendingDelete | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={!!pending} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusao</DialogTitle>
          <DialogDescription>Esta acao remove "{pending?.label}" do estado mockado atual.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormDialog({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description: string; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function HeaderBlock({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function SearchToolbar({ placeholder }: { placeholder: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input placeholder={placeholder} className="w-72 rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/20" />
      </div>
      <Button variant="outline" size="sm" className="text-xs"><Filter className="mr-1.5 h-3.5 w-3.5" />Filtros</Button>
    </div>
  );
}

function Panel({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="card-premium p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PageMotion({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
}

function ContextStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function MetaToken({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1.5">
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function UserCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
        <span className="text-xs font-medium text-primary-foreground">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
      </div>
      <div>
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: TrailStatus }) {
  const styles: Record<TrailStatus, string> = {
    draft: 'border-amber-200 bg-amber-50 text-amber-700',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    archived: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{normalizeTrailStatus(status)}</span>;
}

function LibraryStatusPill({ status }: { status: LibraryItemStatus }) {
  const styles: Record<LibraryItemStatus, string> = {
    ativo: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'em revisao': 'border-amber-200 bg-amber-50 text-amber-700',
    arquivado: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>;
}

function MediaIcon({ type }: { type: LibraryItemType }) {
  const className = 'h-4 w-4 text-muted-foreground';
  if (type === 'video') return <Video className={className} />;
  if (type === 'thumbnail') return <Image className={className} />;
  return <File className={className} />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  labels,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
      {options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}
    </select>
  );
}

function CheckboxRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} className="h-4 w-4 rounded border-border" />
      {label}
    </label>
  );
}

function flattenMaterials(trail: TrailEntity) {
  return trail.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.materials.map((material) => ({ module, lesson, material }))));
}

function mapTrailToForm(trail: TrailEntity): TrailFormInput {
  return {
    title: trail.title,
    description: trail.description,
    audience: trail.audience,
    sector: trail.sector,
    status: trail.status,
    estimatedDuration: trail.estimatedDuration,
    coverName: trail.coverName,
    coverUrl: trail.coverUrl,
    mandatory: trail.mandatory,
  };
}

function mapLessonToForm(lesson: LessonEntity): LessonFormInput {
  return {
    title: lesson.title,
    description: lesson.description,
    objective: lesson.objective,
    duration: lesson.duration,
    sector: lesson.sector,
    type: lesson.type,
    mandatory: lesson.mandatory,
    requiresAcknowledgment: lesson.requiresAcknowledgment,
    hasVideo: lesson.hasVideo,
    videoUrl: lesson.videoUrl,
    videoName: lesson.videoName,
    contentStatus: lesson.contentStatus,
  };
}

function mapMaterialToForm(material: LinkedMaterial): MaterialFormInput {
  return {
    name: material.name,
    type: material.type,
    size: material.size,
    status: material.status,
    note: material.note,
    libraryItemId: material.libraryItemId,
    fileUrl: material.fileUrl,
    mimeType: material.mimeType,
  };
}

function normalizeTrailStatus(status: TrailStatus) {
  return { draft: 'Rascunho', published: 'Publicada', archived: 'Arquivada' }[status];
}
