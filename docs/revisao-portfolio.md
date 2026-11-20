# Revisão de estrutura e textos (PT/EN)

Branch: `revisao/estrutura-e-textos`. Critérios: skills `interactive-portfolio` (estrutura, case studies), `copywriting` (reescrita) e `copy-editing` (passagem final), com os ajustes de `prompt-revisao-portfolio.md`. Neste site o "produto" é o Juan, o público são recrutadores e equipas técnicas, e a conversão é contacto, entrevista ou download do CV.

## 1. Diagnóstico confirmado no código

| Ponto | Onde | Confirmado |
|---|---|---|
| Analisador de logs e XI.Repair aparecem em Impacto **e** em Projetos | `Impact.astro`, `Projects.astro`, `home.ts › impact` | Sim |
| "Falha em produção" e "Processos web internos" só existem em Impacto, sem case study | `home.ts › impact.cases` | Sim |
| Ordem: Início → Impacto → Projetos → Abordagem → Competências → Percurso → Contacto | `i18n › sectionOrder` (alimenta rail, dock, menu de comandos, footer e índices §NN) | Sim |
| Cinco passos genéricos em "Como trabalho" | `home.ts › approach.steps` | Sim |
| Legenda de 5 níveis, com "prática declarada" | `home.ts › evidenceLabel`, `Skills.astro` | Sim |
| "Word · Excel" em Automação; "Android" sem explicação | `home.ts › skills` | Sim. Android aparece em doc 01 §6 como "contacto profissional com Android e equipamentos em produção" |
| Case studies com secções diferentes (analisador sem Decisões técnicas; PS2 sem Decisões; XI.Support sem Contexto) | `projects.ts` | Sim |
| Links GitHub do Mini Shell e PS2 | Já existem nos case studies (`projects.ts › links`); faltam no cartão da homepage | Sim |
| Mecanismo de autenticação do XI.Support | Documentado no case study: JWT, 2FA (TOTP) e passkeys | Sim, deixa de ser "dado em falta" |
| PAP (máquina de cocktails) | Não existe no repositório; facto dado no prompt | Acrescentar |
| CV em inglês | Só existe `public/cv/juan-leite-cv-pt.pdf` (e `docs/cv.pdf`). Nenhuma fonte editável | Pendente |
| Âncora `#contato` | `i18n › sectionIds.contact.pt`, testes | Sim |
| "Suporte técnico N1" vs "Suporte Técnico N1" | `home.ts › hero.meta` vs `journey` | Sim |
| Rótulo "ai · AI as an engineering tool" | `Approach.astro` (prefixo `ai ·` fixo, em inglês mesmo na página PT) | Sim |
| Nome do hero no texto extraído "Juan LeiteJuanLeite" | `Hero.astro`: o nome visual já é `aria-hidden` (leitores de ecrã anunciam uma vez), mas as duas linhas não têm espaço entre si | Parcial: corrigir o espaço |
| "Ir para" + `CtrlK` | `Rail.astro`: nome acessível do botão é só "Ir para" | Sim |
| Seletor de idioma "PTIdioma atual: Português/ENEnglish" | `LangSwitch.astro`: texto `sr-only` colado ao rótulo visual | Sim |
| "Menu— Abrir menu" vs "Juan Leite — página inicial" | `Dock.astro`, `Rail.astro`, `TopBar.astro`, `Skills.astro` | Sim |
| Meta description igual à og:description e genérica | `Base.astro` usa a mesma string; home com ~200 caracteres; projetos usam o `summary` do cartão | Sim |

## 2. Decisões

