import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockCollaborators, mockTrail, type Collaborator } from '@/data/mockData';

export type TrailStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'video' | 'leitura obrigatoria' | 'comunicado' | 'procedimento interno' | 'termo de ciencia';
export type LibraryItemType = 'video' | 'pdf' | 'slide' | 'documento auxiliar' | 'thumbnail';
export type LibraryItemStatus = 'ativo' | 'em revisao' | 'arquivado';
export type LessonContentStatus = 'draft' | 'ready';

export interface LinkedMaterial {
  id: string;
  libraryItemId?: string;
  name: string;
  type: LibraryItemType;
  mimeType?: string;
  size: string;
  date: string;
  status: LibraryItemStatus;
  note: string;
  fileUrl?: string;
}

export interface LessonEntity {
  id: string;
  title: string;
  description: string;
  objective: string;
  duration: string;
  sector: string;
  updatedAt: string;
  type: LessonType;
  mandatory: boolean;
  requiresAcknowledgment: boolean;
  hasVideo: boolean;
  videoUrl?: string;
  videoName?: string;
  contentStatus: LessonContentStatus;
  order: number;
  materials: LinkedMaterial[];
  transcript?: string;
  summary?: string;
  checklist?: string[];
  faq?: { question: string; answer: string }[];
  notices?: { date: string; author: string; content: string }[];
}

export interface ModuleEntity {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
  lessons: LessonEntity[];
}

export interface TrailEntity {
  id: string;
  title: string;
  description: string;
  audience: string;
  sector: string;
  status: TrailStatus;
  estimatedDuration: string;
  coverName?: string;
  coverUrl?: string;
  mandatory: boolean;
  lastUpdated: string;
  modules: ModuleEntity[];
}

export interface LibraryItem {
  id: string;
  name: string;
  type: LibraryItemType;
  size: string;
  updatedAt: string;
  status: LibraryItemStatus;
  note: string;
  fileUrl?: string;
  mimeType?: string;
}

export interface LessonProgress {
  completed: boolean;
  acknowledged: boolean;
}

export interface AppStateData {
  trails: TrailEntity[];
  library: LibraryItem[];
  collaborators: Collaborator[];
  currentCollaboratorId: string;
  activeCollaboratorTrailId: string | null;
  isAuthenticated: boolean;
  lessonProgress: Record<string, Record<string, LessonProgress>>;
}

