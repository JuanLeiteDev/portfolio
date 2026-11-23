import type { ImageMetadata } from 'astro';
import type { L } from '@/i18n';
import xiRepairDashboard from '@/assets/projects/xi-repair/dashboard.png';
import xiRepairComponents from '@/assets/projects/xi-repair/components.png';
import xiRepairRepairs from '@/assets/projects/xi-repair/repairs.png';
import logQuality from '@/assets/projects/log-analyzer/quality.png';
import logPerspective from '@/assets/projects/log-analyzer/perspective.png';
import supportUsers from '@/assets/projects/xi-support/users.png';
import support2fa from '@/assets/projects/xi-support/2fa.png';
import ps2Dashboard from '@/assets/projects/ps2/dashboard.png';
import ps2Cli from '@/assets/projects/ps2/cli.png';
import miniShellSession from '@/assets/projects/mini-shell/session.png';

/**
 * Selected projects and case studies.
 *
 * Rules (doc 01 §4): only confirmed information. Fields without verified
 * content are omitted, never filled with plausible-sounding text; what is
 * missing is tracked in `pending` (not rendered) and in the review PR.
 * Sources are noted per project.
 */

export type ProjectKind = 'professional' | 'project' | 'academic';

export const kindLabel: Record<ProjectKind, L> = {
  professional: { pt: 'Profissional', en: 'Professional' },
  project: { pt: 'Projeto', en: 'Project' },
  academic: { pt: 'Académico', en: 'Academic' },
};

export interface CaseBlock {
  /** Paragraphs. */
  body?: L<string[]>;
  /** Bullet points. */
  points?: L<string[]>;
}

/**
 * One model for every case study, always rendered in this order:
 * context (problem and its cost) → my role → solution → technical
 * decisions → result. The stack lives in the facts sidebar.
 */
export interface CaseStudy {
  context?: CaseBlock;
  role?: CaseBlock;
  solution: CaseBlock;
  decisions?: CaseBlock;
  result?: CaseBlock;
}

export const caseOrder = ['context', 'role', 'solution', 'decisions', 'result'] as const;

export const caseHeadings: Record<(typeof caseOrder)[number], L> = {
  context: { pt: 'Contexto', en: 'Context' },
  role: { pt: 'O meu papel', en: 'My role' },
  solution: { pt: 'Solução', en: 'Solution' },
  decisions: { pt: 'Decisões técnicas', en: 'Technical decisions' },
  result: { pt: 'Resultado', en: 'Result' },
};

/** Screenshot supplied and authorised by Juan (sensitive columns anonymised by him). */
export interface ProjectMedia {
  src: ImageMetadata;
  alt: L;
  caption: L;
}

export interface Project {
  slug: string;
  name: L;
  year: string;
  kind: ProjectKind;
  /** Organisation or academic context. */
  context: L;
  /** Platform / nature, e.g. "Desktop · offline". */
  platform: L;
  /** Short tagline always visible on the home index. */
  tagline: L;
  /** One-line summary revealed on hover/focus on the home index. */
  summary: L;
  /** Meta description of the case study page (< 160 characters). */
  description: L;
  /** Short paragraph shown under the title on the case study. */
  lede: L;
  stack: string[];
  /** Still in development: shown as a live status on the home card. */
  ongoing?: boolean;
  status: L;
  study: CaseStudy;
  links: { label: L; href: string }[];
  media?: ProjectMedia[];
  /** Internal note on what still needs Juan's confirmation (not rendered). */
  pending?: string;
}

const ROLE_ELEVEN: L<string[]> = {
  pt: ['Desenvolvi a ferramenta na Eleven Systems, em paralelo com as funções de Suporte Técnico N1.'],
  en: ['I built it at Eleven Systems alongside my L1 Technical Support duties.'],
};

