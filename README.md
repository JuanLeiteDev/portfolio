# juanleitedev.com — portfólio v2

Portfólio de **Juan Leite** — *Software Engineering & Intelligent Automation*.
Construído do zero (sem código do site anterior), estático, bilingue (PT/EN) e pensado em paralelo para desktop e mobile.

---

## Arranque rápido

Requer Node ≥ 22.23 (desenvolvido com Node 24 LTS).

```sh
npm ci
npm run dev        # http://localhost:4321 com hot reload
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Build estático para `dist/` |
| `npm run serve` | Serve `dist/` como o Netlify (404 real, gzip, cache) em `:4321` |
| `npm run check` | Typecheck (`astro check`, TS estrito) |
| `npm run lint` | ESLint (TS, Astro, a11y JSX) |
| `npm test` | Playwright: Chromium, Firefox, WebKit, Pixel 7, iPhone 13 |
| `npm run audit:lh` | Lighthouse, 3 execuções por cenário, mediana → `reports/lighthouse/` (não versionado) |
| `npm run audit:bundle` | Bytes transferidos na 1.ª visita → `reports/bundle.json` (não versionado) |
| `npm run assets` | Regenera imagens OG, favicon e ícones com as fontes do site |
| `npm run verify` | check + lint + build + testes |

Screenshots de revisão: `node scripts/shots.mjs [url] --pages=/,/en/ --widths=390,1440 [--sections] [--theme=light] [--reduced]`.

---

## Stack e decisões

| Tecnologia | Uso | Nota |
|---|---|---|
| Astro 7 (SSG) | Rotas, layouts, HTML pré-renderizado | Todo o conteúdo existe sem JS |
| TypeScript 6 (strict/strictest) | Dados, componentes, scripts | TS 7 ainda não é suportado por `@astrojs/check`/`typescript-eslint` |
| React 19 | **Uma** ilha: command palette / bottom sheet (`client:idle`) | Os gatilhos funcionam antes da hidratação (fallback `#menu`) |
| Tailwind 4 + CSS custom properties | Tokens e estilos | Tokens em `src/styles/global.css` |
| TS puro (sem framework) | Descodificação do nome, retrato em glifos, contadores, rail, revelação por intenção | Nenhum re-render por frame |
| Lucide (`@lucide/astro`, `lucide-react`) | Ícones SVG, renderizados no servidor | ISC |
| Playwright + axe-core, Lighthouse | QA, acessibilidade, performance | — |

**Não usados, deliberadamente:** Motion (`motion/react`) foi avaliado e removido — as duas animações que o justificariam (destaque deslizante na palette e arrastar para fechar a sheet) fazem-se com CSS + ~40 linhas de pointer events, poupando JS. GSAP, Lenis e Three.js não acrescentavam valor que justificasse o custo. Nada de analytics, cookies ou APIs externas.

**React Bits** (MIT + Commons Clause): os componentes `DecryptedText`, `CountUp` e `ASCIIText` foram estudados como referência; os efeitos foram **reimplementados de raiz** em TS puro (sem código copiado), mantendo o padrão acessível (texto real para leitores de ecrã + camada visual `aria-hidden` + glifo fantasma contra layout shift).

---

## Estrutura

```text
src/
  i18n/index.ts            # idiomas, rotas PT/EN, âncoras, textos de interface
  data/                    # conteúdo tipado: profile, home, projects (+ media)
  layouts/Base.astro       # <head>, SEO, hreflang, JSON-LD, chrome da página
  components/
    chrome/                # Rail (desktop), TopBar + Dock (mobile), Footer, LangSwitch, ThemeToggle, CommandMenu (React)
    sections/              # Hero, Impact, Projects, Approach, Skills, Journey, Contact
    pages/                 # HomePage, ProjectPage (estudos de caso)
    ui/                    # Section, Hint, IntentTitle
  scripts/                 # main.ts (bootstrap), decode, counters, glyph-portrait, theme
  styles/global.css        # design tokens + primitivas
  pages/                   # /, /en/, /projetos/[slug]/, /en/projects/[slug]/, 404, sitemap.xml, robots.txt
public/                    # fontes WOFF2 (OFL), CV, OG, ícones
scripts/                   # serve, shots, lighthouse, bundle-report, generate-assets
tests/                     # Playwright (i18n/SEO, contacto, a11y, layout, no-JS, interações)
```