interface AppStateContextValue extends AppStateData {
  login: (email: string) => void;
  logout: () => void;
  createTrail: (input: TrailFormInput) => void;
  updateTrail: (trailId: string, input: TrailFormInput) => void;
  deleteTrail: (trailId: string) => void;
  duplicateTrail: (trailId: string) => void;
  archiveTrail: (trailId: string) => void;
  saveTrailDraft: (trailId: string) => void;
  publishTrail: (trailId: string) => { ok: boolean; issues: string[] };
  addModule: (trailId: string, input: ModuleFormInput) => void;
  updateModule: (trailId: string, moduleId: string, input: ModuleFormInput) => void;
  deleteModule: (trailId: string, moduleId: string) => void;
  moveModule: (trailId: string, moduleId: string, direction: 'up' | 'down') => void;
  addLesson: (trailId: string, moduleId: string, input: LessonFormInput) => void;
  updateLesson: (trailId: string, moduleId: string, lessonId: string, input: LessonFormInput) => void;
  deleteLesson: (trailId: string, moduleId: string, lessonId: string) => void;
  moveLesson: (trailId: string, moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
  addLessonMaterial: (trailId: string, moduleId: string, lessonId: string, input: MaterialFormInput) => void;
  updateLessonMaterial: (trailId: string, moduleId: string, lessonId: string, materialId: string, input: MaterialFormInput) => void;
  removeLessonMaterial: (trailId: string, moduleId: string, lessonId: string, materialId: string) => void;
  addLibraryItem: (input: LibraryItemFormInput) => LibraryItem;
  updateLibraryItem: (itemId: string, input: LibraryItemFormInput) => void;
  deleteLibraryItem: (itemId: string) => void;
  attachLibraryItemToLesson: (trailId: string, moduleId: string, lessonId: string, libraryItemId: string) => void;
  completeLesson: (trailId: string, lessonId: string) => void;
  acknowledgeLesson: (trailId: string, lessonId: string) => void;
  setActiveCollaboratorTrail: (trailId: string) => void;
  resetMockData: () => void;
}

export interface TrailFormInput {
  title: string;
  description: string;
  audience: string;
  sector: string;
  status: TrailStatus;
  estimatedDuration: string;
  coverName?: string;
  coverUrl?: string;
  mandatory: boolean;
}

export interface ModuleFormInput {
  title: string;
  description: string;
  required: boolean;
}

export interface LessonFormInput {
  title: string;
  description: string;
  objective: string;
  duration: string;
  sector: string;
  type: LessonType;
  mandatory: boolean;
  requiresAcknowledgment: boolean;
  hasVideo: boolean;
  videoUrl?: string;
  videoName?: string;
  contentStatus: LessonContentStatus;
}

export interface MaterialFormInput {
  name: string;
  type: LibraryItemType;
  size: string;
  status: LibraryItemStatus;
  note: string;
  libraryItemId?: string;
  fileUrl?: string;
  mimeType?: string;
}

export interface LibraryItemFormInput {
  name: string;
  type: LibraryItemType;
  size: string;
  status: LibraryItemStatus;
  note: string;
  fileUrl?: string;
  mimeType?: string;
}

const STORAGE_KEY = 'abr-training-app-state-v1';

const AppStateContext = createContext<AppStateContextValue | null>(null);

const TODAY = '24/03/2026';

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function materialTypeFromLegacy(type: string): LibraryItemType {
  if (type === 'slides') return 'slide';
  if (type === 'manual' || type === 'checklist' || type === 'term' || type === 'notice' || type === 'transcript') return 'documento auxiliar';
  return type === 'pdf' ? 'pdf' : 'documento auxiliar';
}

function lessonTypeFromLegacy(title: string, hasVideo: boolean): LessonType {
  if (title.toLowerCase().includes('comunic')) return 'comunicado';
  if (title.toLowerCase().includes('termo') || title.toLowerCase().includes('sigilo')) return 'termo de ciencia';
  if (!hasVideo) return 'leitura obrigatoria';
  if (title.toLowerCase().includes('procedimento') || title.toLowerCase().includes('sistema')) return 'procedimento interno';
  return 'video';
}

function buildInitialTrails(): TrailEntity[] {
  const baseModules: ModuleEntity[] = mockTrail.modules.map((module, moduleIndex) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    required: moduleIndex < 2,
    order: moduleIndex + 1,
    lessons: module.lessons.map((lesson, lessonIndex) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      objective: lesson.objective,
      duration: lesson.duration,
      sector: lesson.sector,
      updatedAt: lesson.updatedAt,
      type: lessonTypeFromLegacy(lesson.title, lesson.hasVideo),
      mandatory: lesson.status !== 'pending',
      requiresAcknowledgment: lesson.title.toLowerCase().includes('cultura') || lesson.title.toLowerCase().includes('sigilo') || !lesson.hasVideo,
      hasVideo: lesson.hasVideo,
      videoUrl: lesson.videoUrl,
      videoName: lesson.hasVideo ? `${lesson.title}.mp4` : undefined,
      contentStatus: lesson.status === 'pending' ? 'draft' : 'ready',
      order: lessonIndex + 1,
      materials: lesson.materials.map((material) => ({
        id: material.id,
        name: material.title,
        type: materialTypeFromLegacy(material.type),
        size: material.size || 'Nao informado',
        date: lesson.updatedAt,
        status: 'ativo',
        note: '',
      })),
      transcript: lesson.transcript,
      summary: lesson.summary,
      checklist: lesson.checklist,
      faq: lesson.faq,
      notices: lesson.notices,
    })),
  }));

  return [
    {
      id: 'trail-1',
      title: 'Onboarding Institucional ABR Advogados',
      description: 'Trilha principal de integracao institucional para novos colaboradores do escritorio.',
      audience: 'Novos colaboradores',
      sector: 'Todos os setores',
      status: 'published',
      estimatedDuration: mockTrail.totalDuration,
      coverName: 'capa-onboarding-abr.jpg',
      coverUrl: '',
      mandatory: true,
      lastUpdated: TODAY,
      modules: baseModules,
    },
    {
      id: 'trail-2',
      title: 'Compliance e Sigilo Profissional',
      description: 'Trilha interna para leitura de politicas, termos e diretrizes institucionais.',
      audience: 'Juridico e Administrativo',
      sector: 'Juridico / Administrativo',
      status: 'draft',
      estimatedDuration: '3h 40min',
      coverName: 'capa-compliance.jpg',
      coverUrl: '',
      mandatory: true,
      lastUpdated: TODAY,
      modules: deepClone(baseModules.slice(0, 2)).map((module, index) => ({
        ...module,
        id: createId(`module-copy-${index}`),
        order: index + 1,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          id: createId(`lesson-copy-${lessonIndex}`),
          order: lessonIndex + 1,
          contentStatus: lessonIndex === 0 ? 'ready' : 'draft',
        })),
      })),
    },
  ];
}

