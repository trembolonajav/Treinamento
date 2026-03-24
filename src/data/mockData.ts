// Mock data for the onboarding platform
export type LessonStatus = 'completed' | 'in-progress' | 'pending' | 'locked';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  duration: string;
  sector: string;
  updatedAt: string;
  status: LessonStatus;
  hasVideo: boolean;
  videoUrl?: string;
  materials: Material[];
  transcript?: string;
  summary?: string;
  checklist?: string[];
  faq?: { question: string; answer: string }[];
  notices?: { date: string; author: string; content: string }[];
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'slides' | 'checklist' | 'manual' | 'term' | 'transcript' | 'notice';
  size?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  modules: Module[];
  progress: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  sector: string;
  startDate: string;
  trailProgress: number;
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'paused';
  avatar?: string;
}

export const mockTrail: Trail = {
  id: '1',
  title: 'Onboarding Institucional — ABR Advogados',
  description: 'Trilha completa de integração para novos colaboradores do escritório. Conheça nossa cultura, procedimentos, sistemas e boas práticas para iniciar sua jornada com excelência.',
  totalDuration: '8h 30min',
  progress: 35,
  modules: [
    {
      id: 'm1',
      title: 'Boas-vindas e Cultura Organizacional',
      description: 'Conheça o escritório, nossa história, valores e postura profissional esperada.',
      lessons: [
        {
          id: 'l1',
          title: 'Bem-vindo à ABR Advogados',
          description: 'Apresentação institucional do escritório, seus fundadores, áreas de atuação e posicionamento no mercado jurídico.',
          objective: 'Conhecer a história, missão e valores da ABR Advogados.',
          duration: '18 min',
          sector: 'Todos os setores',
          updatedAt: '15/03/2026',
          status: 'completed',
          hasVideo: true,
          materials: [
            { id: 'mat1', title: 'Apresentação Institucional ABR', type: 'slides', size: '4.2 MB' },
            { id: 'mat2', title: 'Manual do Colaborador', type: 'manual', size: '2.8 MB' },
          ],
          summary: 'A ABR Advogados é um escritório de advocacia empresarial com atuação em Goiânia e abrangência nacional. Fundado com o objetivo de oferecer atendimento jurídico de excelência, o escritório se posiciona como referência em direito empresarial, tributário, trabalhista e consultivo. A equipe é composta por advogados experientes e qualificados, comprometidos com a entrega de soluções estratégicas e personalizadas para cada cliente.',
          checklist: [
            'Assistir ao vídeo de boas-vindas',
            'Ler o Manual do Colaborador',
            'Anotar dúvidas para a reunião de integração',
          ],
          faq: [
            { question: 'Qual é o horário de funcionamento do escritório?', answer: 'O escritório funciona de segunda a sexta, das 8h às 18h.' },
            { question: 'Como acesso os sistemas internos?', answer: 'As credenciais serão fornecidas pelo setor de TI no primeiro dia.' },
          ],
          notices: [
            { date: '10/03/2026', author: 'Supervisão RH', content: 'Lembrete: todos os novos colaboradores devem concluir esta trilha em até 15 dias úteis.' },
          ],
        },
        {
          id: 'l2',
          title: 'Cultura e Postura Profissional',
          description: 'Diretrizes de conduta, dress code, comunicação interna e postura esperada de um colaborador ABR.',
          objective: 'Compreender os padrões de conduta e postura profissional do escritório.',
          duration: '22 min',
          sector: 'Todos os setores',
          updatedAt: '12/03/2026',
          status: 'completed',
          hasVideo: true,
          materials: [
            { id: 'mat3', title: 'Código de Conduta ABR', type: 'pdf', size: '1.5 MB' },
            { id: 'mat4', title: 'Guia de Dress Code', type: 'pdf', size: '890 KB' },
          ],
          summary: 'O escritório ABR preza pela excelência no atendimento e pela postura profissional de todos os seus colaboradores. A comunicação deve ser sempre formal e respeitosa, tanto internamente quanto com clientes.',
          checklist: [
            'Ler o Código de Conduta',
            'Revisar orientações de dress code',
            'Assinar termo de ciência',
          ],
        },
      ],
    },
    {
      id: 'm2',
      title: 'Sistemas e Procedimentos Internos',
      description: 'Aprenda a utilizar os sistemas do escritório e os procedimentos operacionais padronizados.',
      lessons: [
        {
          id: 'l3',
          title: 'Uso dos Sistemas Internos',
          description: 'Tutorial completo dos sistemas utilizados no escritório: gestão processual, controle de prazos, comunicação e documentos.',
          objective: 'Dominar as ferramentas tecnológicas utilizadas no dia a dia do escritório.',
          duration: '35 min',
          sector: 'Todos os setores',
          updatedAt: '14/03/2026',
          status: 'in-progress',
          hasVideo: true,
          materials: [
            { id: 'mat5', title: 'Manual dos Sistemas — Guia Rápido', type: 'pdf', size: '3.1 MB' },
            { id: 'mat6', title: 'POP — Cadastro de Processos', type: 'pdf', size: '1.2 MB' },
            { id: 'mat7', title: 'Checklist de Configuração Inicial', type: 'checklist', size: '450 KB' },
          ],
          transcript: 'Nesta aula, vamos conhecer os principais sistemas utilizados no escritório ABR Advogados. O primeiro sistema que vamos abordar é o nosso software de gestão processual, que é a ferramenta central para o acompanhamento de todos os processos e prazos judiciais. O acesso será fornecido pelo setor de TI e cada colaborador receberá credenciais individuais...',
          summary: 'Esta aula apresenta os sistemas internos do escritório ABR, incluindo gestão processual, controle de prazos e documentos. O colaborador aprende a navegar, cadastrar processos e configurar notificações.',
          checklist: [
            'Acessar o sistema de gestão processual',
            'Configurar perfil e notificações',
            'Realizar cadastro teste de processo',
            'Verificar integração com e-mail',
            'Testar controle de prazos',
          ],
          faq: [
            { question: 'Esqueci minha senha, o que faço?', answer: 'Abra um chamado pelo portal de suporte interno ou contate o setor de TI.' },
            { question: 'Posso acessar os sistemas de casa?', answer: 'Sim, via VPN. As instruções de configuração estão no Manual de Sistemas.' },
          ],
          notices: [
            { date: '13/03/2026', author: 'TI', content: 'Atualização do sistema de gestão processual agendada para 20/03. Funcionalidades de prazo terão novo layout.' },
          ],
        },
        {
          id: 'l4',
          title: 'Procedimentos Documentais',
          description: 'Padrões de elaboração, revisão, nomenclatura e arquivamento de documentos jurídicos.',
          objective: 'Seguir os padrões de documentação do escritório com precisão.',
          duration: '28 min',
          sector: 'Jurídico / Administrativo',
          updatedAt: '10/03/2026',
          status: 'pending',
          hasVideo: true,
          materials: [
            { id: 'mat8', title: 'POP — Elaboração de Documentos', type: 'pdf', size: '2.0 MB' },
            { id: 'mat9', title: 'Modelos de Documentos Padrão', type: 'manual', size: '5.4 MB' },
          ],
          checklist: [
            'Ler o POP de Elaboração de Documentos',
            'Baixar modelos padrão',
            'Praticar nomenclatura correta',
          ],
        },
      ],
    },
    {
      id: 'm3',
      title: 'Atendimento e Relacionamento',
      description: 'Padrões de atendimento ao cliente, sigilo profissional e comunicação.',
      lessons: [
        {
          id: 'l5',
          title: 'Atendimento ao Cliente',
          description: 'Diretrizes de atendimento premium ao cliente: abordagem, comunicação, follow-up e encerramento.',
          objective: 'Atender clientes com excelência seguindo os padrões ABR.',
          duration: '25 min',
          sector: 'Todos os setores',
          updatedAt: '08/03/2026',
          status: 'pending',
          hasVideo: true,
          materials: [
            { id: 'mat10', title: 'Manual de Atendimento ao Cliente', type: 'manual', size: '1.8 MB' },
          ],
        },
        {
          id: 'l6',
          title: 'Sigilo Profissional e LGPD',
          description: 'Obrigações éticas, sigilo profissional e conformidade com a Lei Geral de Proteção de Dados.',
          objective: 'Compreender e cumprir as obrigações de sigilo e proteção de dados.',
          duration: '30 min',
          sector: 'Todos os setores',
          updatedAt: '05/03/2026',
          status: 'locked',
          hasVideo: true,
          materials: [
            { id: 'mat11', title: 'Política de Privacidade Interna', type: 'pdf', size: '980 KB' },
            { id: 'mat12', title: 'Termo de Confidencialidade', type: 'term', size: '320 KB' },
          ],
        },
      ],
    },
    {
      id: 'm4',
      title: 'Comunicação e Suporte',
      description: 'Canais de comunicação, abertura de chamados e boas práticas operacionais.',
      lessons: [
        {
          id: 'l7',
          title: 'Fluxo de Comunicação Interna',
          description: 'Canais oficiais, hierarquia de comunicação, uso de e-mail, mensageria e reuniões.',
          objective: 'Utilizar corretamente os canais de comunicação do escritório.',
          duration: '15 min',
          sector: 'Todos os setores',
          updatedAt: '01/03/2026',
          status: 'locked',
          hasVideo: false,
          materials: [
            { id: 'mat13', title: 'Guia de Comunicação Interna', type: 'pdf', size: '1.1 MB' },
          ],
        },
        {
          id: 'l8',
          title: 'Abertura de Chamados e Suporte',
          description: 'Como solicitar suporte técnico, abrir chamados e acompanhar solicitações internas.',
          objective: 'Resolver demandas operacionais de forma eficiente usando os canais de suporte.',
          duration: '12 min',
          sector: 'Todos os setores',
          updatedAt: '28/02/2026',
          status: 'locked',
          hasVideo: true,
          materials: [
            { id: 'mat14', title: 'Manual de Suporte Interno', type: 'pdf', size: '750 KB' },
          ],
        },
        {
          id: 'l9',
          title: 'Boas Práticas Operacionais',
          description: 'Orientações gerais para produtividade, organização e boas práticas no dia a dia do escritório.',
          objective: 'Adotar hábitos e práticas que contribuam para a excelência operacional.',
          duration: '20 min',
          sector: 'Todos os setores',
          updatedAt: '25/02/2026',
          status: 'locked',
          hasVideo: true,
          materials: [
            { id: 'mat15', title: 'Guia de Boas Práticas', type: 'pdf', size: '1.3 MB' },
            { id: 'mat16', title: 'Comunicado — Novas Diretrizes 2026', type: 'notice', size: '290 KB' },
          ],
        },
      ],
    },
  ],
};