1. **Impacto + Projetos → uma secção "Projetos".** O analisador de logs passa a ser o cartão em destaque (métricas, captura e link), seguido das linhas dos restantes projetos. O analisador passa a ser o primeiro projeto do array, para a numeração (01–05) e o "Próximo projeto" baterem certo. A frase do XI.Repair que só existia em Impacto ("do papel para uma app offline") passa para o tagline do cartão.
2. **"Falha em produção" e "Processos web internos" vão para o Percurso**, como factos da entrada Eleven Systems. Não são projetos (não têm case study, capturas nem stack próprios) e, dentro de Projetos, ficariam a competir com os cartões que têm prova. No Percurso dão substância à experiência, que hoje é só um título.
3. **Nova ordem:** Início → Projetos → Percurso → Competências → Como trabalho → Contacto. As âncoras antigas `#impacto`/`#impact` e `#contato` ficam como aliases invisíveis, para não partir links externos já partilhados; nenhuma referência interna as usa.
4. **"Como trabalho" reduzido:** os cinco passos ficam condensados numa linha de introdução. O bloco "IA como ferramenta de engenharia" mantém-se com quatro práticas de uma linha cada. **Não liguei o bloco a um projeto**: nenhum case study documenta o uso de agentes de IA, e ligá-lo a este portfólio exigiria publicar material interno (o `PROMPT.md` está no `.gitignore`). Fica em "Dados em falta".
5. **Competências em três níveis** (profissional / projetos / académico). Reclassificação:
   - `C#` e `JavaScript` retirados: não há evidência no repositório além de "fundamentos" (doc 01 §6). Ficam em "Dados em falta" para o Juan indicar onde os usou.
   - `HTML · CSS` → académico (formação complementar de 200 h, listada no Percurso).
   - `SQL` → académico (bases de dados no IPCA).
   - IA aplicada (prompts e contexto, agentes, multiagente) → **projetos**. Os três itens são práticas usadas no desenvolvimento, não profissionais nem académicas; "projetos" é a categoria mais honesta das três. Ressalva no PR.
   - `Word · Excel` retirado da Automação.
   - `Android` mantido em Sistemas, com o motivo no resumo da área: equipamentos Android em produção no suporte da Eleven Systems (doc 01 §6).
6. **Modelo único de case study:** Contexto → O meu papel → Solução → Decisões técnicas → Resultado, com a Stack na ficha lateral (que já existe em todas as páginas). Secções sem dados confirmados são omitidas, como já fazia o `ProjectPage`, e registadas em "Dados em falta".
7. **Links para código:** os cartões ganham uma linha "Código": link para o GitHub (Mini Shell, PS2) ou "privado" (XI.Repair, analisador, XI.Support). O cartão inteiro já é um link, por isso o link do GitHub fica fora dele, para não aninhar links.
8. **CTAs uniformizados:** "Vamos falar" / "Let's talk" no hero e no título do contacto. O botão do dock continua com o nome da secção ("Contacto").
9. **Separadores nos textos acessíveis:** passam a vírgula ("Juan Leite, página inicial"; "Python, profissional").
10. **Meta descriptions:** home e cada case study com descrição própria (menos de 160 caracteres) nas duas línguas. A og:description continua a usar o mesmo texto, que agora é específico por página.

### Recomendações não aplicadas

- **Commits `content(pt)` e `content(en)` separados:** todo o texto vive em pares `{ pt, en }` na mesma linha, e o TypeScript obriga a ter as duas línguas. Separar por língua deixaria um commit intermédio com as línguas dessincronizadas. Os commits de conteúdo são por tema, com as duas línguas juntas.
- **Tempo exato do analisador e "antes/depois":** mantém-se "em minutos", que é o que está documentado.

## 3. Lista de alterações

- [ ] `refactor(home)`: juntar Impacto e Projetos, Percurso com os destaques da Eleven Systems, reordenar secções, reduzir "Como trabalho", âncora `#contacto`
- [ ] `refactor(projetos)`: modelo único de case study, analisador em primeiro, links de código nos cartões
- [ ] `content`: textos da homepage e dos case studies (PT-PT e EN nativo)
- [ ] `content(skills)`: três níveis e reclassificação
- [ ] `fix(a11y)`: nome do hero, botão "Ir para", seletor de idioma, separadores
- [ ] `chore(seo)`: meta descriptions por página
- [ ] Testes Playwright atualizados (âncoras, número de secções, índice do dock)