function buildInitialLibrary(trails: TrailEntity[]): LibraryItem[] {
  const items: LibraryItem[] = [];
  trails.forEach((trail) => {
    trail.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lesson.materials.forEach((material) => {
          if (!items.some((item) => item.name === material.name)) {
            items.push({
              id: createId('library'),
              name: material.name,
              type: material.type,
              size: material.size,
              updatedAt: material.date,
              status: material.status,
              note: material.note,
              fileUrl: material.fileUrl,
              mimeType: material.mimeType,
            });
          }
        });
      });
    });
  });

  items.push({
    id: createId('library'),
    name: 'thumbnail-trilha-onboarding.jpg',
    type: 'thumbnail',
    size: '320 KB',
    updatedAt: TODAY,
    status: 'ativo',
    note: 'Capa institucional da trilha',
  });

  return items;
}

function buildInitialProgress(trails: TrailEntity[]): Record<string, Record<string, LessonProgress>> {
  const initialProgress: Record<string, Record<string, LessonProgress>> = {};

  mockCollaborators.forEach((collaborator) => {
    initialProgress[collaborator.id] = {};
  });

  const primaryTrail = trails[0];
  primaryTrail.modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      const absoluteIndex = moduleIndex * 10 + lessonIndex;
      initialProgress.c2[lesson.id] = {
        completed: absoluteIndex < 2,
        acknowledged: absoluteIndex < 2,
      };
      initialProgress.c1[lesson.id] = {
        completed: absoluteIndex < 6,
        acknowledged: absoluteIndex < 6,
      };
      initialProgress.c3[lesson.id] = { completed: true, acknowledged: true };
      initialProgress.c4[lesson.id] = { completed: absoluteIndex < 1, acknowledged: absoluteIndex < 1 };
      initialProgress.c5[lesson.id] = { completed: absoluteIndex < 4, acknowledged: absoluteIndex < 4 };
    });
  });

  return initialProgress;
}

function buildInitialState(): AppStateData {
  const trails = buildInitialTrails();
  return {
    trails,
    library: buildInitialLibrary(trails),
    collaborators: mockCollaborators,
    currentCollaboratorId: 'c2',
    activeCollaboratorTrailId: trails.find((trail) => trail.status === 'published')?.id ?? null,
    isAuthenticated: false,
    lessonProgress: buildInitialProgress(trails),
  };
}

function loadState(): AppStateData {
  if (typeof window === 'undefined') return buildInitialState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return buildInitialState();
  try {
    return JSON.parse(raw) as AppStateData;
  } catch {
    return buildInitialState();
  }
}

function updateTrailList(trails: TrailEntity[], trailId: string, updater: (trail: TrailEntity) => TrailEntity) {
  return trails.map((trail) => (trail.id === trailId ? updater(trail) : trail));
}

