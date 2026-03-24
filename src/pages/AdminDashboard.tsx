import { useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  ChevronRight,
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
  TrendingUp,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockTrail, mockCollaborators, getAllLessons, type Collaborator, type Lesson, type Material, type Trail } from '@/data/mockData';

type AdminSection = 'dashboard' | 'trails' | 'library' | 'users' | 'progress' | 'reports' | 'settings';
type TrailContextSection = 'overview' | 'modules' | 'lessons' | 'materials' | 'publication' | 'settings';
type TrailStatus = 'published' | 'draft' | 'archived';
type LessonOperationalType = 'video' | 'leitura obrigatoria' | 'comunicado' | 'procedimento interno' | 'termo de ciencia';
type LibraryAssetType = 'video' | 'pdf' | 'slides' | 'thumbnail' | 'documento';

interface AdminTrail extends Trail {
  status: TrailStatus;
  audience: string;
  sector: string;
  lastUpdated: string;
  avgProgress: number;
  assignedCollaborators: number;
  mandatory: boolean;
  order: number;
  coverName: string;
  completionRule: string;
  requiresAcknowledgment: boolean;
}

interface LibraryAsset {
  id: string;
  name: string;
  type: LibraryAssetType;
  size: string;
  updatedAt: string;
  status: 'ativo' | 'em revisao' | 'arquivado';
  usageCount: number;
}

const adminNav: { label: string; icon: ElementType; key: AdminSection }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { label: 'Trilhas', icon: GraduationCap, key: 'trails' },
  { label: 'Biblioteca', icon: FolderOpen, key: 'library' },
  { label: 'Usuarios', icon: Users, key: 'users' },
  { label: 'Progresso', icon: TrendingUp, key: 'progress' },
  { label: 'Relatorios', icon: BarChart3, key: 'reports' },
  { label: 'Configuracoes', icon: Settings, key: 'settings' },
];

const trailContextNav: { label: string; key: TrailContextSection }[] = [
  { label: 'Visao geral', key: 'overview' },
  { label: 'Modulos', key: 'modules' },
  { label: 'Aulas', key: 'lessons' },
  { label: 'Materiais vinculados', key: 'materials' },
  { label: 'Publicacao', key: 'publication' },
  { label: 'Configuracoes da trilha', key: 'settings' },
];

const lessonOperations: Record<string, { type: LessonOperationalType; mandatory: boolean; editorialStatus: 'publicada' | 'rascunho' | 'revisao'; requiresAcknowledgment: boolean }> = {
  l1: { type: 'video', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: false },
  l2: { type: 'termo de ciencia', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: true },
  l3: { type: 'video', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: false },
  l4: { type: 'procedimento interno', mandatory: true, editorialStatus: 'rascunho', requiresAcknowledgment: false },
  l5: { type: 'video', mandatory: false, editorialStatus: 'revisao', requiresAcknowledgment: false },
  l6: { type: 'leitura obrigatoria', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: true },
  l7: { type: 'comunicado', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: true },
  l8: { type: 'video', mandatory: false, editorialStatus: 'publicada', requiresAcknowledgment: false },
  l9: { type: 'procedimento interno', mandatory: true, editorialStatus: 'publicada', requiresAcknowledgment: false },
};

const adminTrails: AdminTrail[] = [
  {
    ...mockTrail,
    title: 'Onboarding Institucional ABR Advogados',
    description: 'Trilha principal de integracao institucional para novos colaboradores, com conteudos editoriais, operacionais e de ciencia obrigatoria.',
    status: 'published',
    audience: 'Novos colaboradores',
    sector: 'Todos os setores',
    lastUpdated: '22/03/2026',
    avgProgress: 72,
    assignedCollaborators: 24,
    mandatory: true,
    order: 1,
    coverName: 'capa-onboarding-abr.jpg',
    completionRule: 'Concluir 100% das aulas obrigatorias e confirmar os termos de ciencia.',
    requiresAcknowledgment: true,
  },
  {
    ...mockTrail,
    id: '2',
    title: 'Boas Praticas de Compliance e Sigilo',
    description: 'Trilha editorial dedicada a sigilo, padroes de conduta, fluxo de leitura obrigatoria e conformidade institucional.',
    totalDuration: '4h 10min',
    progress: 58,
    status: 'draft',
    audience: 'Juridico e Administrativo',
    sector: 'Juridico / Administrativo',
    lastUpdated: '21/03/2026',
    avgProgress: 41,
    assignedCollaborators: 17,
    mandatory: true,
    order: 2,
    coverName: 'capa-compliance.jpg',
    completionRule: 'Concluir leitura obrigatoria, termo de confidencialidade e comunicado interno.',
    requiresAcknowledgment: true,
    modules: mockTrail.modules.slice(0, 3),
  },
  {
    ...mockTrail,
    id: '3',
    title: 'Rotinas Operacionais e Sistemas Internos',
    description: 'Trilha orientada a procedimentos internos, uso de sistemas e governanca operacional para equipes de apoio.',
    totalDuration: '5h 20min',
    progress: 44,
    status: 'archived',
    audience: 'Administrativo / TI',
    sector: 'Administrativo / TI',
    lastUpdated: '18/03/2026',
    avgProgress: 63,
    assignedCollaborators: 11,
    mandatory: false,
    order: 3,
    coverName: 'capa-rotinas.jpg',
    completionRule: 'Concluir aulas de procedimento interno e revisar materiais de apoio criticos.',
    requiresAcknowledgment: false,
    modules: mockTrail.modules.slice(1),
  },
];