export const mockCollaborators: Collaborator[] = [
  { id: 'c1', name: 'Ana Carolina Mendes', email: 'ana.mendes@abradvogados.com.br', sector: 'Jurídico', startDate: '01/03/2026', trailProgress: 78, completedLessons: 7, totalLessons: 9, status: 'active' },
  { id: 'c2', name: 'Ricardo Oliveira', email: 'ricardo.oliveira@abradvogados.com.br', sector: 'Administrativo', startDate: '10/03/2026', trailProgress: 35, completedLessons: 3, totalLessons: 9, status: 'active' },
  { id: 'c3', name: 'Mariana Costa', email: 'mariana.costa@abradvogados.com.br', sector: 'Jurídico', startDate: '15/02/2026', trailProgress: 100, completedLessons: 9, totalLessons: 9, status: 'completed' },
  { id: 'c4', name: 'Felipe Nascimento', email: 'felipe.nascimento@abradvogados.com.br', sector: 'Tributário', startDate: '18/03/2026', trailProgress: 12, completedLessons: 1, totalLessons: 9, status: 'active' },
  { id: 'c5', name: 'Juliana Ferreira', email: 'juliana.ferreira@abradvogados.com.br', sector: 'Trabalhista', startDate: '05/03/2026', trailProgress: 55, completedLessons: 5, totalLessons: 9, status: 'paused' },
];

export function getAllLessons(trail: Trail): Lesson[] {
  return trail.modules.flatMap(m => m.lessons);
}

export function getCurrentLesson(trail: Trail): Lesson | undefined {
  return getAllLessons(trail).find(l => l.status === 'in-progress');
}

export function getNextLesson(trail: Trail): Lesson | undefined {
  const lessons = getAllLessons(trail);
  const currentIdx = lessons.findIndex(l => l.status === 'in-progress');
  if (currentIdx >= 0 && currentIdx < lessons.length - 1) {
    return lessons[currentIdx + 1];
  }
  return lessons.find(l => l.status === 'pending');
}