function recalcOrder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppStateData>(() => loadState());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AppStateContextValue>(() => ({
    ...state,
    login: (email) => {
      const collaborator = state.collaborators.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? state.collaborators[1];
      setState((current) => ({ ...current, isAuthenticated: true, currentCollaboratorId: collaborator.id, activeCollaboratorTrailId: getPublishedTrails(current.trails)[0]?.id ?? null }));
    },
    logout: () => setState((current) => ({ ...current, isAuthenticated: false })),
    createTrail: (input) => setState((current) => ({
      ...current,
      trails: [
        {
          id: createId('trail'),
          title: input.title,
          description: input.description,
          audience: input.audience,
          sector: input.sector,
          status: input.status,
          estimatedDuration: input.estimatedDuration,
          coverName: input.coverName,
          coverUrl: input.coverUrl,
          mandatory: input.mandatory,
          lastUpdated: TODAY,
          modules: [],
        },
        ...current.trails,
      ],
    })),
    updateTrail: (trailId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({ ...trail, ...input, lastUpdated: TODAY })),
    })),
    deleteTrail: (trailId) => setState((current) => {
      const trails = current.trails.filter((trail) => trail.id !== trailId);
      const nextPublished = getPublishedTrails(trails);
      return {
        ...current,
        trails,
        activeCollaboratorTrailId: current.activeCollaboratorTrailId === trailId ? (nextPublished[0]?.id ?? null) : current.activeCollaboratorTrailId,
      };
    }),
    duplicateTrail: (trailId) => setState((current) => {
      const source = current.trails.find((trail) => trail.id === trailId);
      if (!source) return current;
      const duplicated = deepClone(source);
      duplicated.id = createId('trail');
      duplicated.title = `${source.title} - Copia`;
      duplicated.status = 'draft';
      duplicated.lastUpdated = TODAY;
      duplicated.coverUrl = source.coverUrl;
      duplicated.modules = duplicated.modules.map((module, moduleIndex) => ({
        ...module,
        id: createId(`module-${moduleIndex}`),
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          id: createId(`lesson-${lessonIndex}`),
          materials: lesson.materials.map((material) => ({ ...material, id: createId('mat') })),
        })),
      }));
      return { ...current, trails: [duplicated, ...current.trails] };
    }),
    archiveTrail: (trailId) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({ ...trail, status: 'archived', lastUpdated: TODAY })),
    })),
    saveTrailDraft: (trailId) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({ ...trail, status: 'draft', lastUpdated: TODAY })),
    })),
    publishTrail: (trailId) => {
      const trail = state.trails.find((item) => item.id === trailId);
      const issues = trail ? getPublicationIssues(trail) : ['Trilha nao encontrada.'];
      if (issues.length === 0) {
        setState((current) => ({
          ...current,
          trails: updateTrailList(current.trails, trailId, (item) => ({ ...item, status: 'published', lastUpdated: TODAY })),
          activeCollaboratorTrailId: current.activeCollaboratorTrailId ?? trailId,
        }));
      }
      return { ok: issues.length === 0, issues };
    },
    addModule: (trailId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: [...trail.modules, { id: createId('module'), title: input.title, description: input.description, required: input.required, order: trail.modules.length + 1, lessons: [] }],
      })),
    })),
    updateModule: (trailId, moduleId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => (module.id === moduleId ? { ...module, ...input } : module)),
      })),
    })),
    deleteModule: (trailId, moduleId) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: recalcOrder(trail.modules.filter((module) => module.id !== moduleId)),
      })),
    })),
    moveModule: (trailId, moduleId, direction) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => {
        const modules = [...trail.modules];
        const index = modules.findIndex((module) => module.id === moduleId);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (index < 0 || targetIndex < 0 || targetIndex >= modules.length) return trail;
        [modules[index], modules[targetIndex]] = [modules[targetIndex], modules[index]];
        return { ...trail, lastUpdated: TODAY, modules: recalcOrder(modules) };
      }),
    })),
    addLesson: (trailId, moduleId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? {
          ...module,
          lessons: [
            ...module.lessons,
            {
              id: createId('lesson'),
              title: input.title,
              description: input.description,
              objective: input.objective,
              duration: input.duration,
              sector: input.sector,
              updatedAt: TODAY,
              type: input.type,
              mandatory: input.mandatory,
              requiresAcknowledgment: input.requiresAcknowledgment,
              hasVideo: input.hasVideo,
              videoUrl: input.videoUrl,
              videoName: input.videoName,
              contentStatus: input.contentStatus,
              order: module.lessons.length + 1,
              materials: [],
              summary: '',
              transcript: '',
              checklist: [],
              faq: [],
              notices: [],
            },
          ],
        } : module),
      })),
    })),
    updateLesson: (trailId, moduleId, lessonId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? {
          ...module,
          lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, ...input, updatedAt: TODAY } : lesson),
        } : module),
      })),
    })),
    deleteLesson: (trailId, moduleId, lessonId) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? { ...module, lessons: recalcOrder(module.lessons.filter((lesson) => lesson.id !== lessonId)) } : module),
      })),
    })),
    moveLesson: (trailId, moduleId, lessonId, direction) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => {
          if (module.id !== moduleId) return module;
          const lessons = [...module.lessons];
          const index = lessons.findIndex((lesson) => lesson.id === lessonId);
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (index < 0 || targetIndex < 0 || targetIndex >= lessons.length) return module;
          [lessons[index], lessons[targetIndex]] = [lessons[targetIndex], lessons[index]];
          return { ...module, lessons: recalcOrder(lessons) };
        }),
      })),
    })),
    addLessonMaterial: (trailId, moduleId, lessonId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? {
          ...module,
          lessons: module.lessons.map((lesson) => lesson.id === lessonId ? {
            ...lesson,
            updatedAt: TODAY,
            materials: [...lesson.materials, { id: createId('material'), date: TODAY, ...input }],
          } : lesson),
        } : module),
      })),
    })),
    updateLessonMaterial: (trailId, moduleId, lessonId, materialId, input) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? {
          ...module,
          lessons: module.lessons.map((lesson) => lesson.id === lessonId ? {
            ...lesson,
            materials: lesson.materials.map((material) => material.id === materialId ? { ...material, ...input, date: TODAY } : material),
          } : lesson),
        } : module),
      })),
    })),
    removeLessonMaterial: (trailId, moduleId, lessonId, materialId) => setState((current) => ({
      ...current,
      trails: updateTrailList(current.trails, trailId, (trail) => ({
        ...trail,
        lastUpdated: TODAY,
        modules: trail.modules.map((module) => module.id === moduleId ? {
          ...module,
          lessons: module.lessons.map((lesson) => lesson.id === lessonId ? {
            ...lesson,
            materials: lesson.materials.filter((material) => material.id !== materialId),
          } : lesson),
        } : module),
      })),
    })),
    addLibraryItem: (input) => {
      const item: LibraryItem = { id: createId('library'), updatedAt: TODAY, ...input };
      setState((current) => ({ ...current, library: [item, ...current.library] }));
      return item;
    },
    updateLibraryItem: (itemId, input) => setState((current) => ({
      ...current,
      library: current.library.map((item) => item.id === itemId ? { ...item, ...input, updatedAt: TODAY } : item),
    })),
    deleteLibraryItem: (itemId) => setState((current) => ({
      ...current,
      library: current.library.filter((item) => item.id !== itemId),
      trails: current.trails.map((trail) => ({
        ...trail,
        modules: trail.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            materials: lesson.materials.filter((material) => material.libraryItemId !== itemId),
          })),
        })),
      })),
    })),
    attachLibraryItemToLesson: (trailId, moduleId, lessonId, libraryItemId) => {
      const libraryItem = state.library.find((item) => item.id === libraryItemId);
      if (!libraryItem) return;
      setState((current) => ({
        ...current,
        trails: updateTrailList(current.trails, trailId, (trail) => ({
          ...trail,
          lastUpdated: TODAY,
          modules: trail.modules.map((module) => module.id === moduleId ? {
            ...module,
            lessons: module.lessons.map((lesson) => lesson.id === lessonId ? {
              ...lesson,
              materials: [...lesson.materials, { id: createId('material'), libraryItemId, name: libraryItem.name, type: libraryItem.type, size: libraryItem.size, date: TODAY, status: libraryItem.status, note: libraryItem.note }],
            } : lesson),
          } : module),
        })),
      }));
    },
    completeLesson: (trailId, lessonId) => setState((current) => {
      const trail = current.trails.find((item) => item.id === trailId);
      const lesson = trail ? getLessonById(trail, lessonId) : null;
      if (!lesson) return current;
      const currentProgress = current.lessonProgress[current.currentCollaboratorId]?.[lessonId] ?? { completed: false, acknowledged: false };
      if (lesson.requiresAcknowledgment && !currentProgress.acknowledged) return current;
      return {
        ...current,
        lessonProgress: {
          ...current.lessonProgress,
          [current.currentCollaboratorId]: {
            ...current.lessonProgress[current.currentCollaboratorId],
            [lessonId]: { ...currentProgress, completed: true },
          },
        },
      };
    }),
    acknowledgeLesson: (trailId, lessonId) => {
      const trail = state.trails.find((item) => item.id === trailId);
      if (!trail || !getLessonById(trail, lessonId)) return;
      setState((current) => ({
        ...current,
        lessonProgress: {
          ...current.lessonProgress,
          [current.currentCollaboratorId]: {
            ...current.lessonProgress[current.currentCollaboratorId],
            [lessonId]: {
              ...(current.lessonProgress[current.currentCollaboratorId]?.[lessonId] ?? { completed: false, acknowledged: false }),
              acknowledged: true,
            },
          },
        },
      }));
    },
    setActiveCollaboratorTrail: (trailId) => setState((current) => ({ ...current, activeCollaboratorTrailId: trailId })),
    resetMockData: () => setState(buildInitialState()),
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}