const libraryAssets: LibraryAsset[] = [
  { id: 'b1', name: 'video-boas-vindas-institucional.mp4', type: 'video', size: '245 MB', updatedAt: '22/03/2026', status: 'ativo', usageCount: 3 },
  { id: 'b2', name: 'manual-colaborador-abr.pdf', type: 'pdf', size: '2.8 MB', updatedAt: '22/03/2026', status: 'ativo', usageCount: 4 },
  { id: 'b3', name: 'apresentacao-institucional-abr.pdf', type: 'slides', size: '4.2 MB', updatedAt: '20/03/2026', status: 'ativo', usageCount: 2 },
  { id: 'b4', name: 'capa-trilha-onboarding.jpg', type: 'thumbnail', size: '380 KB', updatedAt: '19/03/2026', status: 'ativo', usageCount: 1 },
  { id: 'b5', name: 'politica-de-privacidade-interna.pdf', type: 'documento', size: '980 KB', updatedAt: '18/03/2026', status: 'em revisao', usageCount: 2 },
  { id: 'b6', name: 'guia-comunicacao-interna.pdf', type: 'documento', size: '1.1 MB', updatedAt: '17/03/2026', status: 'arquivado', usageCount: 1 },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [trailContextSection, setTrailContextSection] = useState<TrailContextSection>('overview');

  const selectedTrail = adminTrails.find((trail) => trail.id === selectedTrailId) ?? null;
  const allLessons = adminTrails.flatMap((trail) => getAllLessons(trail));
  const draftCount = allLessons.filter((lesson) => getLessonOperation(lesson).editorialStatus !== 'publicada').length;
  const pendingAcknowledgments = allLessons.filter((lesson) => getLessonOperation(lesson).requiresAcknowledgment).length;
  const completionAverage = Math.round(adminTrails.reduce((total, trail) => total + trail.avgProgress, 0) / adminTrails.length);

  const dashboardStats = [
    { label: 'Trilhas ativas', value: String(adminTrails.filter((trail) => trail.status === 'published').length), sublabel: 'Publicadas e em uso', icon: GraduationCap },
    { label: 'Colaboradores em andamento', value: String(mockCollaborators.filter((collaborator) => collaborator.status === 'active').length), sublabel: 'Demandando acompanhamento', icon: Users },
    { label: 'Pendencias de ciencia', value: String(pendingAcknowledgments), sublabel: 'Itens que exigem confirmacao', icon: ShieldCheck },
    { label: 'Conteudos em rascunho', value: String(draftCount), sublabel: 'Aulas aguardando publicacao', icon: FileText },
    { label: 'Taxa media de conclusao', value: `${completionAverage}%`, sublabel: 'Media consolidada entre trilhas', icon: TrendingUp },
    { label: 'Alertas administrativos', value: '4', sublabel: 'Publicacao e leitura obrigatoria', icon: AlertTriangle },
  ];

  const openTrail = (trailId: string, context: TrailContextSection = 'overview') => {
    setSelectedTrailId(trailId);
    setTrailContextSection(context);
    setActiveSection('trails');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Administracao</p>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">Operacao editorial</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Gestao institucional de trilhas, biblioteca e publicacao.</p>
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
                activeSection === item.key
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Eye className="h-3.5 w-3.5" />
            Ver como colaborador
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {activeSection === 'dashboard' && <DashboardSection stats={dashboardStats} onOpenTrail={openTrail} />}
          {activeSection === 'trails' && (
            <TrailsSection
              trails={adminTrails}
              selectedTrail={selectedTrail}
              trailContextSection={trailContextSection}
              onBackToList={() => setSelectedTrailId(null)}
              onOpenTrail={openTrail}
              onChangeContextSection={setTrailContextSection}
            />
          )}
          {activeSection === 'library' && <LibrarySection />}
          {activeSection === 'users' && <UsersSection trails={adminTrails} />}
          {activeSection === 'progress' && <ProgressSection trails={adminTrails} />}
          {activeSection === 'reports' && <ReportsSection trails={adminTrails} />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

function DashboardSection({ stats, onOpenTrail }: { stats: { label: string; value: string; sublabel: string; icon: ElementType }[]; onOpenTrail: (trailId: string, context?: TrailContextSection) => void }) {
  const recentUpdates = getRecentLessons(adminTrails[0]).slice(0, 4);

  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Painel administrativo"
        title="Visao estrategica da operacao de treinamento"
        description="Um dashboard focado em saude editorial, andamento das trilhas e pendencias operacionais prioritarias."
        actionLabel="Nova trilha"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="card-premium p-5"
          >
            <stat.icon className="mb-4 h-5 w-5 text-accent" />
            <p className="font-heading text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sublabel}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <Panel
            title="Ultimos conteudos atualizados"
            description="Acompanhe o que mudou recentemente antes de revisar ou publicar."
            action={<Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenTrail(adminTrails[0].id, 'lessons')}>Abrir trilha</Button>}
          >
            <div className="space-y-3">
              {recentUpdates.map(({ lesson, moduleTitle }) => (
                <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{moduleTitle} • {getLessonOperation(lesson).type} • {lesson.updatedAt}</p>
                  </div>
                  <StatusPill status={getLessonOperation(lesson).editorialStatus} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Alertas administrativos" description="Pendencias que afetam publicacao, leitura obrigatoria e consistencia operacional.">
            <div className="space-y-3">
              {[
                '1 trilha em rascunho com aulas sem descricao completa.',
                '2 aulas exigem confirmacao de ciencia e ainda aguardam revisao juridica.',
                '1 trilha arquivada ainda possui colaboradores com progresso pendente.',
                'Biblioteca com 1 documento em revisao para reutilizacao futura.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Trilhas sob gestao" description="Panorama sintetico das frentes ativas e do contexto operacional.">
            <div className="space-y-4">
              {adminTrails.map((trail) => (
                <button
                  key={trail.id}
                  onClick={() => onOpenTrail(trail.id)}
                  className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:border-accent/40 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{trail.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{trail.modules.length} modulos • {getAllLessons(trail).length} aulas • {trail.totalDuration}</p>
                    </div>
                    <StatusPill status={trail.status} />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Progress value={trail.avgProgress} className="h-1.5 bg-muted [&>[role=progressbar]]:bg-accent" />
                    <span className="w-10 text-right text-xs text-muted-foreground">{trail.avgProgress}%</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Pendencias de leitura e ciencia" description="Itens que precisam de acompanhamento do gestor.">
            <div className="space-y-3">
              {getAcknowledgmentLessons(adminTrails[0]).slice(0, 3).map((lesson) => (
                <div key={lesson.id} className="rounded-xl border border-border/60 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{getLessonOperation(lesson).type} • Confirmacao de ciencia obrigatoria</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </PageMotion>
  );
}

function TrailsSection({
  trails,
  selectedTrail,
  trailContextSection,
  onBackToList,
  onOpenTrail,
  onChangeContextSection,
}: {
  trails: AdminTrail[];
  selectedTrail: AdminTrail | null;
  trailContextSection: TrailContextSection;
  onBackToList: () => void;
  onOpenTrail: (trailId: string, context?: TrailContextSection) => void;
  onChangeContextSection: (section: TrailContextSection) => void;
}) {
  if (!selectedTrail) {
    return (
      <PageMotion>
        <HeaderBlock
          eyebrow="Trilhas"
          title="Gestao centralizada por trilha"
          description="A operacao passa a ser conduzida por contexto, com modulos, aulas e materiais organizados dentro da trilha certa."
          actionLabel="Nova trilha"
        />

        <SearchToolbar placeholder="Buscar trilha, publico-alvo ou status" />

        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Trilha</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Progresso medio</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Estrutura</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Duracao</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {trails.map((trail) => {
                const lessons = getAllLessons(trail);

                return (
                  <tr key={trail.id} className="border-b border-border/40 align-top transition-colors hover:bg-muted/20">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{trail.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{trail.audience} • {trail.sector}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Atualizada em {trail.lastUpdated}</p>
                      </div>
                    </td>
                    <td className="p-4"><StatusPill status={trail.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Progress value={trail.avgProgress} className="h-1.5 w-24 bg-muted [&>[role=progressbar]]:bg-accent" />
                        <span className="text-xs text-muted-foreground">{trail.avgProgress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div>{trail.modules.length} modulos</div>
                      <div>{lessons.length} aulas</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{trail.totalDuration}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenTrail(trail.id)}>Abrir</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Publicar</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Arquivar</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Duplicar</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <button onClick={onBackToList} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista de trilhas
      </button>

      <TrailContextHeader trail={selectedTrail} />

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/70 p-2">
        {trailContextNav.map((item) => (
          <button
            key={item.key}
            onClick={() => onChangeContextSection(item.key)}
            className={`rounded-xl px-3 py-2 text-sm transition-colors ${
              trailContextSection === item.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {trailContextSection === 'overview' && <TrailOverviewSection trail={selectedTrail} />}
      {trailContextSection === 'modules' && <TrailModulesSection trail={selectedTrail} />}
      {trailContextSection === 'lessons' && <TrailLessonsSection trail={selectedTrail} />}
      {trailContextSection === 'materials' && <TrailMaterialsSection trail={selectedTrail} />}
      {trailContextSection === 'publication' && <TrailPublicationSection trail={selectedTrail} />}
      {trailContextSection === 'settings' && <TrailSettingsSection trail={selectedTrail} />}
    </PageMotion>
  );
}

function LibrarySection() {
  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Biblioteca"
        title="Repositorio transversal de midia e documentos"
        description="Acervo geral para reutilizacao entre trilhas, aulas e futuras integracoes com upload em servidor."
        actionLabel="Novo upload"
      />

      <SearchToolbar placeholder="Buscar videos, PDFs, slides e documentos" />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Videos', value: String(libraryAssets.filter((asset) => asset.type === 'video').length) },
          { label: 'Documentos PDF', value: String(libraryAssets.filter((asset) => asset.type === 'pdf').length) },
          { label: 'Itens reutilizaveis', value: String(libraryAssets.filter((asset) => asset.usageCount > 1).length) },
        ].map((stat) => (
          <div key={stat.label} className="card-premium p-5">
            <p className="font-heading text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card-premium mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left font-medium text-muted-foreground">Arquivo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Tamanho</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Ultima atualizacao</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Uso</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {libraryAssets.map((asset) => (
              <tr key={asset.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <MediaIcon type={asset.type} />
                    <span className="font-medium text-foreground">{asset.name}</span>
                  </div>
                </td>
                <td className="p-4 capitalize text-muted-foreground">{asset.type}</td>
                <td className="p-4 text-muted-foreground">{asset.size}</td>
                <td className="p-4 text-muted-foreground">{asset.updatedAt}</td>
                <td className="p-4 text-muted-foreground">{asset.usageCount} vinculos</td>
                <td className="p-4"><LibraryStatusPill status={asset.status} /></td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Visualizar</Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Substituir</Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Arquivar</Button>
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

function UsersSection({ trails }: { trails: AdminTrail[] }) {
  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Usuarios"
        title="Atribuicoes e distribuicao por trilha"
        description="Gestao transversal de usuarios mantendo o vinculo entre colaborador, setor e trilha de capacitacao."
        actionLabel="Adicionar usuario"
      />

      <SearchToolbar placeholder="Buscar colaborador, setor ou trilha" />

      <div className="card-premium overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left font-medium text-muted-foreground">Colaborador</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Setor</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Trilha principal</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Progresso</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {mockCollaborators.map((collaborator, index) => (
              <tr key={collaborator.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-4"><UserCell collaborator={collaborator} /></td>
                <td className="p-4 text-muted-foreground">{collaborator.sector}</td>
                <td className="p-4 text-muted-foreground">{trails[index % trails.length].title}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Progress value={collaborator.trailProgress} className="h-1.5 w-24 bg-muted [&>[role=progressbar]]:bg-accent" />
                    <span className="text-xs text-muted-foreground">{collaborator.trailProgress}%</span>
                  </div>
                </td>
                <td className="p-4"><CollaboratorStatusPill status={collaborator.status} /></td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Detalhes</Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Reatribuir</Button>
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

function ProgressSection({ trails }: { trails: AdminTrail[] }) {
  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Progresso"
        title="Acompanhamento por setor e trilha"
        description="Leitura operacional do progresso real por usuario e por frente de treinamento."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Progresso consolidado das trilhas" description="Media de conclusao por frente editorial.">
          <div className="space-y-4">
            {trails.map((trail) => (
              <div key={trail.id} className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{trail.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{trail.assignedCollaborators} colaboradores atribuidos</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{trail.avgProgress}%</span>
                </div>
                <Progress value={trail.avgProgress} className="mt-3 h-1.5 bg-muted [&>[role=progressbar]]:bg-accent" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Pendencias individuais" description="Usuarios com atencao imediata.">
          <div className="space-y-3">
            {mockCollaborators.filter((collaborator) => collaborator.trailProgress < 60).map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{collaborator.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{collaborator.sector} • {collaborator.completedLessons}/{collaborator.totalLessons} aulas concluidas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{collaborator.trailProgress}%</p>
                  <p className="text-xs text-muted-foreground">Status {normalizeCollaboratorStatus(collaborator.status)}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageMotion>
  );
}

function ReportsSection({ trails }: { trails: AdminTrail[] }) {
  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Relatorios"
        title="Saidas analiticas para acompanhamento"
        description="Relatorios orientados a operacao, publicacao e engajamento institucional."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: 'Conclusao por setor', description: 'Comparativo entre Juridico, Administrativo, Trabalhista e Tributario.' },
          { title: 'Tempo medio por aula', description: 'Visao de eficiencia de consumo de conteudo por trilha.' },
          { title: 'Aulas com mais pendencias', description: 'Mapa de gargalos editoriais e de ciencia obrigatoria.' },
          { title: 'Trilhas por status editorial', description: `${trails.filter((trail) => trail.status === 'published').length} publicadas, ${trails.filter((trail) => trail.status === 'draft').length} em rascunho e ${trails.filter((trail) => trail.status === 'archived').length} arquivadas.` },
        ].map((report) => (
          <div key={report.title} className="card-premium flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-medium text-foreground">{report.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Exportar</Button>
          </div>
        ))}
      </div>
    </PageMotion>
  );
}

function SettingsSection() {
  return (
    <PageMotion>
      <HeaderBlock
        eyebrow="Configuracoes"
        title="Parametros globais da operacao"
        description="Controles transversais para notificacoes, armazenamento local, governanca editorial e regras de conclusao."
      />

      <div className="space-y-4">
        {[
          { title: 'Prazo padrao de conclusao', description: '15 dias uteis para trilhas obrigatorias de onboarding.' },
          { title: 'Lembretes automaticos', description: 'Disparo a cada 3 dias para pendencias de leitura, ciencia e progresso.' },
          { title: 'Armazenamento local', description: 'Repositorio preparado para upload de videos, documentos e thumbnails em servidor interno.' },
          { title: 'Governanca editorial', description: 'Fluxo de rascunho, revisao, publicacao e arquivamento por trilha.' },
        ].map((setting) => (
          <div key={setting.title} className="card-premium flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium text-foreground">{setting.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{setting.description}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Editar</Button>
          </div>
        ))}
      </div>
    </PageMotion>
  );
}

function TrailContextHeader({ trail }: { trail: AdminTrail }) {
  const lessons = getAllLessons(trail);

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
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo conteudo
          </Button>
          <Button variant="outline" size="sm" className="text-xs">Duplicar</Button>
          <Button variant="outline" size="sm" className="text-xs">
            <MoreHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Acoes
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <ContextStatCard label="Total de modulos" value={String(trail.modules.length)} />
        <ContextStatCard label="Total de aulas" value={String(lessons.length)} />
        <ContextStatCard label="Duracao total" value={trail.totalDuration} />
      </div>
    </div>
  );
}

function TrailOverviewSection({ trail }: { trail: AdminTrail }) {
  const lessons = getAllLessons(trail);
  const primaryMaterials = getTrailMaterials(trail).slice(0, 4);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Estrutura da trilha" description="Visao de como modulos, aulas e materiais se relacionam dentro do contexto atual.">
        <div className="space-y-4">
          {trail.modules.map((module, index) => (
            <div key={module.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{String(index + 1).padStart(2, '0')} • {module.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{module.lessons.length} aulas vinculadas</p>
                </div>
                <span className="text-xs text-muted-foreground">{module.lessons.reduce((total, lesson) => total + lesson.materials.length, 0)} materiais</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {module.lessons.map((lesson) => (
                  <span key={lesson.id} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {lesson.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Sinais de consumo" description="Leituras objetivas para priorizacao administrativa.">
        <div className="space-y-4">
          <InfoCard title="Aulas com video" description={`${lessons.filter((lesson) => lesson.hasVideo).length} itens com video principal.`} />
          <InfoCard title="Aulas sem video" description={`${lessons.filter((lesson) => !lesson.hasVideo).length} itens tratados como leitura, comunicado ou ciencia.`} />
          <InfoCard title="Materiais vinculados" description={`${lessons.reduce((total, lesson) => total + lesson.materials.length, 0)} arquivos ligados a esta trilha.`} />
        </div>
      </Panel>

      <Panel title="Materiais principais" description="Arquivos mais relevantes no contexto atual da trilha.">
        <div className="space-y-3">
          {primaryMaterials.map((item) => (
            <div key={`${item.lessonId}-${item.material.id}`} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.material.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.lesson.title}</p>
              </div>
              <span className="text-xs capitalize text-muted-foreground">{item.material.type}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TrailModulesSection({ trail }: { trail: AdminTrail }) {
  return (
    <div className="space-y-6">
      <Panel
        title="Modulos desta trilha"
        description="Ordene, edite e organize os modulos mantendo contexto explicito da trilha atual."
        action={
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Criar modulo
          </Button>
        }
      >
        <div className="space-y-3">
          {trail.modules.map((module, index) => (
            <div key={module.id} className="flex flex-col gap-4 rounded-2xl border border-border/60 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{module.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <MetaToken label="Trilha" value={trail.title} />
                    <MetaToken label="Aulas" value={String(module.lessons.length)} />
                    <MetaToken label="Obrigatorio" value={index < 2 ? 'Sim' : 'Opcional'} />
                    <MetaToken label="Ordem de exibicao" value={String(index + 1)} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs"><ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />Ordenar</Button>
                <Button variant="ghost" size="sm" className="text-xs"><Pencil className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
                <Button variant="ghost" size="sm" className="text-xs">Remover</Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TrailLessonsSection({ trail }: { trail: AdminTrail }) {
  return (
    <div className="space-y-6">
      <Panel
        title="Aulas organizadas por modulo"
        description="Cada aula permanece vinculada ao modulo e a trilha atual, sem perda de contexto operacional."
        action={
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova aula
          </Button>
        }
      >
        <div className="space-y-5">
          {trail.modules.map((module, moduleIndex) => (
            <div key={module.id} className="rounded-2xl border border-border/60">
              <div className="border-b border-border/60 bg-muted/20 px-5 py-4">
                <p className="text-sm font-medium text-foreground">{String(moduleIndex + 1).padStart(2, '0')} • {module.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{module.lessons.length} aulas no contexto desta trilha</p>
              </div>
              <div className="divide-y divide-border/50">
                {module.lessons.map((lesson, lessonIndex) => {
                  const operation = getLessonOperation(lesson);

                  return (
                    <div key={lesson.id} className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">{moduleIndex + 1}.{lessonIndex + 1}</span>
                          <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                          <StatusPill status={operation.editorialStatus} />
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{lesson.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <MetaToken label="Tipo" value={operation.type} />
                          <MetaToken label="Obrigatoria" value={operation.mandatory ? 'Sim' : 'Nao'} />
                          <MetaToken label="Video" value={lesson.hasVideo ? 'Sim' : 'Nao'} />
                          <MetaToken label="Ciencia" value={operation.requiresAcknowledgment ? 'Obrigatoria' : 'Nao se aplica'} />
                          <MetaToken label="Materiais" value={String(lesson.materials.length)} />
                          <MetaToken label="Duracao" value={lesson.duration} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-xs">Associar material</Button>
                        <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                        <Button variant="ghost" size="sm" className="text-xs">Ordenar</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TrailMaterialsSection({ trail }: { trail: AdminTrail }) {
  const materials = getTrailMaterials(trail);

  return (
    <div className="space-y-6">
      <Panel
        title="Materiais vinculados a esta trilha"
        description="Arquivos ligados ao contexto especifico da trilha ou de suas aulas, sem confundir com a Biblioteca transversal."
        action={
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90">
            <Upload className="mr-1.5 h-4 w-4" />
            Vincular material
          </Button>
        }
      >
        <div className="card-premium overflow-hidden shadow-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Arquivo</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Tamanho</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Data</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Aula vinculada</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item) => (
                <tr key={`${item.lessonId}-${item.material.id}`} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <MediaIcon type={normalizeMaterialIcon(item.material.type)} />
                      <span className="font-medium text-foreground">{item.material.title}</span>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-muted-foreground">{item.material.type}</td>
                  <td className="p-4 text-muted-foreground">{item.material.size ?? 'Nao informado'}</td>
                  <td className="p-4 text-muted-foreground">{item.lesson.updatedAt}</td>
                  <td className="p-4"><StatusPill status={getLessonOperation(item.lesson).editorialStatus} /></td>
                  <td className="p-4 text-muted-foreground">{item.lesson.title}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Visualizar</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Substituir</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Remover</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Desvincular</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function TrailPublicationSection({ trail }: { trail: AdminTrail }) {
  const issues = getPublicationIssues(trail);
  const canPublish = issues.length === 0;
  const statusDescription = {
    published: 'A trilha esta publicada e disponivel para uso no portal interno.',
    draft: 'A trilha esta em rascunho e ainda nao foi disponibilizada aos colaboradores.',
    archived: 'A trilha foi arquivada e permanece fora da operacao ativa.',
  }[trail.status];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Status da trilha" description="Publicacao tratada de forma objetiva, com foco no estado atual e nas acoes disponiveis.">
        <div className="space-y-4">
          <InfoCard title="Status atual" description={normalizeTrailStatus(trail.status)} />
          <InfoCard title="Situacao" description={statusDescription} />
          {!canPublish ? <InfoCard title="Pendencias criticas" description={`${issues.length} validacoes impedem a publicacao no estado atual.`} /> : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90" disabled={!canPublish}>Publicar trilha</Button>
          <Button variant="outline" size="sm" className="text-xs">Salvar como rascunho</Button>
          <Button variant="outline" size="sm" className="text-xs">Arquivar</Button>
        </div>
      </Panel>

      <Panel title="Validacoes de publicacao" description={canPublish ? 'A trilha atende aos requisitos minimos para publicacao.' : 'Ajuste apenas os pontos criticos abaixo para liberar a publicacao.'}>
        {canPublish ? (
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
            Nenhuma pendencia critica encontrada. A trilha pode ser publicada quando necessario.
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue} className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                {issue}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function TrailSettingsSection({ trail }: { trail: AdminTrail }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Dados principais" description="Parametros base da trilha para futura integracao com CRUD real.">
        <SettingsGrid
          items={[
            ['Nome', trail.title],
            ['Descricao', trail.description],
            ['Publico-alvo', trail.audience],
            ['Setor', trail.sector],
            ['Obrigatoriedade', trail.mandatory ? 'Obrigatoria' : 'Opcional'],
            ['Ordem', String(trail.order)],
          ]}
        />
      </Panel>

      <Panel title="Conclusao e ciencia" description="Regras de termino, duracao e validacoes institucionais.">
        <SettingsGrid
          items={[
            ['Capa', trail.coverName],
            ['Duracao estimada', trail.totalDuration],
            ['Regras de conclusao', trail.completionRule],
            ['Exigencia de ciencia', trail.requiresAcknowledgment ? 'Ativa' : 'Inativa'],
            ['Status editorial', normalizeTrailStatus(trail.status)],
            ['Ultima atualizacao', trail.lastUpdated],
          ]}
        />
      </Panel>
    </div>
  );
}

function HeaderBlock({ eyebrow, title, description, actionLabel }: { eyebrow: string; title: string; description: string; actionLabel?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actionLabel ? (
        <Button className="bg-accent text-sm font-medium text-white hover:bg-accent/90">
          <Plus className="mr-1.5 h-4 w-4" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function SearchToolbar({ placeholder }: { placeholder: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={placeholder}
          className="w-72 rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <Button variant="outline" size="sm" className="text-xs">
        <Filter className="mr-1.5 h-3.5 w-3.5" />
        Filtros
      </Button>
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

function SettingsGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="max-w-[60%] text-right text-sm font-medium text-foreground">{value}</span>
        </div>
      ))}
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

function UserCell({ collaborator }: { collaborator: Collaborator }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
        <span className="text-xs font-medium text-primary-foreground">
          {collaborator.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </span>
      </div>
      <div>
        <p className="font-medium text-foreground">{collaborator.name}</p>
        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: TrailStatus | 'publicada' | 'rascunho' | 'revisao' }) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    publicada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    rascunho: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200',
    revisao: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {normalizePillLabel(status)}
    </span>
  );
}

function CollaboratorStatusPill({ status }: { status: Collaborator['status'] }) {
  const styles: Record<Collaborator['status'], string> = {
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {normalizeCollaboratorStatus(status)}
    </span>
  );
}

function LibraryStatusPill({ status }: { status: LibraryAsset['status'] }) {
  const styles: Record<LibraryAsset['status'], string> = {
    ativo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'em revisao': 'bg-amber-50 text-amber-700 border-amber-200',
    arquivado: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function MediaIcon({ type }: { type: LibraryAssetType | 'pdf' | 'slides' | 'checklist' | 'manual' | 'term' | 'transcript' | 'notice' | 'image' }) {
  const className = 'h-4 w-4 text-muted-foreground';
  if (type === 'video') return <Video className={className} />;
  if (type === 'thumbnail' || type === 'image') return <Image className={className} />;
  return <File className={className} />;
}

function getLessonOperation(lesson: Lesson) {
  return lessonOperations[lesson.id] ?? {
    type: lesson.hasVideo ? 'video' : 'leitura obrigatoria',
    mandatory: true,
    editorialStatus: 'publicada',
    requiresAcknowledgment: false,
  };
}

function getTrailMaterials(trail: AdminTrail) {
  return trail.modules.flatMap((module) =>
    module.lessons.flatMap((lesson) =>
      lesson.materials.map((material) => ({
        lessonId: lesson.id,
        lesson,
        material,
      })),
    ),
  );
}

function getAcknowledgmentLessons(trail: AdminTrail) {
  return getAllLessons(trail).filter((lesson) => getLessonOperation(lesson).requiresAcknowledgment);
}

function getRecentLessons(trail: AdminTrail) {
  return trail.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      moduleTitle: module.title,
      lesson,
    })),
  );
}

function getPublicationChecklist(trail: AdminTrail) {
  const lessons = getAllLessons(trail);
  const lessonsWithoutMaterial = lessons.filter((lesson) => lesson.materials.length === 0).length;
  const lessonsWithoutDescription = lessons.filter((lesson) => !lesson.description?.trim()).length;

  return [
    { label: 'Sem modulos', value: trail.modules.length === 0 ? 'Sim' : 'Nao', ok: trail.modules.length > 0 },
    { label: 'Sem aulas', value: lessons.length === 0 ? 'Sim' : 'Nao', ok: lessons.length > 0 },
    { label: 'Aula sem material', value: lessonsWithoutMaterial === 0 ? 'Nenhuma' : String(lessonsWithoutMaterial), ok: lessonsWithoutMaterial === 0 },
    { label: 'Conteudo sem descricao', value: lessonsWithoutDescription === 0 ? 'Nenhum' : String(lessonsWithoutDescription), ok: lessonsWithoutDescription === 0 },
    { label: 'Item sem ordem definida', value: 'Nenhum', ok: true },
  ];
}

function getPublicationIssues(trail: AdminTrail) {
  const lessons = getAllLessons(trail);
  const issues: string[] = [];

  if (trail.modules.length === 0) {
    issues.push('Adicione pelo menos um modulo antes de publicar.');
  }

  if (lessons.length === 0) {
    issues.push('Adicione pelo menos uma aula antes de publicar.');
  }

  if (!trail.description.trim()) {
    issues.push('Preencha a descricao principal da trilha.');
  }

  const lessonsWithoutDescription = lessons.filter((lesson) => !lesson.description?.trim()).length;
  if (lessonsWithoutDescription > 0) {
    issues.push(`${lessonsWithoutDescription} aula(s) sem descricao obrigatoria.`);
  }

  const lessonsWithoutRequiredMaterial = lessons.filter((lesson) => {
    const operation = getLessonOperation(lesson);
    const requiresMaterial = operation.type !== 'video' || !lesson.hasVideo;
    return requiresMaterial && lesson.materials.length === 0;
  }).length;

  if (lessonsWithoutRequiredMaterial > 0) {
    issues.push(`${lessonsWithoutRequiredMaterial} aula(s) exigem material vinculado para publicacao.`);
  }

  return issues;
}

function normalizeTrailStatus(status: TrailStatus) {
  return { published: 'Publicada', draft: 'Rascunho', archived: 'Arquivada' }[status];
}

function normalizeCollaboratorStatus(status: Collaborator['status']) {
  return { active: 'em andamento', completed: 'concluido', paused: 'pausado' }[status];
}

function normalizePillLabel(status: TrailStatus | 'publicada' | 'rascunho' | 'revisao') {
  return {
    published: 'Publicada',
    draft: 'Rascunho',
    archived: 'Arquivada',
    publicada: 'Publicada',
    rascunho: 'Rascunho',
    revisao: 'Em revisao',
  }[status];
}

function normalizeMaterialIcon(type: Material['type']): LibraryAssetType | 'pdf' {
  if (type === 'slides') return 'slides';
  return type === 'pdf' ? 'pdf' : 'documento';
}
