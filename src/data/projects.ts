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
 * content are omitted, never filled with plausible-sounding text.
 * Sources are noted per project.
 */

export type ProjectKind = 'professional' | 'project' | 'academic';

export const kindLabel: Record<ProjectKind, L> = {
  professional: { pt: 'Profissional', en: 'Professional' },
  project: { pt: 'Projeto', en: 'Project' },
  academic: { pt: 'Académico', en: 'Academic' },
};

export interface CaseSection {
  heading: L;
  /** Paragraphs. */
  body?: L<string[]>;
  /** Bullet points. */
  points?: L<string[]>;
}

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
  /** 3–5 word tagline always visible on the home index. */
  tagline: L;
  /** One-line summary revealed on hover/focus on the home index. */
  summary: L;
  /** Short paragraph shown under the title on the case study. */
  lede: L;
  stack: string[];
  status: L;
  sections: CaseSection[];
  links: { label: L; href: string }[];
  media?: ProjectMedia[];
  /** Internal note on what still needs Juan's confirmation (not rendered). */
  pending?: string;
}

const H = {
  context: { pt: 'Contexto', en: 'Context' },
  problem: { pt: 'Problema', en: 'Problem' },
  solution: { pt: 'Solução', en: 'Solution' },
  contribution: { pt: 'Contribuição', en: 'Contribution' },
  decisions: { pt: 'Decisões técnicas', en: 'Technical decisions' },
} satisfies Record<string, L>;