export function getAllLessons(trail: TrailEntity) {
  return trail.modules.flatMap((module) => module.lessons);
}

export function getLessonById(trail: TrailEntity, lessonId: string) {
  return getAllLessons(trail).find((lesson) => lesson.id === lessonId) ?? null;
}

export function getPublishedTrails(trails: TrailEntity[]) {
  return trails.filter((trail) => trail.status === 'published');
}

export function getTrailProgress(trail: TrailEntity, lessonProgress: Record<string, LessonProgress> | undefined) {
  const lessons = getTrackedLessons(trail);
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((lesson) => lessonProgress?.[lesson.id]?.completed).length;
  return Math.round((completed / lessons.length) * 100);
}

export function isLessonLocked(trail: TrailEntity, lessonId: string, lessonProgress: Record<string, LessonProgress> | undefined) {
  const lessons = getAllLessons(trail).sort((a, b) => a.order - b.order);
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (lessonIndex <= 0) return false;
  const previousRequiredLessons = lessons.slice(0, lessonIndex).filter((lesson) => lesson.mandatory);
  return previousRequiredLessons.some((lesson) => !lessonProgress?.[lesson.id]?.completed);
}

export function getCurrentOrNextLesson(trail: TrailEntity, lessonProgress: Record<string, LessonProgress> | undefined) {
  const lessons = getAllLessons(trail);
  return lessons.find((lesson) => lesson.mandatory && !lessonProgress?.[lesson.id]?.completed && !isLessonLocked(trail, lesson.id, lessonProgress))
    ?? lessons.find((lesson) => !lessonProgress?.[lesson.id]?.completed && !isLessonLocked(trail, lesson.id, lessonProgress))
    ?? lessons[0]
    ?? null;
}

