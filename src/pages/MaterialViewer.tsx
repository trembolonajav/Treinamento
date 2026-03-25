import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Image as ImageIcon, PlaySquare, Presentation, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLessonById, getPublishedTrails, useAppState } from '@/lib/app-state';

export default function MaterialViewer() {
  const navigate = useNavigate();
  const { trailId, lessonId, materialId } = useParams();
  const { trails, isAuthenticated } = useAppState();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const trail = useMemo(
    () => getPublishedTrails(trails).find((item) => item.id === trailId) ?? null,
    [trails, trailId],
  );
  const lesson = useMemo(() => (trail ? getLessonById(trail, lessonId || '') : null), [trail, lessonId]);
  const material = lesson?.materials.find((item) => item.id === materialId) ?? null;

  if (!trail || !lesson || !material) {
    return (
      <div className="min-h-screen bg-background px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Material nao encontrado</h1>
          <p className="mt-3 text-sm text-muted-foreground">A visualizacao solicitada nao esta disponivel nesta trilha publicada.</p>
          <Button className="mt-6" onClick={() => navigate('/')}>Voltar ao portal</Button>
        </div>
      </div>
    );
  }

  const lessonHref = `/aula/${lesson.id}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Leitura do material</p>
            <h1 className="mt-1 truncate font-heading text-xl font-semibold text-foreground lg:text-2xl">{material.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{trail.title} • {lesson.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.close()}>
              Fechar aba
            </Button>
            <Button onClick={() => navigate(lessonHref)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a aula
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-6 rounded-3xl border border-border/60 bg-card p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              {getMaterialIcon(material.type)}
              {formatMaterialType(material.type)}
            </span>
            <span>{material.size}</span>
            <span>{material.date}</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {getViewerDescription(material.type)}
          </p>
        </div>

        <MaterialCanvas
          type={material.type}
          name={material.name}
          note={material.note}
          fileUrl={material.fileUrl}
          lessonTranscript={lesson.transcript}
          lessonVideoUrl={lesson.videoUrl}
        />
      </main>
    </div>
  );
}

function MaterialCanvas({
  type,
  name,
  note,
  fileUrl,
  lessonTranscript,
  lessonVideoUrl,
}: {
  type: string;
  name: string;
  note: string;
  fileUrl?: string;
  lessonTranscript?: string;
  lessonVideoUrl?: string;
}) {
  if (type === 'pdf' || type === 'slide') {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card">
        <div className="border-b border-border/60 px-6 py-4">
          <p className="text-sm font-medium text-foreground">{type === 'pdf' ? 'Documento completo' : 'Apresentacao completa'}</p>
        </div>
        {fileUrl ? (
          <iframe src={fileUrl} title={name} className="h-[calc(100vh-240px)] min-h-[780px] w-full bg-white" />
        ) : (
          <EmptyViewer title="Arquivo indisponivel" description="Nenhum arquivo local foi vinculado a este material para visualizacao." />
        )}
      </section>
    );
  }

  if (type === 'thumbnail') {
    return (
      <section className="rounded-[2rem] border border-border/60 bg-card p-6">
        {fileUrl ? (
          <img src={fileUrl} alt={name} className="mx-auto max-h-[78vh] w-full rounded-2xl object-contain" />
        ) : (
          <EmptyViewer title="Imagem indisponivel" description="Nenhuma imagem local foi vinculada a este material." />
        )}
      </section>
    );
  }

  if (type === 'video') {
    return (
      <section className="rounded-[2rem] border border-border/60 bg-card p-6">
        {lessonVideoUrl ? (
          <video src={lessonVideoUrl} controls className="w-full rounded-2xl bg-black" />
        ) : (
          <EmptyViewer title="Video indisponivel" description="Nenhum video local foi vinculado a este material." />
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card p-8 lg:p-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Modo leitura</p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">{name}</h2>
        <div className="mt-8 rounded-2xl border border-border/60 bg-background/70 p-6 lg:p-8">
          <div className="prose prose-neutral max-w-none text-foreground">
            <p className="whitespace-pre-wrap text-base leading-8 text-foreground/90">
              {note || lessonTranscript || 'Conteudo de leitura nao informado para este material.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyViewer({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function formatMaterialType(type: string) {
  return {
    pdf: 'PDF',
    slide: 'Slide',
    thumbnail: 'Imagem',
    video: 'Video complementar',
    'documento auxiliar': 'Documento',
    transcript: 'Degravacao',
    texto: 'Texto',
  }[type] || 'Material';
}

function getViewerDescription(type: string) {
  if (type === 'pdf') return 'O documento foi aberto em uma tela dedicada para leitura ampla, preservando a aula em outra aba.';
  if (type === 'slide') return 'A apresentacao foi aberta em visualizacao completa para consulta confortavel.';
  if (type === 'thumbnail') return 'A imagem de apoio foi aberta em visualizacao dedicada.';
  if (type === 'video') return 'O video complementar foi aberto em tela propria, sem interromper a aula original.';
  return 'O material foi aberto em modo leitura para consulta completa dentro da plataforma.';
}

function getMaterialIcon(type: string) {
  const iconClass = 'h-4 w-4';
  if (type === 'pdf') return <FileText className={iconClass} />;
  if (type === 'slide') return <Presentation className={iconClass} />;
  if (type === 'thumbnail') return <ImageIcon className={iconClass} />;
  if (type === 'video') return <PlaySquare className={iconClass} />;
  if (type === 'documento auxiliar' || type === 'transcript' || type === 'texto') return <ScrollText className={iconClass} />;
  return <BookOpen className={iconClass} />;
}