const all: Project[] = [
  // Source: doc 01 §3–4 (most recent) + CV (context). Stack per doc 01.
  {
    slug: 'xi-repair',
    name: { pt: 'XI.Repair', en: 'XI.Repair' },
    tagline: { pt: 'Gestão de reparações, offline', en: 'Offline repair management' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · ferramenta interna', en: 'Eleven Systems · internal tool' },
    platform: { pt: 'Desktop · Windows · offline', en: 'Desktop · Windows · offline' },
    summary: {
      pt: 'Aplicação desktop offline que centraliza clientes, equipamentos e reparações — da receção à expedição.',
      en: 'Offline desktop application that centralises customers, equipment and repairs — from intake to shipping.',
    },
    lede: {
      pt: 'Uma aplicação para Windows que acompanha o percurso de cada equipamento, desde a receção até à conclusão e expedição, num único sítio e sem depender de servidores.',
      en: 'A Windows application that follows each piece of equipment from intake to completion and shipping, in one place and without relying on servers.',
    },
    stack: ['Python', 'Qt', 'SQLite'],
    status: {
      pt: 'Uso interno — código e dados não públicos',
      en: 'Internal use — code and data are not public',
    },
    sections: [
      {
        heading: H.context,
        body: {
          pt: [
            'Na Eleven Systems, o processo de manutenção de equipamentos estava distribuído por fichas, documentos e registos manuais.',
          ],
          en: [
            'At Eleven Systems, the equipment maintenance process was spread across job sheets, documents and manual records.',
          ],
        },
      },
      {
        heading: H.solution,
        body: {
          pt: [
            'O XI.Repair reúne clientes, equipamentos e fichas de trabalho, e acompanha cada reparação desde a receção até à conclusão e expedição.',
          ],
          en: [
            'XI.Repair brings customers, equipment and job sheets together, and tracks each repair from intake to completion and shipping.',
          ],
        },
        points: {
          pt: [
            'Fichas de trabalho, intervenções técnicas, componentes substituídos e controlo de qualidade num só fluxo.',
            'Geração automática de documentos Word e relatórios Excel.',
            'Análise dos componentes substituídos.',
            'Interface em português de Portugal, para utilização individual.',
          ],
          en: [
            'Job sheets, technical interventions, replaced components and quality control in a single flow.',
            'Automatic generation of Word documents and Excel reports.',
            'Analysis of replaced components.',
            'European Portuguese interface, designed for single-user operation.',
          ],
        },
      },
      {
        heading: H.decisions,
        points: {
          pt: [
            'Totalmente offline, com armazenamento local em SQLite — sem servidores nem serviços cloud.',
            'Interface desktop em Qt.',
            'Modelação de dados do fluxo de reparação: estados, intervenções, checklist e informação técnica dos equipamentos.',
            'Arquitetura em camadas e testes automatizados.',
            'Distribuição para Windows x86 e x64.',
          ],
          en: [
            'Fully offline, with local SQLite storage — no servers or cloud services.',
            'Qt desktop interface.',
            'Data model for the repair flow: states, interventions, checklist and technical equipment data.',
            'Layered architecture and automated tests.',
            'Distribution for Windows x86 and x64.',
          ],
        },
      },
      {
        heading: { pt: 'Resultado', en: 'Result' },
        body: {
          pt: ['1 543 reparações registadas na aplicação até novembro de 2026, num único fluxo e sem papel.'],
          en: ['1,543 repairs recorded in the application by November 2026, in a single flow and without paper.'],
        },
      },
    ],
    links: [],
    media: [
      {
        src: xiRepairDashboard,
        alt: {
          pt: 'Dashboard do XI.Repair: contadores por estado (nas instalações, em espera, em manutenção, pronto para envio) e tabela de reparações em curso com ficha, cliente, estado e data de entrada.',
          en: 'XI.Repair dashboard: counters per state (on site, waiting, in maintenance, ready to ship) and a table of ongoing repairs with job sheet, customer, state and intake date.',
        },
        caption: {
          pt: 'Dashboard — reparações em curso por estado. Dados de clientes anonimizados.',
          en: 'Dashboard — ongoing repairs by state. Customer data anonymised.',
        },
      },
      {
        src: xiRepairComponents,
        alt: {
          pt: 'Ecrã de análise de componentes do XI.Repair: totais de peças substituídas, equipamentos distintos e fichas, e tabela de componentes por quantidade.',
          en: 'XI.Repair component analysis screen: totals of replaced parts, distinct equipment and job sheets, and a table of components by quantity.',
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
          en: 'XI.Repair repairs list with search, state filter and columns for job sheet, customer, intake and exit dates, serial number and model.',
        },
        caption: {
          pt: 'Reparações — pesquisa em todas as colunas e filtros por campo. Dados de clientes anonimizados.',
          en: 'Repairs — search across all columns and per-field filters. Customer data anonymised.',
        },
      },
    ],
  },

  // Source: doc 01 §3 (caso de impacto) + CV (scale). Screenshots supplied by Juan,
  // identifiers anonymised by him. Streamlit and the visible domain confirmed public by Juan (20/11/2026).
  {
    slug: 'log-analyzer',
    name: { pt: 'Analisador de logs', en: 'Log analyser' },
    tagline: { pt: 'Milhões de linhas, em minutos', en: 'Millions of lines, in minutes' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · ferramenta interna', en: 'Eleven Systems · internal tool' },
    platform: { pt: 'Python · Streamlit · dashboard', en: 'Python · Streamlit · dashboard' },
    summary: {
      pt: 'Processa mais de 10.000 ficheiros e 5 milhões de linhas de logs em minutos e apresenta os resultados numa dashboard.',
      en: 'Processes more than 10,000 files and 5 million log lines in minutes and presents the results on a dashboard.',
    },
    lede: {
      pt: 'Uma ferramenta em Python que transforma volumes enormes de logs em indicadores claros para diagnosticar incidentes e decidir.',
      en: 'A Python tool that turns huge volumes of logs into clear indicators to diagnose incidents and make decisions.',
    },
    stack: ['Python', 'Streamlit'],
    status: { pt: 'Uso interno — código e dados não públicos', en: 'Internal use — code and data are not public' },
    sections: [
      {
        heading: H.context,
        body: {
          pt: ['No suporte técnico da Eleven Systems, investigar incidentes exigia analisar volumes elevados de informação técnica.'],
          en: ['In technical support at Eleven Systems, investigating incidents meant analysing large volumes of technical information.'],
        },
      },
      {
        heading: H.solution,
        points: {
          pt: [
            'Processamento de logs em Python: mais de 10.000 ficheiros e 5 milhões de linhas, em minutos.',
            'Indicadores de qualidade de cada importação: ficheiros incluídos e falhados, linhas lidas e reconhecidas, período analisado.',
            'Perspetivas geral, por dispositivo e por motorista, com gráficos que mostram onde os problemas se repetem.',
            'Histórico de análises e exportação para Excel.',
          ],
          en: [
            'Python log processing: more than 10,000 files and 5 million lines, in minutes.',
            'Quality indicators for every import: included and failed files, lines read and recognised, period covered.',
            'General, per-device and per-driver views, with charts showing where problems recur.',
            'Analysis history and Excel export.',
          ],
        },
      },
      {
        heading: { pt: 'Valor', en: 'Value' },
        body: {
          pt: ['Facilita a análise e apoia a tomada de decisão no diagnóstico de incidentes.'],
          en: ['Makes analysis easier and supports decision-making when diagnosing incidents.'],
        },
      },
    ],
    links: [],
    media: [
      {
        src: logQuality,
        alt: {
          pt: 'Ecrã do analisador de logs: histórico de análises concluídas e indicadores de qualidade da importação — ficheiros incluídos, ficheiros falhados, percentagem de linhas reconhecidas, linhas lidas e reconhecidas, e período dos ficheiros.',
          en: 'Log analyser screen: history of completed analyses and import quality indicators — included files, failed files, share of recognised lines, lines read and recognised, and file period.',
        },
        caption: {
          pt: 'Qualidade de cada importação e histórico de análises. Identificadores anonimizados.',
          en: 'Quality of each import and analysis history. Identifiers anonymised.',
        },
      },
      {
        src: logPerspective,
        alt: {
          pt: 'Perspetiva geral do analisador: totais de serviços e dispositivos analisados, dispositivos que exigem avaliação e gráficos de barras por dispositivo.',
          en: 'General view of the analyser: totals of services and devices analysed, devices that need assessment and bar charts per device.',
        },
        caption: {
          pt: 'Perspetivas por dispositivo e motorista — onde os problemas se repetem.',
          en: 'Per-device and per-driver views — where problems recur.',
        },
      },
    ],
  },

  // Source: CV (Projetos) + Juan (20/11/2026): developed at Eleven Systems, still in
  // development there (Juan leaves in December 2026); nothing public, so no repository linked.
  {
    slug: 'xi-support',
    name: { pt: 'XI.Support', en: 'XI.Support' },
    tagline: { pt: 'Tickets com autenticação forte', en: 'Tickets with strong authentication' },
    year: '2026',
    kind: 'professional',
    context: { pt: 'Eleven Systems · backend e autenticação', en: 'Eleven Systems · backend and authentication' },
    platform: { pt: 'Web · API REST', en: 'Web · REST API' },
    summary: {
      pt: 'Sistema web de tickets de suporte, com foco em arquitetura backend, autenticação e infraestrutura.',
      en: 'Web-based support ticket system, focused on backend architecture, authentication and infrastructure.',
    },
    lede: {
      pt: 'Um sistema de tickets de suporte construído a partir do backend: API, autenticação forte, persistência relacional e anexos.',
      en: 'A support ticket system built from the backend out: API, strong authentication, relational persistence and attachments.',
    },
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'Pydantic', 'Alembic', 'PostgreSQL', 'Redis', 'MinIO', 'Docker', 'pytest'],
    status: {
      pt: 'Em desenvolvimento na Eleven Systems — código não público',
      en: 'In development at Eleven Systems — code not public',
    },
    sections: [
      {
        heading: H.solution,
        points: {
          pt: [
            'API REST para gestão de utilizadores e tickets.',
            'Autenticação com JWT, 2FA e passkeys.',
            'Persistência relacional e armazenamento de anexos.',
          ],
          en: [
            'REST API for user and ticket management.',
            'Authentication with JWT, 2FA and passkeys.',
            'Relational persistence and attachment storage.',
          ],
        },
      },
      {
        heading: { pt: 'Interface', en: 'Interface' },
        points: {
          pt: [
            'Gestão de utilizadores com perfis (administrador, cliente), estados e ações de acesso.',
            'Verificação de dois fatores com código da aplicação de autenticação e códigos de recuperação.',
          ],
          en: [
            'User management with roles (administrator, customer), states and access actions.',
            'Two-factor verification with an authenticator-app code and recovery codes.',
          ],
        },
      },
      {
        heading: H.decisions,
        points: {
          pt: [
            'FastAPI e Pydantic para a API e validação de dados.',
            'SQLAlchemy com migrações Alembic sobre PostgreSQL.',
            'Ambiente em Docker e testes com pytest.',
          ],
          en: [
            'FastAPI and Pydantic for the API and data validation.',
            'SQLAlchemy with Alembic migrations on PostgreSQL.',
            'Docker environment and pytest test suite.',
          ],
        },
      },
    ],
    links: [],
    media: [
      {
        src: supportUsers,
        alt: {
          pt: 'Ecrã de utilizadores do XI.Support: lista com perfil (administrador ou cliente), estado ativo e ações de acesso, com pesquisa e filtros.',
          en: 'XI.Support users screen: list with role (administrator or customer), active state and access actions, with search and filters.',
        },
        caption: {
          pt: 'Utilizadores — perfis, estados e permissões de acesso. Dados pessoais anonimizados.',
          en: 'Users — roles, states and access permissions. Personal data anonymised.',
        },
      },
      {
        src: support2fa,
        alt: {
          pt: 'Ecrã de verificação de dois fatores do XI.Support, a pedir o código de 6 dígitos da aplicação de autenticação, com opção de código de recuperação.',
          en: 'XI.Support two-factor verification screen asking for the 6-digit authenticator code, with a recovery-code option.',
        },
        caption: {
          pt: 'Verificação de dois fatores (TOTP) com códigos de recuperação.',
          en: 'Two-factor verification (TOTP) with recovery codes.',
        },
      },
    ],
  },

  // Source: github.com/JuanLeiteDev/mini-shell-file-system (README, 2026-11-20).
  {
    slug: 'mini-shell',
    name: { pt: 'Mini Shell File System', en: 'Mini Shell File System' },
    tagline: { pt: 'Shell em C, só chamadas POSIX', en: 'A C shell on POSIX calls only' },
    year: '2026',
    kind: 'academic',
    context: { pt: 'IPCA · Sistemas Operativos', en: 'IPCA · Operating Systems' },
    platform: { pt: 'CLI · C · POSIX', en: 'CLI · C · POSIX' },
    summary: {
      pt: 'Interpretador de comandos e ferramentas de ficheiros em C puro, só com chamadas ao sistema POSIX.',
      en: 'Command interpreter and file tools in plain C, using only POSIX system calls.',
    },
    lede: {
      pt: 'Um mini-sistema de gestão de ficheiros com interpretador próprio, escrito em C sem funções de alto nível da libc e sem system().',
      en: 'A small file-management system with its own interpreter, written in C without high-level libc functions and without system().',
    },
    stack: ['C', 'POSIX', 'Make', 'Docker'],
    status: { pt: 'Concluído · código público', en: 'Completed · public code' },
    sections: [
      {
        heading: H.context,
        body: {
          pt: ['Trabalho prático de Sistemas Operativos da Licenciatura em Engenharia de Sistemas Informáticos, IPCA, 2025/26.'],
          en: ['Operating Systems coursework for the Computer Systems Engineering degree, IPCA, 2025/26.'],
        },
      },
      {
        heading: H.solution,
        points: {
          pt: [
            'Oito comandos — mostra, copia, acrescenta, conta, apaga, informa, lista e procura — implementados com open, read, write, close, stat e opendir/readdir.',
            'Interpretador com prompt próprio que executa comandos via fork, execve e wait.',
            'Redirecionamento de entrada e saída e pipe simples entre dois comandos.',
            'Erros reportados em stderr.',
          ],
          en: [
            'Eight commands (named in Portuguese: mostra, copia, acrescenta, conta, apaga, informa, lista, procura) implemented with open, read, write, close, stat and opendir/readdir.',
            'Interpreter with its own prompt that runs commands through fork, execve and wait.',
            'Input and output redirection, plus a simple pipe between two commands.',
            'Errors reported on stderr.',
          ],
        },
      },
      {
        heading: H.decisions,
        points: {
          pt: ['Compilação com Makefile para build/bin.', 'Imagem Docker que arranca diretamente no interpretador.'],
          en: ['Makefile build into build/bin.', 'Docker image that boots straight into the interpreter.'],
        },
      },
    ],
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
          pt: 'Ilustração da sessão de exemplo do README do repositório — não é uma captura de ecrã.',
          en: 'Illustration of the example session in the repository README — not a screenshot.',
        },
      },
    ],
  },

  // Source: github.com/JuanLeiteDev/ProjetoPS2 (README, 2026-11-20).
  // Two accounts contributed; individual contribution not confirmed → omitted.
  {
    slug: 'ps2',
    name: { pt: 'PS2 · Débitos diretos', en: 'PS2 · Direct debits' },
    tagline: { pt: 'Dados bancários validados e gerados', en: 'Bank data validated and generated' },
    year: '2026',
    kind: 'academic',
    context: { pt: 'IPCA · projeto académico em equipa', en: 'IPCA · academic team project' },
    platform: { pt: 'CLI · dashboard', en: 'CLI · dashboard' },
    summary: {
      pt: 'Validação de dados bancários e geração de ficheiros PS2 em C, com análise de métricas numa dashboard em Python.',
      en: 'Bank data validation and PS2 file generation in C, with metrics analysed in a Python dashboard.',
    },
    lede: {
      pt: 'Automatizar a cobrança mensal por débito direto: ler ficheiros, validar clientes, calcular valores e gerar um ficheiro PS2 pronto a enviar ao banco.',
      en: 'Automating monthly direct-debit billing: read files, validate customers, compute amounts and generate a PS2 file ready to send to the bank.',
    },
    stack: ['C', 'Python', 'Shiny', 'Make', 'Doxygen', 'LaTeX'],
    status: { pt: 'Concluído · código público', en: 'Completed · public code' },
    sections: [
      {
        heading: H.context,
        body: {
          pt: [
            'Projeto em equipa da Licenciatura em Engenharia de Sistemas Informáticos (IPCA, 2025/26). Uma empresa fictícia de eletricidade, a «IPCA Energy», pretende automatizar a cobrança mensal através de débito direto.',
          ],
          en: [
            'Team project for the Computer Systems Engineering degree (IPCA, 2025/26). A fictional electricity company, “IPCA Energy”, wants to automate monthly billing through direct debit.',
          ],
        },
      },
      {
        heading: H.problem,
        body: {
          pt: [
            'Ler ficheiros com clientes, consumos e preçário, calcular o valor a faturar e gerar um único ficheiro PS2 — incluindo apenas clientes com NIF e NIB válidos.',
          ],
          en: [
            'Read files with customers, consumption and pricing, compute each bill and generate a single PS2 file — including only customers with a valid NIF (tax ID) and NIB (bank ID).',
          ],
        },
      },
      {
        heading: H.solution,
        points: {
          pt: [
            'C para ler os ficheiros de entrada e gerar o ficheiro PS2 estruturado.',
            'Python para validação e manipulação de dados, com uma dashboard de métricas para analisar consistência, erros e conformidade.',
            'Execução por CLI ou pela dashboard; documentação gerada com Doxygen e relatório em LaTeX.',
          ],
          en: [
            'C to read the input files and generate the structured PS2 file.',
            'Python for data validation and handling, with a metrics dashboard to analyse consistency, errors and compliance.',
            'Runs from a CLI or the dashboard; documentation generated with Doxygen and a LaTeX report.',
          ],
        },
      },
    ],
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
          pt: 'Dashboard PS2: indicadores de total válido, registos, créditos e débitos, informação do ficheiro, gráfico de gastos por cliente e tabela de detalhes e validação.',
          en: 'PS2 dashboard: indicators for valid total, records, credits and debits, file information, a spend-per-customer chart and a details and validation table.',
        },
        caption: {
          pt: 'Dashboard de métricas: totais, gastos por cliente e validação de cada registo. Dados de teste do enunciado.',
          en: 'Metrics dashboard: totals, spend per customer and validation of each record. Test data from the assignment.',
        },
      },
      {
        src: ps2Cli,
        alt: {
          pt: 'Saída da CLI do projeto PS2: resumo por ficheiro, totais globais e detalhe dos movimentos com indicação de validade.',
          en: 'PS2 project CLI output: per-file summary, global totals and movement details with validity flag.',
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