const all: Project[] = [
  // Source: doc 01 §3 (caso de impacto) + CV (scale). Screenshots supplied by Juan,
  // identifiers anonymised by him. Streamlit and the visible domain confirmed public by Juan (20/11/2026).
  {
    slug: 'log-analyzer',
    name: { pt: 'Analisador de logs', en: 'Log analyser' },
    tagline: { pt: 'Diagnóstico de incidentes a partir de logs', en: 'Incident diagnosis from log files' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · ferramenta interna', en: 'Eleven Systems · internal tool' },
    platform: { pt: 'Python · Streamlit · dashboard', en: 'Python · Streamlit · dashboard' },
    summary: {
      pt: 'Ferramenta em Python que processa milhares de ficheiros de log e mostra numa dashboard onde os problemas se repetem.',
      en: 'A Python tool that processes thousands of log files and shows on a dashboard where problems recur.',
    },
    description: {
      pt: 'Analisador de logs em Python e Streamlit: mais de 10 000 ficheiros e 5 milhões de linhas processados em menos de 3 minutos. Estudo de caso de Juan Leite.',
      en: 'A Python and Streamlit log analyser: more than 10,000 files and 5 million lines processed in under 3 minutes. Case study by Juan Leite.',
    },
    lede: {
      pt: 'Uma ferramenta em Python que processa grandes volumes de logs e mostra, numa dashboard, onde os problemas se repetem.',
      en: 'A Python tool that processes large volumes of logs and shows, on a dashboard, where problems keep coming back.',
    },
    stack: ['Python', 'Streamlit'],
    status: { pt: 'Uso interno. Código e dados privados.', en: 'Internal use. Code and data are private.' },
    study: {
      context: {
        body: {
          pt: ['No suporte técnico da Eleven Systems, investigar um incidente obrigava a analisar volumes elevados de logs.'],
          en: ['In technical support at Eleven Systems, investigating an incident meant going through large volumes of logs.'],
        },
      },
      role: { body: ROLE_ELEVEN },
      solution: {
        points: {
          pt: [
            'Processa os ficheiros de log em Python e guarda cada análise.',
            'Mostra a qualidade de cada importação: ficheiros incluídos e falhados, linhas lidas e reconhecidas, e o período analisado.',
            'Apresenta uma perspetiva geral, por dispositivo e por motorista, com gráficos que mostram onde os problemas se repetem.',
            'Mantém o histórico de análises e exporta os resultados para Excel.',
          ],
          en: [
            'Processes the log files in Python and stores each analysis.',
            'Reports the quality of every import: files included and failed, lines read and recognised, and the period covered.',
            'Offers an overall view plus per-device and per-driver views, with charts that show where problems recur.',
            'Keeps a history of analyses and exports the results to Excel.',
          ],
        },
      },
      decisions: {
        points: {
          pt: [
            'Dashboard em Streamlit, escrita no mesmo Python que processa os logs. A ferramenta fica toda numa só linguagem.',
            'Indicadores de qualidade em cada importação, para saber que parte dos logs entrou na análise antes de confiar nos resultados.',
          ],
          en: [
            'A Streamlit dashboard, written in the same Python that processes the logs, so the whole tool stays in one language.',
            'Quality indicators on every import, so I know how much of the log data made it into the analysis before I trust the results.',
          ],
        },
      },
      result: {
        body: {
          pt: [
            'Em 2026, a ferramenta processou mais de 10 000 ficheiros e 5 milhões de linhas de logs em menos de 3 minutos. As vistas por dispositivo e por motorista mostram onde os problemas se repetem e apoiam o diagnóstico de incidentes.',
          ],
          en: [
            'In 2026 the tool processed more than 10,000 files and 5 million log lines in under 3 minutes. The per-device and per-driver views show where problems recur and support incident diagnosis.',
          ],
        },
      },
    },
    links: [],
    media: [
      {
        src: logQuality,
        alt: {
          pt: 'Ecrã do analisador de logs com o histórico de análises concluídas e os indicadores de qualidade da importação: ficheiros incluídos, ficheiros falhados, percentagem de linhas reconhecidas, linhas lidas e reconhecidas, e período dos ficheiros.',
          en: 'Log analyser screen with the history of completed analyses and the import quality indicators: included files, failed files, share of recognised lines, lines read and recognised, and file period.',
        },
        caption: {
          pt: 'Qualidade de cada importação e histórico de análises. Identificadores anonimizados.',
          en: 'Quality of each import and analysis history. Identifiers anonymised.',
        },
      },
      {
        src: logPerspective,
        alt: {
          pt: 'Perspetiva geral do analisador com os totais de serviços e dispositivos analisados, os dispositivos que exigem avaliação e gráficos de barras por dispositivo.',
          en: 'Overall view of the analyser with totals of services and devices analysed, devices that need assessment and bar charts per device.',
        },
        caption: {
          pt: 'Perspetivas por dispositivo e por motorista, que mostram onde os problemas se repetem.',
          en: 'Per-device and per-driver views, showing where problems recur.',
        },
      },
    ],
    // Processing time (< 3 min) confirmed by Juan (2026-11-20).
    pending: 'Analysis time before the tool; cost of the problem (context).',
  },

  // Source: doc 01 §3–4 (most recent) + CV (context). Stack per doc 01.
  {
    slug: 'xi-repair',
    name: { pt: 'XI.Repair', en: 'XI.Repair' },
    tagline: { pt: 'Reparações: do papel para uma app', en: 'Repairs moved from paper to an app' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · ferramenta interna', en: 'Eleven Systems · internal tool' },
    platform: { pt: 'Desktop · Windows · offline', en: 'Desktop · Windows · offline' },
    summary: {
      pt: 'Aplicação desktop offline que acompanha cada reparação, da receção do equipamento à expedição.',
      en: 'An offline desktop app that tracks every repair, from equipment intake to shipping.',
    },
    description: {
      pt: 'XI.Repair: aplicação desktop offline em Python, Qt e SQLite para gerir reparações. 1 543 reparações registadas até novembro de 2026.',
      en: 'XI.Repair: an offline desktop app in Python, Qt and SQLite for managing repairs. 1,543 repairs recorded by November 2026.',
    },
    lede: {
      pt: 'Uma aplicação para Windows que acompanha cada equipamento desde a receção até à conclusão e expedição, num só sítio e sem depender de servidores.',
      en: 'A Windows app that follows each piece of equipment from intake to completion and shipping, in one place and with no server behind it.',
    },
    stack: ['Python', 'Qt', 'SQLite'],
    status: { pt: 'Uso interno. Código e dados privados.', en: 'Internal use. Code and data are private.' },
    study: {
      context: {
        body: {
          pt: ['Na Eleven Systems, o processo de manutenção de equipamentos estava distribuído por fichas, documentos e registos manuais.'],
          en: ['At Eleven Systems, equipment maintenance was spread across job sheets, documents and manual records.'],
        },
      },
      role: {
        body: {
          pt: ['Desenvolvi a aplicação na Eleven Systems, em paralelo com as funções de Suporte Técnico N1.'],
          en: ['I built the application at Eleven Systems alongside my L1 Technical Support duties.'],
        },
      },
      solution: {
        points: {
          pt: [
            'Juntei clientes, equipamentos e fichas de trabalho numa só aplicação.',
            'Organizei cada reparação num único fluxo, com as intervenções técnicas, os componentes substituídos e o controlo de qualidade.',
            'Automatizei a geração de documentos Word e de relatórios Excel.',
            'Criei um ecrã de análise dos componentes substituídos, com filtros e exportação.',
            'Fiz a interface em português de Portugal, para utilização individual.',
          ],
          en: [
            'I brought customers, equipment and job sheets together in one application.',
            'Each repair follows a single flow covering technical work, replaced components and quality control.',
            'I automated the generation of Word documents and Excel reports.',
            'I built an analysis screen for replaced components, with filters and export.',
            'The interface is in European Portuguese and designed for a single user.',
          ],
        },
      },
      decisions: {
        points: {
          pt: [
            'Tudo offline, com SQLite local. A aplicação tem um só utilizador, por isso não precisa de servidor nem de serviços cloud.',
            'Cada reparação tem um estado (nas instalações, em espera, em manutenção, pronto para envio). É isso que permite ao dashboard contar as reparações em curso por estado.',
            'O modelo de dados liga a cada reparação as suas intervenções, a checklist e a informação técnica do equipamento.',
            'Interface desktop em Qt, com o código organizado em camadas e coberto por testes automatizados.',
            'Builds para Windows x86 e x64, para correr em máquinas de 32 e de 64 bits.',
          ],
          en: [
            'Fully offline, with a local SQLite database. The app has a single user, so it needs no server or cloud service.',
            'Every repair has a state (on site, waiting, in maintenance, ready to ship), which is what lets the dashboard count ongoing repairs by state.',
            'The data model links each repair to its interventions, its checklist and the technical details of the equipment.',
            'A Qt desktop interface, with the code split into layers and covered by automated tests.',
            'Builds for Windows x86 and x64, so it runs on both 32-bit and 64-bit machines.',
          ],
        },
      },
      result: {
        body: {
          pt: ['1 543 reparações registadas na aplicação até novembro de 2026, num só fluxo e sem papel.'],
          en: ['1,543 repairs recorded in the application by November 2026, in a single flow and without paper.'],
        },
      },
    },
    links: [],
    media: [
      {
        src: xiRepairDashboard,
        alt: {
          pt: 'Dashboard do XI.Repair com contadores por estado (nas instalações, em espera, em manutenção, pronto para envio) e uma tabela de reparações em curso com ficha, cliente, estado e data de entrada.',
          en: 'XI.Repair dashboard with counters per state (on site, waiting, in maintenance, ready to ship) and a table of ongoing repairs with job sheet, customer, state and intake date.',
        },
        caption: {
          pt: 'Dashboard com as reparações em curso por estado. Dados de clientes anonimizados.',
          en: 'Dashboard with ongoing repairs by state. Customer data anonymised.',
        },
      },
      {
        src: xiRepairComponents,
        alt: {
          pt: 'Ecrã de análise de componentes do XI.Repair com os totais de peças substituídas, equipamentos distintos e fichas, e uma tabela de componentes por quantidade.',
          en: 'XI.Repair component analysis screen with totals of replaced parts, distinct equipment and job sheets, and a table of components by quantity.',
        },
        caption: {
          pt: 'Análise de componentes substituídos, com filtros e exportação. Modelos e códigos anonimizados.',
          en: 'Replaced-component analysis, with filters and export. Models and part codes anonymised.',
        },
      },
      {
        src: xiRepairRepairs,
        alt: {
          pt: 'Lista de reparações do XI.Repair com pesquisa, filtro por estado e colunas de ficha, cliente, datas de entrada e saída, número de série e modelo.',
          en: 'XI.Repair repairs list with search, a state filter and columns for job sheet, customer, intake and exit dates, serial number and model.',
        },
        caption: {
          pt: 'Lista de reparações, com pesquisa em todas as colunas e filtros por campo. Dados de clientes anonimizados.',
          en: 'Repairs list, with search across all columns and per-field filters. Customer data anonymised.',
        },
      },
    ],
    pending: 'Start of the period behind the 1,543 repairs; number of users; reason for the layered architecture.',
  },

  // Source: CV (Projetos) + Juan (20/11/2026): developed at Eleven Systems, still in
  // development there (Juan leaves in December 2026); nothing public, so no repository linked.
  {
    slug: 'xi-support',
    name: { pt: 'XI.Support', en: 'XI.Support' },
    tagline: { pt: 'Tickets com JWT, 2FA e passkeys', en: 'Tickets with JWT, 2FA and passkeys' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · backend e autenticação', en: 'Eleven Systems · backend and authentication' },
    platform: { pt: 'Web · API REST', en: 'Web · REST API' },
    summary: {
      pt: 'Sistema web de tickets de suporte, com foco no backend: API REST, autenticação e infraestrutura.',
      en: 'A web-based support ticket system, focused on the backend: REST API, authentication and infrastructure.',
    },
    description: {
      pt: 'XI.Support: sistema de tickets com API REST em FastAPI, autenticação com JWT, 2FA e passkeys, e PostgreSQL. Em desenvolvimento na Eleven Systems.',
      en: 'XI.Support: a ticket system with a FastAPI REST API, JWT, 2FA and passkey authentication, and PostgreSQL. In development at Eleven Systems.',
    },
    lede: {
      pt: 'Um sistema de tickets de suporte construído a partir do backend: API, autenticação, persistência relacional e anexos.',
      en: 'A support ticket system built backend-first: API, authentication, relational persistence and attachments.',
    },
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'Pydantic', 'Alembic', 'PostgreSQL', 'Redis', 'MinIO', 'Docker', 'pytest'],
    status: { pt: 'Em desenvolvimento na Eleven Systems. Código privado.', en: 'In development at Eleven Systems. Code is private.' },
    study: {
      role: {
        body: {
          pt: ['Desenvolvo o sistema na Eleven Systems, com foco no backend: API, autenticação e infraestrutura.'],
          en: ["I'm building the system at Eleven Systems, focusing on the backend: API, authentication and infrastructure."],
        },
      },
      solution: {
        points: {
          pt: [
            'A API REST gere utilizadores e tickets.',
            'A autenticação usa JWT, verificação de dois fatores (TOTP, com códigos de recuperação) e passkeys.',
            'Os utilizadores têm perfis (administrador, cliente), estados e ações de acesso.',
            'Os dados ficam numa base relacional e os tickets aceitam anexos.',
          ],
          en: [
            'The REST API manages users and tickets.',
            'Authentication uses JWT, two-factor verification (TOTP, with recovery codes) and passkeys.',
            'Users have roles (administrator, customer), states and access actions.',
            'Data lives in a relational database and tickets accept attachments.',
          ],
        },
      },
      decisions: {
        points: {
          pt: [
            'FastAPI com Pydantic, para que a validação dos dados de entrada fique nos próprios modelos da API.',
            'SQLAlchemy sobre PostgreSQL, com o esquema versionado em migrações Alembic.',
            'Ambiente em Docker e testes com pytest.',
          ],
          en: [
            'FastAPI with Pydantic, so input validation lives in the API models themselves.',
            'SQLAlchemy on PostgreSQL, with the schema versioned through Alembic migrations.',
            'A Docker environment and a pytest test suite.',
          ],
        },
      },
    },
    links: [],
    media: [
      {
        src: supportUsers,
        alt: {
          pt: 'Ecrã de utilizadores do XI.Support: lista com perfil (administrador ou cliente), estado ativo e ações de acesso, com pesquisa e filtros.',
          en: 'XI.Support users screen: a list with role (administrator or customer), active state and access actions, with search and filters.',
        },
        caption: {
          pt: 'Utilizadores com perfis, estados e permissões de acesso. Dados pessoais anonimizados.',
          en: 'Users with roles, states and access permissions. Personal data anonymised.',
        },
      },
      {
        src: support2fa,
        alt: {
          pt: 'Ecrã de verificação de dois fatores do XI.Support, que pede o código de 6 dígitos da aplicação de autenticação e oferece a opção de código de recuperação.',
          en: 'XI.Support two-factor verification screen asking for the 6-digit authenticator code, with a recovery-code option.',
        },
        caption: {
          pt: 'Verificação de dois fatores (TOTP) com códigos de recuperação.',
          en: 'Two-factor verification (TOTP) with recovery codes.',
        },
      },
    ],
    pending: 'Context (problem the system solves and its cost); result; role of Redis and MinIO.',
  },

  // Source: github.com/JuanLeiteDev/mini-shell-file-system (README, 2026-11-20).
  // Role: the repository has a single contributor, JuanLeiteDev (48 commits, GitHub API, 2026-11-20).
  {
    slug: 'mini-shell',
    name: { pt: 'Mini Shell File System', en: 'Mini Shell File System' },
    tagline: { pt: 'Shell em C sobre chamadas POSIX', en: 'A shell in C built on raw POSIX calls' },
    year: '2026',
    kind: 'academic',
    context: { pt: 'UPCA · Sistemas Operativos', en: 'UPCA · Operating Systems' },
    platform: { pt: 'CLI · C · POSIX', en: 'CLI · C · POSIX' },
    summary: {
      pt: 'Interpretador de comandos e ferramentas de ficheiros em C, escritos apenas com chamadas ao sistema POSIX.',
      en: 'A command interpreter and file tools in C, written using only POSIX system calls.',
    },
    description: {
      pt: 'Mini Shell File System: interpretador de comandos em C com oito comandos, fork e execve, redirecionamento e pipes. Trabalho de Sistemas Operativos na UPCA.',
      en: 'Mini Shell File System: a command interpreter in C with eight commands, fork and execve, redirection and pipes. Operating Systems coursework at UPCA.',
    },
    lede: {
      pt: 'Um pequeno sistema de gestão de ficheiros com interpretador próprio, escrito em C sem funções de alto nível da libc e sem system().',
      en: 'A small file-management system with its own interpreter, written in C without high-level libc functions and without system().',
    },
    stack: ['C', 'POSIX', 'Make', 'Docker'],
    status: { pt: 'Concluído. Código público.', en: 'Completed. Code is public.' },
    study: {
      context: {
        body: {
          pt: ['Trabalho prático de Sistemas Operativos da Licenciatura em Engenharia de Sistemas Informáticos, UPCA, 2025/26.'],
          en: ['Operating Systems coursework for the Computer Systems Engineering degree, UPCA, 2025/26.'],
        },
      },
      role: {
        body: {
          pt: ['Sou o único autor do repositório: escrevi os comandos, o interpretador e a configuração de build e de Docker.'],
          en: ["I'm the sole author of the repository: I wrote the commands, the interpreter and the build and Docker setup."],
        },
      },
      solution: {
        points: {
          pt: [
            'Implementei oito comandos (mostra, copia, acrescenta, conta, apaga, informa, lista e procura) com open, read, write, close, stat e opendir/readdir.',
            'O interpretador tem prompt próprio e executa os comandos com fork, execve e wait.',
            'Suporta redirecionamento de entrada e saída e um pipe simples entre dois comandos.',
            'Os erros são reportados em stderr.',
          ],
          en: [
            'I implemented eight commands (named in Portuguese: mostra, copia, acrescenta, conta, apaga, informa, lista, procura) with open, read, write, close, stat and opendir/readdir.',
            'The interpreter has its own prompt and runs commands through fork, execve and wait.',
            'It supports input and output redirection and a simple pipe between two commands.',
            'Errors go to stderr.',
          ],
        },
      },
      decisions: {
        points: {
          pt: [
            'Só chamadas ao sistema POSIX, sem funções de alto nível da libc nem system(). Os descritores de ficheiro e os processos são geridos diretamente.',
            'Makefile que compila para build/bin.',
            'Imagem Docker que arranca diretamente no interpretador.',
          ],
          en: [
            'POSIX system calls only, with no high-level libc functions and no system(), so file descriptors and processes are handled directly.',
            'A Makefile that builds into build/bin.',
            'A Docker image that boots straight into the interpreter.',
          ],
        },
      },
      // Grade confirmed by Juan (2026-11-20).
      result: {
        body: {
          pt: ['Trabalho avaliado com 20 valores em 20 (2025/26).'],
          en: ['The project was graded 20 out of 20 (2025/26).'],
        },
      },
    },
    links: [
      {
        label: { pt: 'Repositório no GitHub', en: 'GitHub repository' },
        href: 'https://github.com/JuanLeiteDev/mini-shell-file-system',
      },
    ],
    // Rendered by scripts/render-terminal.mjs from the README example session (verbatim).
    media: [
      {
        src: miniShellSession,
        alt: {
          pt: 'Terminal com uma sessão do interpretador: o comando lista /home, o comando mostra com redirecionamento de saída para copia.txt e o comando termina, cada um com código de saída 0.',
          en: 'Terminal with an interpreter session: the lista /home command, the mostra command redirecting output to copia.txt and the termina command, each exiting with code 0.',
        },
        caption: {
          pt: 'Ilustração da sessão de exemplo do README do repositório. Não é uma captura de ecrã.',
          en: 'Illustration of the example session in the repository README. Not a screenshot.',
        },
      },
    ],
  },

  // Source: github.com/JuanLeiteDev/ProjetoPS2 (README, 2026-11-20).
  // Role and grade confirmed by Juan (2026-11-20): he built the metrics dashboard; graded 20/20.
  {
    slug: 'ps2',
    name: { pt: 'PS2 · Débitos diretos', en: 'PS2 · Direct debits' },
    tagline: { pt: 'Validação de dados bancários e geração de ficheiros PS2', en: 'Bank data validation and PS2 file generation' },
    year: '2026',
    kind: 'academic',
    context: { pt: 'UPCA · projeto académico em equipa', en: 'UPCA · academic team project' },
    platform: { pt: 'CLI · dashboard', en: 'CLI · dashboard' },
    summary: {
      pt: 'Validação de dados bancários e geração de ficheiros PS2 em C, com análise de métricas numa dashboard em Python.',
      en: 'Bank data validation and PS2 file generation in C, with metrics analysed on a Python dashboard.',
    },
    description: {
      pt: 'Projeto académico em equipa: validação de NIF e NIB e geração de ficheiros PS2 de débito direto em C, com uma dashboard de métricas em Python.',
      en: 'Academic team project: NIF and NIB validation and PS2 direct-debit file generation in C, with a Python metrics dashboard.',
    },
    lede: {
      pt: 'Automatizar a cobrança mensal por débito direto: ler ficheiros, validar clientes, calcular valores e gerar um ficheiro PS2 pronto a enviar ao banco.',
      en: 'Automating monthly direct-debit billing: read the input files, validate customers, compute amounts and produce a PS2 file ready to send to the bank.',
    },
    stack: ['C', 'Python', 'Shiny', 'Make', 'Doxygen', 'LaTeX'],
    status: { pt: 'Concluído. Código público.', en: 'Completed. Code is public.' },
    study: {
      context: {
        body: {
          pt: [
            'Projeto em equipa da Licenciatura em Engenharia de Sistemas Informáticos (UPCA, 2025/26). Uma empresa fictícia de eletricidade, a «IPCA Energy», quer automatizar a cobrança mensal por débito direto.',
            'O programa tem de ler os ficheiros de clientes, consumos e preçário, calcular o valor a faturar e gerar um único ficheiro PS2 apenas com os clientes que têm NIF e NIB válidos.',
          ],
          en: [
            'Team project for the Computer Systems Engineering degree (UPCA, 2025/26). A fictional electricity company, “IPCA Energy”, wants to automate monthly billing through direct debit.',
            'The program has to read the customer, consumption and pricing files, compute each bill and produce a single PS2 file containing only customers with a valid NIF (tax ID) and NIB (bank account number).',
          ],
        },
      },
      role: {
        body: {
          pt: ['Na equipa, desenvolvi a dashboard de métricas em Python.'],
          en: ['Within the team, I built the Python metrics dashboard.'],
        },
      },
      solution: {
        points: {
          pt: [
            'O programa em C lê os ficheiros de entrada e gera o ficheiro PS2 estruturado.',
            'Em Python, os dados são validados e analisados numa dashboard de métricas: consistência, erros e conformidade.',
            'Corre pela linha de comandos ou pela dashboard.',
          ],
          en: [
            'The C program reads the input files and generates the structured PS2 file.',
            'Python validates the data and analyses it on a metrics dashboard covering consistency, errors and compliance.',
            'It runs from the command line or from the dashboard.',
          ],
        },
      },
      decisions: {
        points: {
          pt: [
            'C e Python com papéis separados: o C lê os ficheiros e gera o PS2; o Python valida e analisa os dados.',
            'Documentação do código gerada com Doxygen e relatório escrito em LaTeX.',
          ],
          en: [
            'C and Python have separate jobs: C reads the files and writes the PS2 output, Python validates and analyses the data.',
            'Code documentation generated with Doxygen, and the report written in LaTeX.',
          ],
        },
      },
      result: {
        body: {
          pt: ['Projeto avaliado com 20 valores em 20 (2025/26).'],
          en: ['The project was graded 20 out of 20 (2025/26).'],
        },
      },
    },
    links: [
      {
        label: { pt: 'Repositório no GitHub', en: 'GitHub repository' },
        href: 'https://github.com/JuanLeiteDev/ProjetoPS2',
      },
    ],
    media: [
      {
        src: ps2Dashboard,
        alt: {
          pt: 'Dashboard PS2 com indicadores de total válido, registos, créditos e débitos, informação do ficheiro, um gráfico de gastos por cliente e uma tabela de detalhes e validação.',
          en: 'PS2 dashboard with indicators for valid total, records, credits and debits, file information, a spend-per-customer chart and a details and validation table.',
        },
        caption: {
          pt: 'Dashboard de métricas com totais, gastos por cliente e a validação de cada registo. Dados de teste do enunciado.',
          en: 'Metrics dashboard with totals, spend per customer and the validation of each record. Test data from the assignment.',
        },
      },
      {
        src: ps2Cli,
        alt: {
          pt: 'Saída da CLI do projeto PS2 com o resumo por ficheiro, os totais globais e o detalhe dos movimentos com indicação de validade.',
          en: 'PS2 project CLI output with the per-file summary, global totals and movement details with a validity flag.',
        },
        caption: {
          pt: 'A mesma análise pela linha de comandos.',
          en: 'The same analysis from the command line.',
        },
      },
    ],

  },
];

/** Display order: the featured log analyser first, then by relevance. */
const order = ['log-analyzer', 'xi-repair', 'xi-support', 'mini-shell', 'ps2'];
export const projects: Project[] = order.map((slug) => all.find((p) => p.slug === slug)!);

export const getProject = (slug: string): Project | undefined => projects.find((p) => p.slug === slug);