export function getTrackedLessons(trail: TrailEntity) {
  const requiredLessons = getAllLessons(trail).filter((lesson) => lesson.mandatory);
  return requiredLessons.length > 0 ? requiredLessons : getAllLessons(trail);
}

export function getPublicationIssues(trail: TrailEntity) {
  const issues: string[] = [];
  const lessons = getAllLessons(trail);

  if (trail.modules.length === 0) issues.push('Adicione pelo menos um modulo.');
  if (lessons.length === 0) issues.push('Adicione pelo menos uma aula.');
  if (!trail.description.trim()) issues.push('Preencha a descricao da trilha.');

  trail.modules.forEach((module, moduleIndex) => {
    if (module.order !== moduleIndex + 1) issues.push('A ordem dos modulos precisa ser sequencial.');
    module.lessons.forEach((lesson, lessonIndex) => {
      if (lesson.order !== lessonIndex + 1) issues.push(`A ordem das aulas do modulo "${module.title}" precisa ser sequencial.`);
      if (!lesson.description.trim()) issues.push(`A aula "${lesson.title}" precisa de descricao.`);
      if ((!lesson.hasVideo || lesson.type !== 'video') && lesson.materials.length === 0) {
        issues.push(`A aula "${lesson.title}" exige material vinculado.`);
      }
    });
  });

  return Array.from(new Set(issues));
}