### Modelo de conteúdo

- Todo o texto visível é um par `{ pt, en }` (`type L`) — o compilador impede traduções em falta.
- Homepage com **pouco texto**: cada item tem título/palavras-chave visíveis e um resumo de uma linha revelado por **intenção** (hover/foco em desktop; toque em mobile). Sem JS, tudo fica visível. A profundidade está nos estudos de caso.
- Projetos (`src/data/projects.ts`): só factos confirmados; campos sem informação são omitidos. `pending` regista internamente o que falta confirmar (não é renderizado).
- Para trocar o CV: substituir `public/cv/juan-leite-cv-pt.pdf` (o nome é usado em `src/data/profile.ts` e no `netlify.toml`).
- Para acrescentar capturas a um projeto: colocar em `src/assets/projects/<slug>/` e adicionar a `media` do projeto (alt e legenda nos dois idiomas).

---

## Design system — "Trace"

- **Conceito:** o site como rasto de engenharia — secções indexadas (`§01`), réguas, coordenadas, colchetes, um único acento laranja-sinal. A estética hacker vive na notação, nunca sobre texto de leitura.
- **Cor:** grafite quente `#0d0e0c`, osso `#ece9e1`, sinal `#ff6b2c` (tema escuro, primário); papel técnico `#f1eee6` / tinta `#141411` / sinal `#b03a09` (tema claro, segue o sistema ou a alternância). Todos os pares de texto ≥ 4,5:1.
- **Tipografia:** Schibsted Grotesk (display/texto) + JetBrains Mono (metadados) — WOFF2 locais, subconjunto latin, OFL.
- **Movimento:** 120/240/480/900 ms; `cubic-bezier(.2,.7,.1,1)`. Assinaturas: nome descodificado, retrato em glifos (scan + lente), rail com progresso. Secundárias: contadores reais, resumos em cascata, spotlight nos cartões, régua que se desenha. `prefers-reduced-motion` remove scrambles, scan, contadores e cascatas.
- **Mobile ≠ desktop encolhido:** doca inferior ao alcance do polegar + bottom sheet com arrastar para fechar (em vez de rail + palette); hero em duas linhas com CTAs acima da dobra; resumos por toque; galeria empilhada.

---

## Publicação (Netlify)

O `netlify.toml` define o build (`npm run build` → `dist`, Node 24), os redirects de URLs antigas (`/assets/cv/cv.pdf`, `/assets/img/favicon.ico`), cabeçalhos de segurança (CSP sem terceiros) e cache imutável para `/_astro/*` e `/fonts/*`. As âncoras do site anterior continuam válidas na versão PT: `#projetos`, `#experiencia`, `#formacoes`, `#contato`, `#sobre`, `#hero`, `#skills`.

---

## Qualidade (medida em novembro de 2026, build de produção)

- Playwright em Chromium, Firefox, WebKit, Pixel 7 e iPhone 13 (emulados): i18n/SEO, contactos, acessibilidade (axe, WCAG 2.2 AA), 9 larguras de 320 a 1920 px, sem JavaScript, interações e movimento reduzido — todos a passar.
- Lighthouse (mediana de 3): desktop 100/100/100/100; mobile Performance 92–98 e 100 em Acessibilidade, Boas práticas e SEO; CLS 0.
- 1.ª visita: ~206 KiB (mobile) / ~247 KiB (desktop) transferidos; 77 KiB de JS.
- Não validado: dispositivos físicos, leitores de ecrã manuais e INP de campo.

---

## Licenças de terceiros

- Schibsted Grotesk e JetBrains Mono — SIL Open Font License 1.1 (`public/fonts/LICENSE-*.txt`).
- Lucide — ISC. React, Astro, Tailwind — MIT.
- Fotografia e capturas de ecrã — fornecidas e autorizadas por Juan Leite.
